import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase, logAudit, createNotification } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar, adminLinks } from '../../components/shared/Sidebar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function AdminLayout({ children, sidebarOpen, onSidebarClose }) {
  return (
    <div className="dashboard-layout">
      <Sidebar links={adminLinks} title="Admin Panel" mobileOpen={sidebarOpen} onClose={onSidebarClose} />
      <div className="dashboard-content">{children}</div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
export function AdminDashboard({ sidebarOpen, onSidebarClose }) {
  const [stats, setStats] = useState({ elections: 0, active: 0, users: 0, pending: 0, votes: 0, completed: 0 });

  useEffect(() => {
    async function load() {
      const [{ count: el }, { count: ac }, { count: us }, { count: pe }, { count: co }] = await Promise.all([
        supabase.from('elections').select('*', { count: 'exact', head: true }),
        supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('creator_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);
      setStats({ elections: el || 0, active: ac || 0, users: us || 0, pending: pe || 0, completed: co || 0 });
    }
    load();
  }, []);

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="page-header"><h1>Admin Dashboard</h1><p>System overview and management</p></div>
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Elections', value: stats.elections, color: 'var(--accent)', icon: '🗳️' },
          { label: 'Active Now', value: stats.active, color: 'var(--danger)', icon: '🔴' },
          { label: 'Completed', value: stats.completed, color: 'var(--success)', icon: '✅' },
          { label: 'Total Users', value: stats.users, color: 'var(--accent2)', icon: '👥' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/admin/requests" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
              Review Creator Requests <span className="badge badge-pending">{stats.pending} pending</span>
            </Link>
            <Link to="/admin/elections" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>Manage Elections →</Link>
            <Link to="/admin/users" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>View All Users →</Link>
            <Link to="/admin/audit" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>Audit Logs →</Link>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>System Status</h3>
          {['Database', 'Auth Service', 'RLS Policies', 'Realtime'].map(s => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text2)' }}>{s}</span>
              <span className="badge badge-active">● Online</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN REQUESTS ────────────────────────────────────────────────────────────
export function AdminRequests({ sidebarOpen, onSidebarClose }) {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('creator_requests')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  async function handleDecision(req, action) {
    setProcessing(true);
    try {
      await supabase.from('creator_requests').update({
        status: action, rejection_reason: action === 'rejected' ? reason : null,
        reviewed_by: user.id, reviewed_at: new Date().toISOString()
      }).eq('id', req.id);

      if (action === 'approved') {
        await supabase.from('profiles').update({ role: 'election_creator' }).eq('id', req.user_id);
        await createNotification(req.user_id, '🎉 Application Approved!', 'You can now create elections on VoteSecure.', 'success');
      } else {
        await createNotification(req.user_id, '❌ Application Rejected', `Reason: ${reason}`, 'error');
      }
      await logAudit(user.id, profile?.full_name, `request_${action}`, 'creator_request', req.id, { user_id: req.user_id });
      toast.success(`Request ${action}!`);
      setRejectModal(null); setReason('');
      load();
    } catch (err) { toast.error(err.message); }
    setProcessing(false);
  }

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="page-header"><h1>Creator Requests</h1><p>Review and approve election creator applications</p></div>
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Applicant</th><th>Organization</th><th>Purpose</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 500 }}>{r.profiles?.full_name}</div><div style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.email}</div></td>
                    <td style={{ fontSize: '13px' }}>{r.organization}</td>
                    <td style={{ maxWidth: '200px', fontSize: '13px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleDecision(r, 'approved')} className="btn btn-success btn-sm" disabled={processing}>✓ Approve</button>
                          <button onClick={() => setRejectModal(r)} className="btn btn-danger btn-sm" disabled={processing}>✗ Reject</button>
                        </div>
                      ) : <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.status === 'approved' ? '✅' : '❌'} Reviewed</span>}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)', padding: '32px' }}>No requests yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Reject Request</span>
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '16px' }}>Rejecting request from <strong>{rejectModal.profiles?.full_name}</strong>.</p>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea className="form-control" rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide a clear reason..." />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setRejectModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDecision(rejectModal, 'rejected')} className="btn btn-danger" style={{ flex: 1 }} disabled={!reason || processing}>
                {processing ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── ADMIN ELECTIONS ──────────────────────────────────────────────────────────
export function AdminElections({ sidebarOpen, onSidebarClose }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('elections').select('*, profiles(full_name)').order('created_at', { ascending: false })
      .then(({ data }) => { setElections(data || []); setLoading(false); });
  }, []);

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="page-header"><h1>All Elections</h1><p>Monitor and manage all elections on the platform</p></div>
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Creator</th><th>Status</th><th>Voters</th><th>Dates</th><th>Actions</th></tr></thead>
              <tbody>
                {elections.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{e.profiles?.full_name}</td>
                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{e.max_voters}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}</td>
                    <td><Link to={`/election/${e.id}`} className="btn btn-outline btn-sm">View</Link></td>
                  </tr>
                ))}
                {elections.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)', padding: '32px' }}>No elections yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export function AdminUsers({ sidebarOpen, onSidebarClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="page-header"><h1>Users</h1><p>All registered users on the platform</p></div>
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.email}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.phone || '—'}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export function AuditLogs({ sidebarOpen, onSidebarClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(300)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  const filtered = logs.filter(l => !filter || l.action.includes(filter));

  const actionColor = (a) => {
    if (a.includes('vote')) return 'var(--success)';
    if (a.includes('reject') || a.includes('delete')) return 'var(--danger)';
    if (a.includes('approve') || a.includes('publish')) return 'var(--success)';
    if (a.includes('login')) return 'var(--accent)';
    return 'var(--text2)';
  };

  function downloadCSV() {
    const rows = [['Time', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Details']];
    logs.forEach(l => rows.push([new Date(l.created_at).toLocaleString(), l.actor_name || '', l.action, l.entity_type || '', l.entity_id || '', JSON.stringify(l.details)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'audit_logs.csv'; a.click();
  }

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}><h1>Audit Logs</h1><p>Complete activity log for transparency</p></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="form-control" style={{ width: '160px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="vote">Votes</option>
            <option value="login">Logins</option>
            <option value="approve">Approvals</option>
            <option value="election">Elections</option>
          </select>
          <button onClick={downloadCSV} className="btn btn-outline btn-sm">📥 Export CSV</button>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString()}</td>
                    <td style={{ fontSize: '13px' }}>{l.actor_name || 'System'}</td>
                    <td><span style={{ color: actionColor(l.action), fontSize: '13px', fontWeight: 500 }}>{l.action}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{l.entity_type || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text3)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {Object.keys(l.details || {}).length > 0 ? JSON.stringify(l.details) : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text2)', padding: '32px' }}>No logs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
