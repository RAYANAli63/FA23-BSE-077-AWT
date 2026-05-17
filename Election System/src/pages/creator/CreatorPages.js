import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase, logAudit, createNotification } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar, creatorLinks } from '../../components/shared/Sidebar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function CreatorLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar links={creatorLinks} title="Creator Panel" />
      <div className="dashboard-content">{children}</div>
    </div>
  );
}

const CATEGORIES = ['Student Body', 'Corporate', 'Political', 'Community', 'NGO', 'Academic', 'Sports', 'Government', 'Other'];

// ─── CREATOR DASHBOARD ────────────────────────────────────────────────────────
export function CreatorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqForm, setReqForm] = useState({ purpose: '', organization: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.role === 'election_creator' || profile.role === 'super_admin') {
      supabase.from('elections').select('*, voter_registrations(count)').eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setElections((data || []).map(e => ({ ...e, voter_count: e.voter_registrations?.[0]?.count || 0 })));
          setLoading(false);
        });
    } else {
      supabase.from('creator_requests').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { setRequestStatus(data); setLoading(false); });
    }
  }, [user, profile]);

  async function submitRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('creator_requests').insert({
      user_id: user.id, email: profile.email, ...reqForm
    });
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    await logAudit(user.id, profile.full_name, 'creator_request_submitted', 'creator_request', user.id);
    toast.success('Application submitted! Admin will review it.');
    setRequestStatus({ status: 'pending' });
    setShowRequestForm(false);
    setSubmitting(false);
  }

  if (loading) return <LoadingSpinner fullPage />;

  // Voter trying to access creator
  if (profile?.role === 'voter') {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card fade-in" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          {requestStatus?.status === 'pending' && (
            <><div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div><h2>Application Under Review</h2><p style={{ color: 'var(--text2)', marginTop: '8px' }}>Admin will review your application soon.</p></>
          )}
          {requestStatus?.status === 'rejected' && (
            <><div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div><h2>Application Rejected</h2><p style={{ color: 'var(--text2)', marginTop: '8px' }}>Reason: {requestStatus.rejection_reason}</p><button onClick={() => { setRequestStatus(null); setShowRequestForm(true); }} className="btn btn-primary" style={{ marginTop: '16px' }}>Apply Again</button></>
          )}
          {!requestStatus && !showRequestForm && (
            <><div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div><h2>Become an Election Creator</h2><p style={{ color: 'var(--text2)', margin: '12px 0 24px' }}>Submit a request to create and manage elections.</p><button onClick={() => setShowRequestForm(true)} className="btn btn-primary btn-lg">Apply Now →</button></>
          )}
          {showRequestForm && (
            <><h2 style={{ marginBottom: '20px' }}>Creator Application</h2>
              <form onSubmit={submitRequest} style={{ textAlign: 'left' }}>
                <div className="form-group"><label className="form-label">Organization *</label><input className="form-control" value={reqForm.organization} onChange={e => setReqForm({ ...reqForm, organization: e.target.value })} required placeholder="Your organization name" /></div>
                <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={reqForm.phone} onChange={e => setReqForm({ ...reqForm, phone: e.target.value })} required placeholder="+92 3xx xxxxxxx" /></div>
                <div className="form-group"><label className="form-label">Election Purpose *</label><textarea className="form-control" rows={4} value={reqForm.purpose} onChange={e => setReqForm({ ...reqForm, purpose: e.target.value })} required placeholder="Describe why you need to create elections..." /></div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
              </form></>
          )}
        </div>
      </div>
    );
  }

  return (
    <CreatorLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700 }}>My Elections</h1><p style={{ color: 'var(--text2)', marginTop: '4px' }}>Create and manage your elections</p></div>
        <Link to="/creator/new" className="btn btn-primary">➕ New Election</Link>
      </div>
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total', value: elections.length, color: 'var(--accent)' },
          { label: 'Active', value: elections.filter(e => e.status === 'active').length, color: 'var(--danger)' },
          { label: 'Completed', value: elections.filter(e => e.status === 'completed').length, color: 'var(--success)' },
        ].map(s => <div key={s.label} className="stat-card"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>)}
      </div>
      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗳️</div>
          <h3>No elections yet</h3><p style={{ color: 'var(--text2)', margin: '8px 0 20px' }}>Create your first election to get started</p>
          <Link to="/creator/new" className="btn btn-primary">Create Election</Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Voters</th><th>Dates</th><th>Actions</th></tr></thead>
              <tbody>
                {elections.map(e => (
                  <tr key={e.id}>
                    <td><div style={{ fontWeight: 500 }}>{e.title}</div><div style={{ fontSize: '12px', color: 'var(--text2)' }}>{e.category}</div></td>
                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{e.voter_count} / {e.max_voters}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {e.status === 'draft' && <Link to={`/creator/election/${e.id}/edit`} className="btn btn-outline btn-sm">✏️ Edit</Link>}
                        <Link to={`/creator/election/${e.id}/candidates`} className="btn btn-outline btn-sm">👥</Link>
                        <Link to={`/creator/election/${e.id}/voters`} className="btn btn-outline btn-sm">📋</Link>
                        <Link to={`/creator/election/${e.id}/control`} className="btn btn-primary btn-sm">⚙️ Control</Link>
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
  );
}

// ─── ELECTION FORM (shared for create & edit) ─────────────────────────────────
function ElectionForm({ initial, onSubmit, loading, submitLabel }) {
  const [form, setForm] = useState(initial || { title: '', description: '', category: 'General', start_time: '', end_time: '', registration_deadline: '', max_voters: 1000 });
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic Information</h3>
        <div className="form-group"><label className="form-label">Election Title *</label><input className="form-control" value={form.title} onChange={set('title')} required placeholder="e.g. Student Union Election 2025" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={4} value={form.description} onChange={set('description')} placeholder="Describe the election purpose and rules..." /></div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Schedule</h3>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Start Date & Time *</label><input className="form-control" type="datetime-local" value={form.start_time} onChange={set('start_time')} required /></div>
          <div className="form-group"><label className="form-label">End Date & Time *</label><input className="form-control" type="datetime-local" value={form.end_time} onChange={set('end_time')} required /></div>
        </div>
        <div className="form-group"><label className="form-label">Registration Deadline *</label><input className="form-control" type="datetime-local" value={form.registration_deadline} onChange={set('registration_deadline')} required /><p className="form-hint">Voters must register before this deadline.</p></div>
      </div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voter Limit</h3>
        <div className="form-group"><label className="form-label">Maximum Voters *</label><input className="form-control" type="number" min={2} max={100000} value={form.max_voters} onChange={set('max_voters')} required /><p className="form-hint">Election auto-locks when this limit is reached.</p></div>
      </div>
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
        {loading ? <><span className="spinner" /> Saving...</> : submitLabel}
      </button>
    </form>
  );
}

// ─── CREATE ELECTION ──────────────────────────────────────────────────────────
export function CreateElection() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleCreate(form) {
    if (new Date(form.end_time) <= new Date(form.start_time)) { toast.error('End time must be after start time'); return; }
    if (new Date(form.registration_deadline) >= new Date(form.start_time)) { toast.error('Registration deadline must be before start time'); return; }
    setLoading(true);
    const { data, error } = await supabase.from('elections').insert({ ...form, max_voters: parseInt(form.max_voters), creator_id: user.id, status: 'draft' }).select().single();
    if (error) { toast.error(error.message); setLoading(false); return; }
    await logAudit(user.id, profile?.full_name, 'election_created', 'election', data.id, { title: form.title });
    toast.success('Election created! Now add candidates.');
    navigate(`/creator/election/${data.id}/candidates`);
  }

  return (
    <CreatorLayout>
      <div style={{ marginBottom: '24px' }}><button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm">← Back</button></div>
      <div className="page-header"><h1>Create New Election</h1><p>Set up the details for your election</p></div>
      <div style={{ maxWidth: '680px' }}>
        <ElectionForm onSubmit={handleCreate} loading={loading} submitLabel="✓ Create Election & Add Candidates →" />
      </div>
    </CreatorLayout>
  );
}

// ─── EDIT ELECTION ────────────────────────────────────────────────────────────
export function EditElection() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({ data }) => setElection(data));
  }, [id]);

  async function handleUpdate(form) {
    setLoading(true);
    const { error } = await supabase.from('elections').update({ ...form, max_voters: parseInt(form.max_voters) }).eq('id', id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    await logAudit(user.id, profile?.full_name, 'election_edited', 'election', id);
    toast.success('Election updated!');
    navigate('/creator');
  }

  if (!election) return <LoadingSpinner fullPage />;

  const initial = {
    ...election,
    start_time: election.start_time?.slice(0, 16) || '',
    end_time: election.end_time?.slice(0, 16) || '',
    registration_deadline: election.registration_deadline?.slice(0, 16) || ''
  };

  return (
    <CreatorLayout>
      <div style={{ marginBottom: '24px' }}><button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm">← Back</button></div>
      <div className="page-header"><h1>Edit Election</h1><p>Update election details (only available before publishing)</p></div>
      <div style={{ maxWidth: '680px' }}>
        <ElectionForm initial={initial} onSubmit={handleUpdate} loading={loading} submitLabel="✓ Save Changes" />
      </div>
    </CreatorLayout>
  );
}

// ─── MANAGE CANDIDATES ────────────────────────────────────────────────────────
export function ManageCandidates() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ name: '', designation: '', manifesto: '', photo_url: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({ data }) => setElection(data));
    supabase.from('candidates').select('*').eq('election_id', id).order('created_at').then(({ data }) => setCandidates(data || []));
  }, [id]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('candidates').update(form).eq('id', editing.id);
        setCandidates(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
        toast.success('Candidate updated!');
        setEditing(null);
      } else {
        const { data, error } = await supabase.from('candidates').insert({ election_id: id, ...form }).select().single();
        if (error) throw error;
        setCandidates(prev => [...prev, data]);
        toast.success('Candidate added!');
      }
      setForm({ name: '', designation: '', manifesto: '', photo_url: '' });
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  }

  async function handleDelete(cId) {
    if (!window.confirm('Delete this candidate?')) return;
    await supabase.from('candidates').delete().eq('id', cId);
    setCandidates(prev => prev.filter(c => c.id !== cId));
    toast.success('Candidate removed');
  }

  async function publishElection() {
    if (candidates.length < 2) { toast.error('Add at least 2 candidates first!'); return; }
    await supabase.from('elections').update({ status: 'published' }).eq('id', id);
    await logAudit(user.id, profile?.full_name, 'election_published', 'election', id, { title: election.title });
    toast.success('🎉 Election published! Voters can now register.');
    navigate('/creator');
  }

  return (
    <CreatorLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom: '8px' }}>← Back</button>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Manage Candidates</h1>
          <p style={{ color: 'var(--text2)' }}>{election?.title}</p>
        </div>
        {election?.status === 'draft' && candidates.length >= 2 && (
          <button onClick={publishElection} className="btn btn-success btn-lg">🚀 Publish Election</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Candidate List */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Candidates ({candidates.length})</h3>
          {candidates.length < 2 && <div className="alert alert-warning">⚠️ Add at least 2 candidates to publish the election.</div>}
          {candidates.map((c, i) => (
            <div key={c.id} className="card" style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: '22px' }}>
                {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{c.name}</h4>
                    {c.designation && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '2px' }}>{c.designation}</p>}
                    {c.manifesto && <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.6 }}>{c.manifesto}</p>}
                  </div>
                  {election?.status === 'draft' && (
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditing(c); setForm({ name: c.name, designation: c.designation || '', manifesto: c.manifesto || '', photo_url: c.photo_url || '' }); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {candidates.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '32px' }}><p style={{ color: 'var(--text2)' }}>No candidates yet. Add using the form →</p></div>}
        </div>

        {/* Add/Edit Form */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{editing ? '✏️ Edit Candidate' : '➕ Add Candidate'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={set('name')} required placeholder="Candidate full name" /></div>
              <div className="form-group"><label className="form-label">Position/Designation</label><input className="form-control" value={form.designation} onChange={set('designation')} placeholder="e.g. President Candidate" /></div>
              <div className="form-group"><label className="form-label">Photo URL</label><input className="form-control" value={form.photo_url} onChange={set('photo_url')} placeholder="https://..." /><p className="form-hint">Direct image URL (optional)</p></div>
              <div className="form-group"><label className="form-label">Manifesto / Description</label><textarea className="form-control" rows={4} value={form.manifesto} onChange={set('manifesto')} placeholder="Campaign goals, manifesto..." /></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editing && <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setForm({ name: '', designation: '', manifesto: '', photo_url: '' }); }}>Cancel</button>}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : editing ? '✓ Update' : '+ Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}

// ─── VOTER LIST ───────────────────────────────────────────────────────────────
export function VoterListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({ data }) => setElection(data));
    supabase.from('voter_registrations').select('*, profiles(full_name, email, phone)').eq('election_id', id).order('registered_at')
      .then(({ data }) => { setVoters(data || []); setLoading(false); });
  }, [id]);

  const statusColor = { registered: 'var(--accent)', finalized: 'var(--success)', waitlisted: 'var(--warning)', voted: 'var(--accent2)' };
  const counts = { registered: voters.filter(v => v.status === 'registered').length, finalized: voters.filter(v => v.status === 'finalized').length, voted: voters.filter(v => v.status === 'voted').length, waitlisted: voters.filter(v => v.status === 'waitlisted').length };

  return (
    <CreatorLayout>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom: '8px' }}>← Back</button>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Voter List</h1>
        <p style={{ color: 'var(--text2)' }}>{election?.title}</p>
      </div>
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[{ label: 'Registered', value: counts.registered, color: 'var(--accent)' }, { label: 'Finalized', value: counts.finalized, color: 'var(--success)' }, { label: 'Voted', value: counts.voted, color: 'var(--accent2)' }, { label: 'Waitlisted', value: counts.waitlisted, color: 'var(--warning)' }]
          .map(s => <div key={s.label} className="stat-card"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>)}
      </div>
      {election?.is_locked && <div className="alert alert-info" style={{ marginBottom: '20px' }}>🔒 Voter list is locked. {counts.finalized + counts.voted} voters finalized with secret codes.</div>}
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Secret Code</th><th>Status</th><th>Registered</th></tr></thead>
              <tbody>
                {voters.map((v, i) => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{v.profiles?.full_name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{v.profiles?.email}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent2)' }}>
                      {v.secret_code ? `****${v.secret_code.slice(-4)}` : '—'}
                    </td>
                    <td><span style={{ color: statusColor[v.status], fontWeight: 500, fontSize: '13px' }}>● {v.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(v.registered_at).toLocaleString()}</td>
                  </tr>
                ))}
                {voters.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)', padding: '32px' }}>No voters registered yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}

// ─── ELECTION CONTROL ─────────────────────────────────────────────────────────
export function ElectionControl() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [voterStats, setVoterStats] = useState({ registered: 0, finalized: 0, voted: 0 });

  useEffect(() => {
    supabase.from('elections').select('*').eq('id', id).single().then(({ data }) => { setElection(data); setLoading(false); });
    loadStats();
  }, [id]);

  async function loadStats() {
    const { data } = await supabase.from('voter_registrations').select('status').eq('election_id', id);
    if (data) setVoterStats({ registered: data.filter(v => v.status === 'registered').length, finalized: data.filter(v => v.status === 'finalized').length, voted: data.filter(v => v.status === 'voted').length });
  }

  async function changeStatus(newStatus) {
    if (!window.confirm(`Change election status to "${newStatus}"?`)) return;
    setChanging(true);
    try {
      if (newStatus === 'active') {
        // Finalize all registered voters & generate secret codes
        await supabase.rpc('finalize_voters', { p_election_id: id });
        // Notify all finalized voters
        const { data: voters } = await supabase.from('voter_registrations').select('voter_id, secret_code').eq('election_id', id).eq('status', 'finalized');
        for (const v of voters || []) {
          await createNotification(v.voter_id, '🗳️ Election Started!', `Election "${election.title}" has started. Your secret code: ${v.secret_code}. Visit VoteSecure to vote!`, 'success');
        }
      }
      if (newStatus === 'completed') {
        // Calculate winner
        const { data: cands } = await supabase.from('candidates').select('*').eq('election_id', id).order('vote_count', { ascending: false });
        if (cands && cands.length > 0) {
          await supabase.from('elections').update({ winner_id: cands[0].id }).eq('id', id);
          await createNotification(election.creator_id, '🏆 Election Completed!', `Winner: ${cands[0].name} with ${cands[0].vote_count} votes.`, 'success');
        }
      }
      await supabase.from('elections').update({ status: newStatus }).eq('id', id);
      await logAudit(user.id, profile?.full_name, `election_${newStatus}`, 'election', id, { title: election.title });
      setElection(prev => ({ ...prev, status: newStatus }));
      toast.success(`Election is now ${newStatus}!`);
      loadStats();
    } catch (err) { toast.error(err.message); }
    setChanging(false);
  }

  if (loading) return <LoadingSpinner fullPage />;

  const statusFlow = { draft: { next: 'published', label: '🚀 Publish Election', cls: 'btn-primary' }, published: { next: 'active', label: '▶️ Start Election & Finalize Voters', cls: 'btn-success' }, active: { next: 'completed', label: '⏹️ End Election & Declare Winner', cls: 'btn-danger' }, completed: null };
  const nextAction = statusFlow[election?.status];

  return (
    <CreatorLayout>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/creator')} className="btn btn-outline btn-sm" style={{ marginBottom: '8px' }}>← Back</button>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Election Control</h1>
        <p style={{ color: 'var(--text2)' }}>{election?.title}</p>
      </div>
      <div style={{ maxWidth: '640px' }}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '20px' }}>
            <div><p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>Current Status</p><span className={`badge badge-${election?.status}`} style={{ fontSize: '13px', padding: '5px 12px' }}>{election?.status}</span></div>
            <div style={{ textAlign: 'right' }}><p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>Voter Lock</p><span style={{ fontWeight: 600 }}>{election?.is_locked ? '🔒 Locked' : '🔓 Open'}</span></div>
          </div>

          <div className="grid-3" style={{ marginBottom: '20px' }}>
            {[{ label: 'Registered', value: voterStats.registered, color: 'var(--accent)' }, { label: 'Finalized', value: voterStats.finalized, color: 'var(--success)' }, { label: 'Voted', value: voterStats.voted, color: 'var(--accent2)' }]
              .map(s => <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg3)', borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div><div style={{ fontSize: '12px', color: 'var(--text2)' }}>{s.label}</div></div>)}
          </div>

          {election?.status === 'published' && (
            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
              ℹ️ Starting the election will <strong>finalize all registered voters</strong> and send them secret voting codes automatically.
            </div>
          )}
          {election?.status === 'active' && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              ⚠️ Ending the election will <strong>close voting and declare the winner</strong>. This cannot be undone.
            </div>
          )}

          {nextAction ? (
            <button className={`btn ${nextAction.cls} btn-full btn-lg`} onClick={() => changeStatus(nextAction.next)} disabled={changing}>
              {changing ? <><span className="spinner" /> Processing...</> : nextAction.label}
            </button>
          ) : (
            <div className="alert alert-success">
              ✅ Election completed!
              <button className="btn btn-outline btn-sm" style={{ marginLeft: '12px' }} onClick={() => navigate(`/results/${id}`)}>View Results →</button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '12px' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => navigate(`/creator/election/${id}/candidates`)} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>Manage Candidates →</button>
            <button onClick={() => navigate(`/creator/election/${id}/voters`)} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>View Voter List →</button>
            <button onClick={() => navigate(`/results/${id}`)} className="btn btn-outline" style={{ justifyContent: 'space-between' }}>Live Results →</button>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}

export default CreatorDashboard;
