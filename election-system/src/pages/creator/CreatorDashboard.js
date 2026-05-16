import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function CreatorSidebar() {
  const location = useLocation();
  const links = [
    { to:'/creator', label:'📊 Dashboard', exact: true },
    { to:'/creator/new', label:'➕ New Election' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-section">Creator Panel</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${(l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to) && l.to !== '/creator') ? 'active' : ''}`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export { CreatorSidebar };

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [reqForm, setReqForm] = useState({ purpose:'', organization:'', phone: profile?.phone || '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (profile?.role === 'election_creator' || profile?.role === 'super_admin') {
        const { data } = await supabase.from('elections').select('*').eq('creator_id', user.id).order('created_at', { ascending: false });
        setElections(data || []);
      } else {
        const { data } = await supabase.from('creator_requests').select('*').eq('user_id', user.id).single();
        setRequestStatus(data);
      }
      setLoading(false);
    }
    if (user && profile) load();
  }, [user, profile]);

  async function submitRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('creator_requests').insert({
      user_id: user.id, email: profile.email,
      ...reqForm
    });
    setSubmitting(false);
    setShowRequestForm(false);
    setRequestStatus({ status: 'pending' });
  }

  if (loading) return <LoadingSpinner fullPage />;

  if (profile?.role === 'voter') {
    return (
      <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div className="card" style={{ maxWidth:'500px', width:'100%', textAlign:'center' }}>
          {requestStatus ? (
            <>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>{requestStatus.status === 'pending' ? '⏳' : requestStatus.status === 'approved' ? '✅' : '❌'}</div>
              <h2>Application {requestStatus.status}</h2>
              <p style={{ color:'var(--text2)', marginTop:'8px' }}>
                {requestStatus.status === 'pending' ? 'Your request is under review by the admin.' :
                 requestStatus.status === 'rejected' ? `Reason: ${requestStatus.rejection_reason}` :
                 'You have been approved as an election creator!'}
              </p>
            </>
          ) : showRequestForm ? (
            <>
              <h2 style={{ marginBottom:'20px' }}>Apply to Create Elections</h2>
              <form onSubmit={submitRequest} style={{ textAlign:'left' }}>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input className="form-control" value={reqForm.organization} onChange={e => setReqForm({...reqForm, organization:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" value={reqForm.phone} onChange={e => setReqForm({...reqForm, phone:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose / Description</label>
                  <textarea className="form-control" rows={4} value={reqForm.purpose} onChange={e => setReqForm({...reqForm, purpose:e.target.value})} required placeholder="Describe why you need to create elections..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏛️</div>
              <h2>Become an Election Creator</h2>
              <p style={{ color:'var(--text2)', margin:'12px 0 24px' }}>Submit a request to the admin to get election creation privileges.</p>
              <button className="btn btn-primary" style={{ justifyContent:'center' }} onClick={() => setShowRequestForm(true)}>
                Apply Now →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <CreatorSidebar />
      <div className="dashboard-content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1>My Elections</h1>
            <p style={{ color:'var(--text2)', marginTop:'4px' }}>Manage and monitor your elections</p>
          </div>
          <Link to="/creator/new" className="btn btn-primary">➕ New Election</Link>
        </div>

        <div className="grid-3" style={{ marginBottom:'32px' }}>
          <div className="stat-card"><div className="stat-value">{elections.length}</div><div className="stat-label">Total Elections</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color:'var(--danger)' }}>{elections.filter(e=>e.status==='active').length}</div><div className="stat-label">Active</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color:'var(--success)' }}>{elections.filter(e=>e.status==='completed').length}</div><div className="stat-label">Completed</div></div>
        </div>

        {elections.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'48px' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🗳️</div>
            <h3>No elections yet</h3>
            <p style={{ color:'var(--text2)', margin:'8px 0 20px' }}>Create your first election to get started</p>
            <Link to="/creator/new" className="btn btn-primary">Create Election</Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Status</th><th>Max Voters</th><th>Dates</th><th>Actions</th></tr></thead>
                <tbody>
                  {elections.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight:500 }}>{e.title}</td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                      <td style={{ color:'var(--text2)' }}>{e.max_voters}</td>
                      <td style={{ fontSize:'12px', color:'var(--text2)' }}>
                        {new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <Link to={`/creator/election/${e.id}/candidates`} className="btn btn-outline btn-sm">Candidates</Link>
                          <Link to={`/creator/election/${e.id}/voters`} className="btn btn-outline btn-sm">Voters</Link>
                          <Link to={`/creator/election/${e.id}/control`} className="btn btn-primary btn-sm">Control</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
