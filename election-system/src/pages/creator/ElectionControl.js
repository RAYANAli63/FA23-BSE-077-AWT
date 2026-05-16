import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function ElectionControl() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single()
      .then(({ data }) => { setElection(data); setLoading(false); });
  }, [id]);

  async function setStatus(newStatus) {
    setChanging(true);
    try {
      await supabase.from('elections').update({ status: newStatus }).eq('id', id);
      await supabase.from('audit_logs').insert({
        actor_id: user.id, action: `election_${newStatus}`,
        entity_type: 'election', entity_id: id
      });
      setElection(prev => ({ ...prev, status: newStatus }));
      toast.success(`Election status changed to ${newStatus}`);
    } catch (err) { toast.error(err.message); }
    setChanging(false);
  }

  if (loading) return <LoadingSpinner fullPage />;

  const statusFlow = {
    draft: { next: 'published', label: '🚀 Publish', color: 'btn-primary' },
    published: { next: 'active', label: '▶️ Start Election', color: 'btn-success' },
    active: { next: 'completed', label: '⏹️ End Election', color: 'btn-danger' },
    completed: null
  };

  const current = statusFlow[election.status];

  return (
    <div className="container page">
      <div style={{ marginBottom:'24px' }}>
        <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom:'8px' }}>← Back</button>
        <h1 style={{ fontSize:'24px' }}>Election Control</h1>
        <p style={{ color:'var(--text2)' }}>{election.title}</p>
      </div>

      <div style={{ maxWidth:'600px' }}>
        <div className="card" style={{ marginBottom:'20px' }}>
          <h3 style={{ marginBottom:'16px' }}>Current Status</h3>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px', background:'var(--bg3)', borderRadius:'8px', marginBottom:'16px' }}>
            <div>
              <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'4px' }}>Status</p>
              <span className={`badge badge-${election.status}`} style={{ fontSize:'14px', padding:'6px 14px' }}>
                {election.status}
              </span>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'4px' }}>Max Voters</p>
              <span style={{ fontWeight:700, fontSize:'18px' }}>{election.max_voters}</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px', fontSize:'13px' }}>
            <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'12px' }}>
              <p style={{ color:'var(--text2)', marginBottom:'4px' }}>Start Time</p>
              <p style={{ fontWeight:500 }}>{new Date(election.start_time).toLocaleString()}</p>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'12px' }}>
              <p style={{ color:'var(--text2)', marginBottom:'4px' }}>End Time</p>
              <p style={{ fontWeight:500 }}>{new Date(election.end_time).toLocaleString()}</p>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'12px' }}>
              <p style={{ color:'var(--text2)', marginBottom:'4px' }}>Reg. Deadline</p>
              <p style={{ fontWeight:500 }}>{new Date(election.registration_deadline).toLocaleString()}</p>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'12px' }}>
              <p style={{ color:'var(--text2)', marginBottom:'4px' }}>Voter Lock</p>
              <p style={{ fontWeight:500 }}>{election.is_locked ? '🔒 Locked' : '🔓 Open'}</p>
            </div>
          </div>

          {current ? (
            <button
              className={`btn ${current.color}`}
              style={{ width:'100%', justifyContent:'center', fontSize:'16px', padding:'14px' }}
              onClick={() => setStatus(current.next)}
              disabled={changing}
            >
              {changing ? 'Processing...' : current.label}
            </button>
          ) : (
            <div className="alert alert-success" style={{ textAlign:'center' }}>
              ✅ This election has been completed.
              <button className="btn btn-outline btn-sm" style={{ marginLeft:'12px' }} onClick={() => navigate(`/results/${id}`)}>
                View Results
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom:'12px' }}>Quick Links</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={() => navigate(`/creator/election/${id}/candidates`)} className="btn btn-outline" style={{ justifyContent:'space-between' }}>Manage Candidates →</button>
            <button onClick={() => navigate(`/creator/election/${id}/voters`)} className="btn btn-outline" style={{ justifyContent:'space-between' }}>View Voter List →</button>
            <button onClick={() => navigate(`/results/${id}`)} className="btn btn-outline" style={{ justifyContent:'space-between' }}>Live Results →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
