import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export function VoterDashboard() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('voter_registrations')
      .select('*, elections(title, status, start_time, end_time)')
      .eq('voter_id', user.id)
      .order('registered_at', { ascending: false })
      .then(({ data }) => { setRegistrations(data || []); setLoading(false); });
  }, [user]);

  const statusLabel = { registered:'Registered', finalized:'Finalized ✅', waitlisted:'Waitlisted', voted:'Voted 🗳️' };
  const statusBadge = { registered:'upcoming', finalized:'active', waitlisted:'pending', voted:'completed' };

  return (
    <div className="container page">
      <div style={{ marginBottom:'32px' }}>
        <h1>My Voter Dashboard</h1>
        <p style={{ color:'var(--text2)', marginTop:'4px' }}>Welcome back, {profile?.full_name}</p>
      </div>

      <div className="grid-3" style={{ marginBottom:'32px' }}>
        <div className="stat-card"><div className="stat-value">{registrations.length}</div><div className="stat-label">Elections Joined</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color:'var(--success)' }}>{registrations.filter(r=>r.status==='voted').length}</div><div className="stat-label">Votes Cast</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color:'var(--accent)' }}>{registrations.filter(r=>r.status==='finalized').length}</div><div className="stat-label">Pending Votes</div></div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h2 style={{ fontSize:'18px' }}>My Elections</h2>
        <Link to="/" className="btn btn-outline btn-sm">Browse Elections</Link>
      </div>

      {loading ? <LoadingSpinner /> : (
        registrations.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'48px' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🗳️</div>
            <h3>No elections joined yet</h3>
            <p style={{ color:'var(--text2)', margin:'8px 0 20px' }}>Browse active elections and register to participate</p>
            <Link to="/" className="btn btn-primary">Explore Elections</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {registrations.map(r => (
              <div key={r.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <h4 style={{ fontWeight:600, marginBottom:'4px' }}>{r.elections?.title}</h4>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span className={`badge badge-${statusBadge[r.status]}`}>{statusLabel[r.status]}</span>
                    <span className={`badge badge-${r.elections?.status}`}>{r.elections?.status}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {r.status === 'finalized' && r.elections?.status === 'active' && (
                    <Link to={`/vote/${r.elections?.id || ''}`} className="btn btn-primary btn-sm">
                      🗳️ Vote Now
                    </Link>
                  )}
                  {r.elections?.status === 'completed' && (
                    <Link to={`/results/${r.elections?.id || ''}`} className="btn btn-outline btn-sm">
                      📊 Results
                    </Link>
                  )}
                  <Link to={`/election/${r.elections?.id || ''}`} className="btn btn-outline btn-sm">Details</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export function MyElections() {
  return <VoterDashboard />;
}

export default VoterDashboard;
