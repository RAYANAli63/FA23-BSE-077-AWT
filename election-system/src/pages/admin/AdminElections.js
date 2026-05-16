import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminSidebar } from './AdminDashboard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export function AdminElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('elections').select('*, profiles(full_name)').order('created_at', { ascending: false })
      .then(({ data }) => { setElections(data || []); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div className="page-header"><h1>All Elections</h1><p>Monitor and manage all elections</p></div>
        {loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Creator</th><th>Status</th><th>Voters</th><th>Dates</th><th>Action</th></tr></thead>
                <tbody>
                  {elections.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight:500 }}>{e.title}</td>
                      <td style={{ color:'var(--text2)', fontSize:'13px' }}>{e.profiles?.full_name}</td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                      <td style={{ color:'var(--text2)' }}>{e.max_voters}</td>
                      <td style={{ fontSize:'12px', color:'var(--text2)' }}>
                        {new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/election/${e.id}`} className="btn btn-outline btn-sm">View</Link>
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

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div className="page-header"><h1>Users</h1><p>All registered users</p></div>
        {loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight:500 }}>{u.full_name}</td>
                      <td style={{ color:'var(--text2)', fontSize:'13px' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'super_admin' ? 'danger' : u.role === 'election_creator' ? 'active' : 'upcoming'}`}>{u.role}</span></td>
                      <td style={{ fontSize:'12px', color:'var(--text2)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
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

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('audit_logs').select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  const actionColor = (action) => {
    if (action.includes('vote')) return 'var(--success)';
    if (action.includes('reject')) return 'var(--danger)';
    if (action.includes('approve')) return 'var(--success)';
    if (action.includes('delete')) return 'var(--danger)';
    return 'var(--accent2)';
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Audit Logs</h1>
          <p>Complete activity log for transparency</p>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize:'12px', color:'var(--text2)', whiteSpace:'nowrap' }}>{new Date(l.created_at).toLocaleString()}</td>
                      <td style={{ fontSize:'13px' }}>{l.profiles?.full_name || 'System'}</td>
                      <td><span style={{ color: actionColor(l.action), fontSize:'13px', fontWeight:500 }}>{l.action}</span></td>
                      <td style={{ fontSize:'12px', color:'var(--text2)' }}>{l.entity_type}</td>
                      <td style={{ fontSize:'12px', color:'var(--text3)', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {l.details ? JSON.stringify(l.details) : '—'}
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

export default AdminElections;
