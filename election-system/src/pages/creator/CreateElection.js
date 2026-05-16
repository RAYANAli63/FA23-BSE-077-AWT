import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { CreatorSidebar } from './CreatorDashboard';

const CATEGORIES = ['Student Body', 'Corporate', 'Political', 'Community', 'NGO', 'Academic', 'Sports', 'Other'];

export default function CreateElection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    start_time: '', end_time: '', registration_deadline: '',
    max_voters: 1000
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error('End time must be after start time'); return;
    }
    if (new Date(form.registration_deadline) >= new Date(form.start_time)) {
      toast.error('Registration deadline must be before start time'); return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('elections').insert({
        ...form,
        max_voters: parseInt(form.max_voters),
        creator_id: user.id,
        status: 'draft'
      }).select().single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_id: user.id, action: 'election_created',
        entity_type: 'election', entity_id: data.id,
        details: { title: form.title }
      });

      toast.success('Election created! Now add candidates.');
      navigate(`/creator/election/${data.id}/candidates`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-layout">
      <CreatorSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Create New Election</h1>
          <p>Set up the basic details for your election</p>
        </div>

        <div style={{ maxWidth:'680px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom:'20px' }}>
              <h3 style={{ marginBottom:'20px', fontSize:'16px', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Election Title *</label>
                <input className="form-control" value={form.title} onChange={set('title')} required placeholder="e.g. Student Union Election 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={set('description')} rows={4} placeholder="Describe the purpose and rules of this election..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="card" style={{ marginBottom:'20px' }}>
              <h3 style={{ marginBottom:'20px', fontSize:'16px', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Schedule</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input className="form-control" type="datetime-local" value={form.start_time} onChange={set('start_time')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input className="form-control" type="datetime-local" value={form.end_time} onChange={set('end_time')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Registration Deadline *</label>
                <input className="form-control" type="datetime-local" value={form.registration_deadline} onChange={set('registration_deadline')} required />
                <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>Voters must register before this date to participate.</p>
              </div>
            </div>

            <div className="card" style={{ marginBottom:'24px' }}>
              <h3 style={{ marginBottom:'20px', fontSize:'16px', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Voter Settings</h3>
              <div className="form-group">
                <label className="form-label">Maximum Number of Voters *</label>
                <input className="form-control" type="number" value={form.max_voters} onChange={set('max_voters')} min={10} max={100000} required />
                <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>Election auto-locks when this limit is reached.</p>
              </div>
            </div>

            <div style={{ display:'flex', gap:'8px' }}>
              <button type="button" onClick={() => navigate('/creator')} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:1, justifyContent:'center' }}>
                {loading ? 'Creating...' : '✓ Create Election & Add Candidates →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
