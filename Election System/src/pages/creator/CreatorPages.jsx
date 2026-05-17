import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Upload } from 'lucide-react'
import { supabase, logAudit, createNotification } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Sidebar, { creatorLinks } from '../../components/layout/Sidebar.jsx'
import { StatCard, Badge, LoadingPage, Input, Textarea, Select, EmptyState, Spinner, Alert, ProgressBar } from '../../components/ui/index.jsx'

const CATS = ['Student Body','Corporate','Political','Community','NGO','Academic','Sports','Government','Other']

function CreatorLayout({ children, sidebarOpen, onClose }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar links={creatorLinks} title="Creator Panel" open={sidebarOpen} onClose={onClose} />
      <main className="flex-1 overflow-auto"><div className="page-wrapper">{children}</div></main>
    </div>
  )
}

/* ─── ELECTION FORM ──────────────────────────────────────────────────────── */
function ElectionForm({ initial, onSubmit, saving, submitLabel }) {
  const defaults = { title:'', description:'', category:'General', start_time:'', end_time:'', registration_deadline:'', max_voters:1000 }
  const [form, setForm] = useState(initial || defaults)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-5">
      <div className="card">
        <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input label="Election Title *" value={form.title} onChange={set('title')} required placeholder="e.g. Student Union Election 2025" />
          <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Describe the election purpose and rules..." />
          <Select label="Category" value={form.category} onChange={set('category')} options={CATS} />
        </div>
      </div>
      <div className="card">
        <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-4">Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Start Date & Time *" type="datetime-local" value={form.start_time} onChange={set('start_time')} required />
          <Input label="End Date & Time *" type="datetime-local" value={form.end_time} onChange={set('end_time')} required />
        </div>
        <div className="mt-4">
          <Input label="Registration Deadline *" type="datetime-local" value={form.registration_deadline} onChange={set('registration_deadline')} required hint="Voters must register before this deadline." />
        </div>
      </div>
      <div className="card">
        <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-4">Voter Limit</h3>
        <Input label="Maximum Voters *" type="number" min={2} max={100000} value={form.max_voters} onChange={set('max_voters')} required hint="Election auto-locks when this limit is reached." />
      </div>
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
        {saving ? <><Spinner size="sm" /> Saving...</> : submitLabel}
      </button>
    </form>
  )
}

/* ─── CREATOR DASHBOARD ──────────────────────────────────────────────────── */
export function CreatorDashboard({ sidebarOpen, onClose }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [reqStatus, setReqStatus] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [reqForm, setReqForm] = useState({ purpose:'', organization:'', phone:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || !profile) return
    if (profile.role === 'election_creator' || profile.role === 'super_admin') {
      supabase.from('elections').select('*, voter_registrations(count)').eq('creator_id', user.id)
        .order('created_at',{ascending:false})
        .then(({data}) => {
          setElections((data||[]).map(e => ({ ...e, voter_count: e.voter_registrations?.[0]?.count||0 })))
          setLoading(false)
        })
    } else {
      supabase.from('creator_requests').select('*').eq('user_id', user.id).maybeSingle()
        .then(({data}) => { setReqStatus(data); setLoading(false) })
    }
  }, [user, profile])

  async function submitReq(e) {
    e.preventDefault(); setSubmitting(true)
    const { error } = await supabase.from('creator_requests').insert({ user_id:user.id, email:profile.email, ...reqForm })
    if (error) { toast.error(error.message); setSubmitting(false); return }
    toast.success('Application submitted!')
    setReqStatus({ status:'pending' }); setShowForm(false); setSubmitting(false)
  }

  if (loading) return <LoadingPage />

  // Voter role — show creator request flow
  if (profile?.role === 'voter') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="card max-w-lg w-full animate-fade-in">
          {reqStatus?.status === 'pending' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="font-bold text-xl mb-2">Application Under Review</h2>
              <p className="text-surface-400 text-sm">Admin will review your application and notify you.</p>
            </div>
          )}
          {reqStatus?.status === 'rejected' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="font-bold text-xl mb-2">Application Rejected</h2>
              <Alert type="danger" className="mb-4 text-left"><span className="text-sm">Reason: {reqStatus.rejection_reason}</span></Alert>
              <button onClick={() => { setReqStatus(null); setShowForm(true) }} className="btn btn-primary">Apply Again</button>
            </div>
          )}
          {!reqStatus && !showForm && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏛️</div>
              <h2 className="font-bold text-xl mb-3">Become an Election Creator</h2>
              <p className="text-surface-400 text-sm mb-6">Submit a request to create and manage elections on VoteSecure.</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-lg">Apply Now →</button>
            </div>
          )}
          {showForm && (
            <div>
              <h2 className="font-bold text-xl mb-5">Creator Application</h2>
              <form onSubmit={submitReq} className="space-y-4">
                <Input label="Organization *" value={reqForm.organization} onChange={e => setReqForm(p=>({...p,organization:e.target.value}))} required placeholder="Your organization name" />
                <Input label="Phone *" value={reqForm.phone} onChange={e => setReqForm(p=>({...p,phone:e.target.value}))} required placeholder="+92 3xx xxxxxxx" />
                <Textarea label="Election Purpose *" rows={4} value={reqForm.purpose} onChange={e => setReqForm(p=>({...p,purpose:e.target.value}))} required placeholder="Why do you need to create elections..." />
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div><h1 className="section-title">My Elections</h1><p className="section-subtitle">Create and manage your elections</p></div>
        <Link to="/creator/new" className="btn btn-primary gap-2"><Plus size={16} /> New Election</Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon="🗳️" label="Total" value={elections.length} color="brand" />
        <StatCard icon="🔴" label="Active" value={elections.filter(e=>e.status==='active').length} color="danger" />
        <StatCard icon="✅" label="Completed" value={elections.filter(e=>e.status==='completed').length} color="success" />
      </div>
      {elections.length === 0 ? (
        <EmptyState icon="🗳️" title="No elections yet" message="Create your first election to get started." action={() => navigate('/creator/new')} actionLabel="Create Election" />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Election</th><th>Status</th><th>Voters</th><th>Dates</th><th>Actions</th></tr></thead>
              <tbody>
                {elections.map(e => (
                  <tr key={e.id}>
                    <td><p className="font-semibold text-surface-100">{e.title}</p><p className="text-xs text-surface-500">{e.category}</p></td>
                    <td><Badge variant={e.status}>{e.status}</Badge></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={e.voter_count} max={e.max_voters} className="w-16" />
                        <span className="text-xs text-surface-400 tabular-nums">{e.voter_count}/{e.max_voters}</span>
                      </div>
                    </td>
                    <td className="text-xs text-surface-500">{new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        {e.status === 'draft' && <Link to={`/creator/election/${e.id}/edit`} className="btn btn-secondary btn-xs"><Edit size={11} /></Link>}
                        <Link to={`/creator/election/${e.id}/candidates`} className="btn btn-secondary btn-xs">👥</Link>
                        <Link to={`/creator/election/${e.id}/voters`} className="btn btn-secondary btn-xs">📋</Link>
                        <Link to={`/creator/election/${e.id}/control`} className="btn btn-primary btn-xs">⚙️ Control</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CreatorLayout>
  )
}

/* ─── CREATE ELECTION ────────────────────────────────────────────────────── */
export function CreateElection({ sidebarOpen, onClose }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  async function handleCreate(form) {
    if (new Date(form.end_time) <= new Date(form.start_time)) { toast.error('End time must be after start time'); return }
    if (new Date(form.registration_deadline) >= new Date(form.start_time)) { toast.error('Registration deadline must be before start time'); return }
    setSaving(true)
    const { data, error } = await supabase.from('elections').insert({ ...form, max_voters:parseInt(form.max_voters), creator_id:user.id, status:'draft' }).select().single()
    if (error) { toast.error(error.message); setSaving(false); return }
    await logAudit(user.id, profile?.full_name, 'election_created', 'election', data.id, { title:form.title })
    toast.success('Election created! Now add candidates.')
    navigate(`/creator/election/${data.id}/candidates`)
  }

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <button onClick={() => navigate('/creator')} className="btn btn-secondary btn-sm mb-4">← Back</button>
      <div className="page-header"><h1 className="section-title">Create New Election</h1><p className="section-subtitle">Set up details for your election</p></div>
      <div className="max-w-2xl">
        <ElectionForm onSubmit={handleCreate} saving={saving} submitLabel="✓ Create Election & Add Candidates →" />
      </div>
    </CreatorLayout>
  )
}

/* ─── EDIT ELECTION ──────────────────────────────────────────────────────── */
export function EditElection({ sidebarOpen, onClose }) {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({ data }) => setElection(data))
  }, [id])

  async function handleUpdate(form) {
    setSaving(true)
    const { error } = await supabase.from('elections').update({ ...form, max_voters:parseInt(form.max_voters) }).eq('id', id)
    if (error) { toast.error(error.message); setSaving(false); return }
    await logAudit(user.id, profile?.full_name, 'election_edited', 'election', id)
    toast.success('Election updated!')
    navigate('/creator')
  }

  if (!election) return <LoadingPage />
  const initial = { ...election, start_time:election.start_time?.slice(0,16)||'', end_time:election.end_time?.slice(0,16)||'', registration_deadline:election.registration_deadline?.slice(0,16)||'' }

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <button onClick={() => navigate('/creator')} className="btn btn-secondary btn-sm mb-4">← Back</button>
      <div className="page-header"><h1 className="section-title">Edit Election</h1><p className="section-subtitle">Update election details</p></div>
      <div className="max-w-2xl">
        <ElectionForm initial={initial} onSubmit={handleUpdate} saving={saving} submitLabel="✓ Save Changes" />
      </div>
    </CreatorLayout>
  )
}

/* ─── MANAGE CANDIDATES ──────────────────────────────────────────────────── */
export function ManageCandidates({ sidebarOpen, onClose }) {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [form, setForm] = useState({ name:'', designation:'', manifesto:'', photo_url:'' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    supabase.from('elections').select('*').eq('id',id).single().then(({data}) => setElection(data))
    supabase.from('candidates').select('*').eq('election_id',id).order('created_at').then(({data}) => setCandidates(data||[]))
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      if (editing) {
        await supabase.from('candidates').update(form).eq('id', editing.id)
        setCandidates(prev => prev.map(c => c.id===editing.id ? {...c,...form} : c))
        toast.success('Updated!'); setEditing(null)
      } else {
        const { data, error } = await supabase.from('candidates').insert({ election_id:id, ...form }).select().single()
        if (error) throw error
        setCandidates(prev => [...prev, data])
        toast.success('Candidate added!')
      }
      setForm({ name:'', designation:'', manifesto:'', photo_url:'' })
    } catch(err) { toast.error(err.message) }
    setSaving(false)
  }

  async function handleDelete(cId) {
    if (!window.confirm('Delete this candidate?')) return
    await supabase.from('candidates').delete().eq('id', cId)
    setCandidates(prev => prev.filter(c => c.id !== cId))
    toast.success('Candidate removed')
  }

  async function publish() {
    if (candidates.length < 2) { toast.error('Add at least 2 candidates first!'); return }
    await supabase.from('elections').update({ status:'published' }).eq('id', id)
    await logAudit(user.id, profile?.full_name, 'election_published', 'election', id, { title:election.title })
    toast.success('🎉 Election published!')
    navigate('/creator')
  }

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/creator')} className="btn btn-secondary btn-sm mb-3">← Back</button>
          <h1 className="section-title">Manage Candidates</h1>
          <p className="section-subtitle">{election?.title}</p>
        </div>
        {election?.status === 'draft' && candidates.length >= 2 && (
          <button onClick={publish} className="btn btn-success btn-lg">🚀 Publish Election</button>
        )}
      </div>
      {candidates.length < 2 && <Alert type="warning" className="mb-4">⚠️ Add at least 2 candidates to publish the election.</Alert>}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-bold text-surface-200">Candidates ({candidates.length})</h3>
          {candidates.map(c => (
            <div key={c.id} className="card-hover flex gap-4 items-start">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" /> : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-bold text-surface-100">{c.name}</p>
                    {c.designation && <p className="text-xs text-brand-400 mt-0.5">{c.designation}</p>}
                    {c.manifesto && <p className="text-xs text-surface-400 mt-1.5 leading-relaxed line-clamp-2">{c.manifesto}</p>}
                  </div>
                  {election?.status === 'draft' && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="btn btn-secondary btn-xs" onClick={() => { setEditing(c); setForm({ name:c.name, designation:c.designation||'', manifesto:c.manifesto||'', photo_url:c.photo_url||'' }) }}>
                        <Edit size={11} />
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(c.id)}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {candidates.length === 0 && <EmptyState icon="👤" title="No candidates yet" message="Add candidates using the form →" />}
        </div>
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <h3 className="font-bold mb-4">{editing ? '✏️ Edit Candidate' : '➕ Add Candidate'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <Input label="Full Name *" value={form.name} onChange={set('name')} required placeholder="Candidate full name" />
              <Input label="Position / Designation" value={form.designation} onChange={set('designation')} placeholder="e.g. President Candidate" />
              <Input label="Photo URL" value={form.photo_url} onChange={set('photo_url')} placeholder="https://..." hint="Direct image URL (optional)" />
              <Textarea label="Manifesto" rows={4} value={form.manifesto} onChange={set('manifesto')} placeholder="Campaign goals..." />
              <div className="flex gap-2">
                {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name:'', designation:'', manifesto:'', photo_url:'' }) }}>Cancel</button>}
                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? <Spinner size="xs" /> : editing ? '✓ Update' : '+ Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </CreatorLayout>
  )
}

/* ─── VOTER LIST ─────────────────────────────────────────────────────────── */
export function VoterListPage({ sidebarOpen, onClose }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({data}) => setElection(data))
    supabase.from('voter_registrations').select('*, profiles(id,full_name,email,phone)').eq('election_id', id).order('registered_at')
      .then(({data}) => { setVoters(data||[]); setLoading(false) })
  }, [id])

  const counts = {
    all:voters.length, registered:voters.filter(v=>v.status==='registered').length,
    finalized:voters.filter(v=>v.status==='finalized').length, voted:voters.filter(v=>v.status==='voted').length,
    waitlisted:voters.filter(v=>v.status==='waitlisted').length
  }
  const filtered = voters.filter(v => {
    const mf = filter==='all' || v.status===filter
    const ms = !search || v.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || v.profiles?.email?.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <button onClick={() => navigate('/creator')} className="btn btn-secondary btn-sm mb-4">← Back</button>
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div><h1 className="section-title">Voter List</h1><p className="section-subtitle">{election?.title}</p></div>
        <Alert type="info" className="py-2"><span className="text-xs">🔑 Session IDs shown for voted voters</span></Alert>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📝" label="Registered" value={counts.registered} color="brand" onClick={() => setFilter('registered')} />
        <StatCard icon="✅" label="Finalized" value={counts.finalized} color="success" onClick={() => setFilter('finalized')} />
        <StatCard icon="🗳️" label="Voted" value={counts.voted} color="violet" onClick={() => setFilter('voted')} />
        <StatCard icon="⏳" label="Waitlisted" value={counts.waitlisted} color="warning" onClick={() => setFilter('waitlisted')} />
      </div>
      {election?.is_locked && <Alert type="info" className="mb-4"><span className="text-sm">🔒 Voter list locked. {counts.finalized+counts.voted} voters authorized.</span></Alert>}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input flex-1 max-w-xs" placeholder="Search voters..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1.5 flex-wrap">
          {['all','registered','finalized','voted','waitlisted'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-xs ${filter===f ? 'btn-primary' : 'btn-secondary'}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)} ({counts[f]||0})
            </button>
          ))}
        </div>
      </div>
      {loading ? <LoadingPage /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>#</th><th>Voter</th><th>Email</th><th>Session User ID</th><th>Secret Code</th><th>Status</th><th>Voted At</th></tr></thead>
              <tbody>
                {filtered.map((v, i) => {
                  const sessionId = v.profiles?.id ? `VS-${v.profiles.id.slice(0,8).toUpperCase()}` : '—'
                  return (
                    <tr key={v.id}>
                      <td className="text-surface-600 font-bold">{i+1}</td>
                      <td><p className="font-medium text-surface-100">{v.profiles?.full_name}</p><p className="text-xs text-surface-500">{v.profiles?.phone}</p></td>
                      <td className="text-sm text-surface-400">{v.profiles?.email}</td>
                      <td>
                        {v.status === 'voted'
                          ? <span className="font-mono text-brand-400 text-xs bg-brand-500/10 px-2 py-0.5 rounded">{sessionId}</span>
                          : <span className="text-surface-600 text-xs">—</span>}
                      </td>
                      <td className="font-mono text-xs text-violet-400">{v.secret_code ? `****${v.secret_code.slice(-4)}` : '—'}</td>
                      <td><Badge variant={v.status==='voted'?'voted':v.status==='finalized'?'finalized':v.status==='waitlisted'?'waitlisted':'registered'}>{v.status}</Badge></td>
                      <td className="text-xs text-surface-500">{v.voted_at ? new Date(v.voted_at).toLocaleString() : '—'}</td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-surface-500 py-10">No voters found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CreatorLayout>
  )
}

/* ─── ELECTION CONTROL ───────────────────────────────────────────────────── */
export function ElectionControl({ sidebarOpen, onClose }) {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(false)
  const [vStats, setVStats] = useState({ registered:0, finalized:0, voted:0, waitlisted:0 })

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({data}) => { setElection(data); setLoading(false) })
    loadStats()
  }, [id])

  async function loadStats() {
    const { data } = await supabase.from('voter_registrations').select('status').eq('election_id', id)
    if (data) setVStats({
      registered: data.filter(v=>v.status==='registered').length,
      finalized: data.filter(v=>v.status==='finalized').length,
      voted: data.filter(v=>v.status==='voted').length,
      waitlisted: data.filter(v=>v.status==='waitlisted').length
    })
  }

  async function changeStatus(newStatus) {
    if (!window.confirm(`Change election status to "${newStatus}"?`)) return
    setChanging(true)
    try {
      if (newStatus === 'active') {
        await supabase.rpc('finalize_voters', { p_election_id: id })
        const { data: voters } = await supabase.from('voter_registrations').select('voter_id,secret_code').eq('election_id',id).eq('status','finalized')
        for (const v of voters||[]) {
          await createNotification(v.voter_id, '🗳️ Election Started!', `"${election.title}" started. Your code: ${v.secret_code}`, 'success')
        }
      }
      if (newStatus === 'completed') {
        const { data: cands } = await supabase.from('candidates').select('*').eq('election_id',id).order('vote_count',{ascending:false})
        if (cands?.length > 0) {
          await supabase.from('elections').update({ winner_id: cands[0].id }).eq('id', id)
          await createNotification(election.creator_id, '🏆 Election Completed!', `Winner: ${cands[0].name} with ${cands[0].vote_count} votes.`, 'success')
        }
      }
      await supabase.from('elections').update({ status: newStatus }).eq('id', id)
      await logAudit(user.id, profile?.full_name, `election_${newStatus}`, 'election', id, { title:election.title })
      setElection(p => ({ ...p, status: newStatus }))
      toast.success(`Election is now ${newStatus}!`)
      loadStats()
    } catch(err) { toast.error(err.message) }
    setChanging(false)
  }

  if (loading) return <LoadingPage />

  const flow = {
    draft:     { next:'published', label:'🚀 Publish Election',                 cls:'btn-primary' },
    published: { next:'active',    label:'▶️ Start Election & Finalize Voters',  cls:'btn-success' },
    active:    { next:'completed', label:'⏹️ End Election & Declare Winner',     cls:'btn-danger'  },
    completed: null
  }
  const action = flow[election?.status]
  const total = vStats.registered + vStats.finalized + vStats.voted + vStats.waitlisted
  const turnout = (vStats.voted + vStats.finalized) > 0 ? Math.round(vStats.voted / (vStats.voted + vStats.finalized) * 100) : 0

  return (
    <CreatorLayout sidebarOpen={sidebarOpen} onClose={onClose}>
      <button onClick={() => navigate('/creator')} className="btn btn-secondary btn-sm mb-4">← Back</button>
      <div className="page-header"><h1 className="section-title">Election Control</h1><p className="section-subtitle">{election?.title}</p></div>
      <div className="max-w-2xl space-y-5">
        <div className="card">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
            <h3 className="font-bold">Status Management</h3>
            <div className="flex gap-2 items-center">
              <Badge variant={election?.status} className="text-sm px-3 py-1">{election?.status?.toUpperCase()}</Badge>
              <span className="text-sm font-semibold text-surface-300">{election?.is_locked ? '🔒 Locked' : '🔓 Open'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label:'Registered', value:vStats.registered, color:'brand', icon:'📝' },
              { label:'Finalized', value:vStats.finalized, color:'success', icon:'✅' },
              { label:'Voted', value:vStats.voted, color:'violet', icon:'🗳️' },
              { label:'Turnout', value:`${turnout}%`, color:'warning', icon:'📊' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-surface-800/40 rounded-xl border border-surface-700/30">
                <div className="text-xl mb-1.5">{s.icon}</div>
                <p className="font-display font-bold text-xl text-surface-100">{s.value}</p>
                <p className="text-[10px] text-surface-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {election?.status === 'published' && <Alert type="info" className="mb-4"><span className="text-sm">ℹ️ Starting will finalize all registered voters and send them secret codes.</span></Alert>}
          {election?.status === 'active' && <Alert type="warning" className="mb-4"><span className="text-sm">⚠️ Ending the election will close voting and declare the winner. Irreversible.</span></Alert>}
          {action ? (
            <button className={`btn ${action.cls} btn-full btn-lg`} onClick={() => changeStatus(action.next)} disabled={changing}>
              {changing ? <><Spinner size="sm" /> Processing...</> : action.label}
            </button>
          ) : (
            <Alert type="success">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span>🏆 Election completed!</span>
                <button onClick={() => navigate(`/results/${id}`)} className="btn btn-secondary btn-sm">View Results →</button>
              </div>
            </Alert>
          )}
        </div>
        <div className="card">
          <h3 className="font-bold mb-3">Quick Links</h3>
          <div className="space-y-2">
            {[
              { to:`/creator/election/${id}/candidates`, icon:'👥', label:'Manage Candidates' },
              { to:`/creator/election/${id}/voters`,    icon:'📋', label:'View Voter List & Session IDs' },
              { to:`/results/${id}`,                    icon:'📊', label:'Live Results' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/40 border border-surface-700/30 hover:border-surface-600 transition-all text-sm text-surface-200">
                <span>{l.icon} {l.label}</span><span className="text-surface-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CreatorLayout>
  )
}

export default CreatorDashboard
