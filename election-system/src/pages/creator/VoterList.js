import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function VoterList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: vl }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('voter_registrations')
          .select('*, profiles(full_name, email, phone)')
          .eq('election_id', id)
          .order('registered_at', { ascending: true })
      ]);
      setElection(el);
      setVoters(vl || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const statusColor = { registered:'var(--accent)', finalized:'var(--success)', waitlisted:'var(--warning)', voted:'var(--accent2)' };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container page">
      <div style={{ marginBottom:'24px' }}>
        <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom:'8px' }}>← Back</button>
        <h1 style={{ fontSize:'24px' }}>Voter List</h1>
        <p style={{ color:'var(--text2)' }}>{election?.title}</p>
      </div>

      <div className="grid-4" style={{ marginBottom:'24px' }}>
        <div className="stat-card"><div className="stat-value">{voters.filter(v=>v.status==='registered'||v.status==='finalized').length}</div><div className="stat-label">Registered</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color:'var(--success)' }}>{voters.filter(v=>v.status==='finalized').length}</div><div className="stat-label">Finalized</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color:'var(--warning)' }}>{voters.filter(v=>v.status==='waitlisted').length}</div><div className="stat-label">Waitlisted</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color:'var(--accent2)' }}>{voters.filter(v=>v.status==='voted').length}</div><div className="stat-label">Voted</div></div>
      </div>

      {election?.is_locked && (
        <div className="alert alert-info" style={{ marginBottom:'20px' }}>
          🔒 Voter list is locked. {voters.filter(v=>v.status==='finalized').length} voters have been finalized and issued secret codes.
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Secret Code</th>
                <th>Status</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v, i) => (
                <tr key={v.id}>
                  <td style={{ color:'var(--text3)' }}>{i + 1}</td>
                  <td style={{ fontWeight:500 }}>{v.profiles?.full_name}</td>
                  <td style={{ fontSize:'13px', color:'var(--text2)' }}>{v.profiles?.email}</td>
                  <td style={{ fontFamily:'monospace', fontSize:'13px', color:'var(--accent2)' }}>
                    {v.secret_code ? `****${v.secret_code.slice(-4)}` : '—'}
                  </td>
                  <td>
                    <span style={{ color: statusColor[v.status] || 'var(--text2)', fontSize:'13px', fontWeight:500 }}>
                      ● {v.status}
                    </span>
                  </td>
                  <td style={{ fontSize:'12px', color:'var(--text3)' }}>{new Date(v.registered_at).toLocaleString()}</td>
                </tr>
              ))}
              {voters.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text2)', padding:'32px' }}>No registered voters yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
