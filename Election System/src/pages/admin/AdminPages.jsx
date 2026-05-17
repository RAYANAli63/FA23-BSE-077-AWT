import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase, logAudit, createNotification } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Sidebar, { adminLinks } from '../../components/layout/Sidebar.jsx'
import { StatCard, Badge, LoadingPage, Modal, Textarea, EmptyState, Spinner, Alert } from '../../components/ui/index.jsx'

function AdminLayout({ children, sidebarOpen, onClose }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar links={adminLinks} title="Admin Panel" open={sidebarOpen} onClose={onClose} />
      <main className="flex-1 overflow-auto">
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  )
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
export function AdminDashboard({ sidebarOpen, onClose }) {
  const [stats, setStats] = useState({ elections:0, active:0, users:0, pending:0, completed:0, votes:0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    async function load() {
      const [{ count: el }, { count: ac }, { count: us }, { count: pe }, { count: co }] = await Promise.all([
        supabase.from('elections').select('*',{count:'exact',head:true}),
        supabase.from('elections').select('*',{count:'exact',head:true}).eq('status','active'),
        supabase.from('profiles').select('*',{count:'exact',head:true}),
        supabase.from('creator_requests').select('*',{count:'exact',head:true}).eq('status','pending'),
        supabase.from('elections').select('*',{count:'exact',head:true}).eq('status','completed'),
      ])
      setStats({ elections:el||0, active:ac||0, users:us||0, pending:pe||0, completed:co||0 })
    }
    load()
    supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(8).then(({data}) => setRecent(data||[]))
  }, [])

  const actionColor = a => a.includes('vote') ? 'text-success-400' : a.includes('reject') || a.includes('delete') ? 'text-danger-400' : a.includes('approve') || a.includes('publish') ? 'text-success-400' : a.includes('login') ? 'text-brand-400' : 'text-surface-400'

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="page-header"><h1 className="section-title">Admin Dashboard</h1><p className="section-subtitle">System overview and management</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🗳️" label="Total Elections" value={stats.elections} color="brand" />
        <StatCard icon="🔴" label="Active Now" value={stats.active} color="danger" />
        <StatCard icon="✅" label="Completed" value={stats.completed} color="success" />
        <StatCard icon="👥" label="Total Users" value={stats.users} color="violet" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { to:'/admin/requests', icon:'📝', label:'Creator Requests', badge: stats.pending > 0 ? `${stats.pending} pending` : null, badgeV:'pending' },
              { to:'/admin/elections', icon:'🗳️', label:'Manage Elections', badge:`${stats.elections} total`, badgeV:'published' },
              { to:'/admin/users',     icon:'👥', label:'View All Users',   badge:`${stats.users} users`, badgeV:'voter' },
              { to:'/admin/audit',     icon:'📋', label:'Audit Logs',       badge:null, badgeV:null },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/40 border border-surface-700/30 hover:border-surface-600 hover:bg-surface-800/60 transition-all">
                <div className="flex items-center gap-2.5 text-sm font-medium text-surface-200">
                  <span className="text-base">{a.icon}</span> {a.label}
                </div>
                {a.badge && <Badge variant={a.badgeV}>{a.badge}</Badge>}
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold mb-4">System Status</h3>
          <div className="space-y-2 mb-6">
            {['Database','Auth Service','RLS Policies','Realtime'].map(s => (
              <div key={s} className="flex justify-between items-center py-2.5 border-b border-surface-800/60 last:border-0">
                <span className="text-surface-400 text-sm">{s}</span>
                <Badge variant="active">● Online</Badge>
              </div>
            ))}
          </div>
          <h4 className="font-bold text-sm mb-3 text-surface-300">Recent Activity</h4>
          <div className="space-y-1.5">
            {recent.slice(0,5).map(l => (
              <div key={l.id} className="flex items-center gap-2 text-xs">
                <span className={`font-semibold truncate flex-1 ${actionColor(l.action)}`}>{l.action}</span>
                <span className="text-surface-600 flex-shrink-0">{l.actor_name?.split(' ')[0] || 'sys'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

/* ─── REQUESTS ───────────────────────────────────────────────────────────── */
export function AdminRequests({ sidebarOpen, onClose }) {
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('creator_requests')
      .select('*, profiles(full_name,email)').order('created_at',{ascending:false})
    setRequests(data||[])
    setLoading(false)
  }

  async function decide(req, action) {
    setProcessing(true)
    try {
      await supabase.from('creator_requests').update({
        status: action, rejection_reason: action==='rejected' ? reason : null,
        reviewed_by: user.id, reviewed_at: new Date().toISOString()
      }).eq('id', req.id)
      if (action === 'approved') {
        await supabase.from('profiles').update({ role:'election_creator' }).eq('id', req.user_id)
        await createNotification(req.user_id, '🎉 Application Approved!', 'You can now create elections on VoteSecure.', 'success')
      } else {
        await createNotification(req.user_id, '❌ Application Rejected', `Reason: ${reason}`, 'error')
      }
      await logAudit(user.id, profile?.full_name, `request_${action}`, 'creator_request', req.id)
      toast.success(`Request ${action}!`)
      setRejectModal(null); setReason(''); load()
    } catch(err) { toast.error(err.message) }
    setProcessing(false)
  }

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="page-header"><h1 className="section-title">Creator Requests</h1><p className="section-subtitle">Review and approve election creator applications</p></div>
      {loading ? <LoadingPage /> : requests.length === 0 ? (
        <EmptyState icon="📝" title="No requests yet" message="Creator applications will appear here." />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Applicant</th><th>Organization</th><th>Purpose</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><p className="font-medium text-surface-100">{r.profiles?.full_name}</p><p className="text-xs text-surface-500">{r.email}</p></td>
                    <td className="text-sm text-surface-300">{r.organization}</td>
                    <td className="max-w-[180px]"><p className="text-xs text-surface-400 truncate">{r.purpose}</p></td>
                    <td className="text-xs text-surface-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td><Badge variant={r.status}>{r.status}</Badge></td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => decide(r,'approved')} disabled={processing} className="btn btn-success btn-xs">✓ Approve</button>
                          <button onClick={() => setRejectModal(r)} className="btn btn-danger btn-xs">✗ Reject</button>
                        </div>
                      ) : <span className="text-xs text-surface-500">{r.status==='approved'?'✅':'❌'} Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Request" size="modal-sm">
        <p className="text-sm text-surface-400 mb-4">Rejecting request from <strong className="text-surface-200">{rejectModal?.profiles?.full_name}</strong>.</p>
        <Textarea label="Rejection Reason *" rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide a clear reason..." className="mb-4" />
        <div className="flex gap-3">
          <button onClick={() => setRejectModal(null)} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={() => decide(rejectModal,'rejected')} disabled={!reason||processing} className="btn btn-danger flex-1">
            {processing ? <Spinner size="xs" /> : 'Confirm Reject'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  )
}

/* ─── ELECTIONS ──────────────────────────────────────────────────────────── */
export function AdminElections({ sidebarOpen, onClose }) {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('elections').select('*, profiles(full_name)').order('created_at',{ascending:false})
      .then(({data}) => { setElections(data||[]); setLoading(false) })
  }, [])

  const filtered = elections.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="page-header"><h1 className="section-title">All Elections</h1><p className="section-subtitle">Monitor all elections on the platform</p></div>
      <div className="mb-4"><input className="input max-w-sm" placeholder="Search elections..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <LoadingPage /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Creator</th><th>Status</th><th>Max Voters</th><th>Dates</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td><p className="font-medium text-surface-100">{e.title}</p><p className="text-xs text-surface-500">{e.category}</p></td>
                    <td className="text-sm text-surface-400">{e.profiles?.full_name}</td>
                    <td><Badge variant={e.status}>{e.status}</Badge></td>
                    <td className="text-surface-400 tabular-nums">{e.max_voters?.toLocaleString()}</td>
                    <td className="text-xs text-surface-500">{new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}</td>
                    <td><Link to={`/election/${e.id}`} className="btn btn-secondary btn-xs">View</Link></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-surface-500 py-10">No elections found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

/* ─── USERS ──────────────────────────────────────────────────────────────── */
export function AdminUsers({ sidebarOpen, onClose }) {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setUsers(data||[]); setLoading(false) })
  }, [])

  async function toggleActive(u) {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id)
    setUsers(prev => prev.map(p => p.id === u.id ? { ...p, is_active: !u.is_active } : p))
    toast.success(`User ${!u.is_active ? 'activated' : 'deactivated'}`)
  }

  const filtered = users.filter(u => !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="page-header"><h1 className="section-title">Users</h1><p className="section-subtitle">All registered users on the platform</p></div>
      <div className="mb-4 flex gap-3">
        <input className="input max-w-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-surface-500 text-sm self-center">{filtered.length} users</span>
      </div>
      {loading ? <LoadingPage /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Session ID</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-surface-100">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-surface-400">{u.email}</td>
                    <td className="text-sm text-surface-500">{u.phone || '—'}</td>
                    <td><Badge variant={u.role}>{u.role?.replace('_',' ')}</Badge></td>
                    <td><span className="font-mono text-brand-400 text-xs bg-brand-500/10 px-2 py-0.5 rounded">VS-{u.id?.slice(0,8).toUpperCase()}</span></td>
                    <td className="text-xs text-surface-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.id !== me?.id && (
                        <button onClick={() => toggleActive(u)} className={`btn btn-xs ${u.is_active !== false ? 'btn-secondary' : 'btn-success'}`}>
                          {u.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

/* ─── AUDIT LOGS ─────────────────────────────────────────────────────────── */
export function AuditLogs({ sidebarOpen, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(500)
      .then(({data}) => { setLogs(data||[]); setLoading(false) })
  }, [])

  function downloadCSV() {
    const rows = [['Time','Actor','Action','Entity Type','Entity ID','Details']]
    logs.forEach(l => rows.push([new Date(l.created_at).toLocaleString(), l.actor_name||'', l.action, l.entity_type||'', l.entity_id||'', JSON.stringify(l.details)]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,'+encodeURIComponent(csv); a.download = 'audit_logs.csv'; a.click()
  }

  const filtered = logs.filter(l => !filter || l.action.includes(filter))
  const actionColor = a => a.includes('vote') ? 'text-success-400' : a.includes('reject')||a.includes('delete') ? 'text-danger-400' : a.includes('approve')||a.includes('publish') ? 'text-success-400' : a.includes('login') ? 'text-brand-400' : 'text-surface-400'

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div><h1 className="section-title">Audit Logs</h1><p className="section-subtitle">Complete activity log for transparency</p></div>
        <div className="flex gap-2">
          <select className="input w-40" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="vote">Votes</option>
            <option value="login">Logins</option>
            <option value="approve">Approvals</option>
            <option value="election">Elections</option>
            <option value="reject">Rejections</option>
          </select>
          <button onClick={downloadCSV} className="btn btn-secondary btn-sm">📥 Export CSV</button>
        </div>
      </div>
      {loading ? <LoadingPage /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td className="text-xs text-surface-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="text-sm text-surface-300">{l.actor_name || 'System'}</td>
                    <td><span className={`text-xs font-semibold ${actionColor(l.action)}`}>{l.action}</span></td>
                    <td className="text-xs text-surface-500">{l.entity_type||'—'}</td>
                    <td className="text-xs text-surface-600 max-w-[200px] truncate">{Object.keys(l.details||{}).length > 0 ? JSON.stringify(l.details) : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-surface-500 py-10">No logs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard
