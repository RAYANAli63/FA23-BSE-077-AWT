import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function ManageCandidates() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:'', designation:'', manifesto:'', photo_url:'' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('created_at')
      ]);
      setElection(el);
      setCandidates(cands || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('candidates').update({ ...form }).eq('id', editing.id);
        setCandidates(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
        toast.success('Candidate updated');
        setEditing(null);
      } else {
        const { data, error } = await supabase.from('candidates').insert({ election_id: id, ...form }).select().single();
        if (error) throw error;
        setCandidates(prev => [...prev, data]);
        toast.success('Candidate added!');
      }
      setForm({ name:'', designation:'', manifesto:'', photo_url:'' });
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  }

  async function handleDelete(cId) {
    if (!window.confirm('Delete this candidate?')) return;
    await supabase.from('candidates').delete().eq('id', cId);
    setCandidates(prev => prev.filter(c => c.id !== cId));
    toast.success('Candidate removed');
  }

  function startEdit(c) {
    setEditing(c);
    setForm({ name:c.name, designation:c.designation||'', manifesto:c.manifesto||'', photo_url:c.photo_url||'' });
  }

  async function publishElection() {
    if (candidates.length < 2) { toast.error('Add at least 2 candidates'); return; }
    await supabase.from('elections').update({ status:'published' }).eq('id', id);
    await supabase.from('audit_logs').insert({ actor_id:user.id, action:'election_published', entity_type:'election', entity_id:id });
    toast.success('Election published! 🎉');
    navigate('/creator');
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom:'8px' }}>← Back</button>
          <h1 style={{ fontSize:'24px' }}>Candidates</h1>
          <p style={{ color:'var(--text2)' }}>{election?.title}</p>
        </div>
        {election?.status === 'draft' && candidates.length >= 2 && (
          <button className="btn btn-success" onClick={publishElection}>
            🚀 Publish Election
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px' }}>
        {/* Candidate List */}
        <div>
          <h3 style={{ marginBottom:'16px' }}>Current Candidates ({candidates.length})</h3>
          {candidates.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'32px' }}>
              <p style={{ color:'var(--text2)' }}>No candidates yet. Add candidates using the form.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {candidates.map((c, i) => (
                <div key={c.id} className="card" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'var(--bg3)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:'20px' }}>👤</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <h4 style={{ fontWeight:600 }}>{c.name}</h4>
                        {c.designation && <p style={{ fontSize:'12px', color:'var(--accent)', marginTop:'2px' }}>{c.designation}</p>}
                        {c.manifesto && <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'4px', lineHeight:1.5 }}>{c.manifesto}</p>}
                      </div>
                      <div style={{ display:'flex', gap:'6px', flexShrink:0, marginLeft:'12px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Form */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom:'16px' }}>{editing ? 'Edit Candidate' : 'Add Candidate'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={set('name')} required placeholder="Candidate name" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation / Position</label>
                <input className="form-control" value={form.designation} onChange={set('designation')} placeholder="e.g. President Candidate" />
              </div>
              <div className="form-group">
                <label className="form-label">Photo URL</label>
                <input className="form-control" value={form.photo_url} onChange={set('photo_url')} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Manifesto / Description</label>
                <textarea className="form-control" rows={4} value={form.manifesto} onChange={set('manifesto')} placeholder="Brief description or campaign manifesto..." />
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {editing && (
                  <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setForm({ name:'', designation:'', manifesto:'', photo_url:'' }); }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : '+ Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
