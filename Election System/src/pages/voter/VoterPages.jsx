import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Copy, Check, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase, logAudit, createNotification } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import {
  StatCard, Badge, LoadingPage, Spinner, Alert, ProgressBar,
  SessionIdBadge, CopyButton, Countdown
} from '../../components/ui/index.jsx'

/* ─── USER ID BANNER ─────────────────────────────────────────────────────── */
function UserIdBanner({ user, sessionId }) {
  return (
    <div className="card-gradient border border-brand-500/15 rounded-2xl p-5 mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-brand-500/20 border border-brand-500/20 flex items-center justify-center">
              <Shield size={11} className="text-brand-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-surface-500">Your Session User ID</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-2xl md:text-3xl gradient-text-blue tracking-widest">{sessionId}</span>
            <CopyButton value={sessionId} className="text-surface-500" />
          </div>
          <p className="text-surface-600 text-xs mt-1.5">
            Full ID: <span className="font-mono">{user.id.slice(0,20)}…</span>
            <CopyButton value={user.id} className="ml-1 text-surface-700" />
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <Badge variant="active">● Active Session</Badge>
          <p className="text-surface-600 text-[10px] mt-1">New ID per login</p>
        </div>
      </div>
    </div>
  )
}

/* ─── VOTER DASHBOARD ────────────────────────────────────────────────────── */
export function VoterDashboard() {
  const { user, profile, sessionId } = useAuth()
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('voter_registrations')
      .select('*, elections(id, title, status, start_time, end_time, category, max_voters, description)')
      .eq('voter_id', user.id)
      .order('registered_at', { ascending: false })
      .then(({ data }) => { setRegistrations(data || []); setLoading(false) })
  }, [user])

  const pending = registrations.filter(r => r.status === 'finalized' && r.elections?.status === 'active')
  const voted   = registrations.filter(r => r.status === 'voted')
  const all     = registrations.length

  if (loading) return <LoadingPage />

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="section-title">My Dashboard</h1>
        <p className="section-subtitle">Welcome back, <strong className="text-surface-200">{profile?.full_name}</strong> 👋</p>
      </div>

      {/* Session ID Banner */}
      <UserIdBanner user={user} sessionId={sessionId} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🗳️" label="Elections Joined" value={all} color="brand" />
        <StatCard icon="✅" label="Votes Cast" value={voted.length} color="success" />
        <StatCard icon="⏳" label="Pending Votes" value={pending.length} color="violet" />
        <StatCard icon="📋" label="Waitlisted" value={registrations.filter(r => r.status === 'waitlisted').length} color="warning" />
      </div>

      {/* Pending vote alert */}
      {pending.length > 0 && (
        <Alert type="success" className="mb-6">
          <strong>🎉 {pending.length} election{pending.length > 1 ? 's are' : ' is'} waiting for your vote!</strong>
          <p className="text-xs mt-0.5 opacity-80">Your secret codes have been sent to your email.</p>
        </Alert>
      )}

      {/* Elections list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-surface-100">My Elections</h2>
        <Link to="/" className="btn btn-secondary btn-sm">Browse All →</Link>
      </div>

      {registrations.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🗳️</div>
          <h3 className="font-bold text-lg text-surface-200 mb-2">No elections joined yet</h3>
          <p className="text-surface-500 text-sm mb-6">Browse elections and click "I Want to Participate"</p>
          <Link to="/" className="btn btn-primary">Explore Elections</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r, i) => {
            const el = r.elections
            const statusMap = {
              registered: { label: '📝 Registered', v: 'registered' },
              finalized:  { label: '🎫 Authorized', v: 'finalized' },
              waitlisted: { label: '📋 Waitlisted', v: 'waitlisted' },
              voted:      { label: '🗳️ Voted',      v: 'voted' },
            }
            const canVote = r.status === 'finalized' && el?.status === 'active'

            return (
              <div key={r.id} className="card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-surface-100">{el?.title}</h4>
                    <Badge variant={el?.status}>{el?.status}</Badge>
                    <Badge variant={statusMap[r.status]?.v}>{statusMap[r.status]?.label}</Badge>
                  </div>
                  <p className="text-surface-500 text-xs">{el?.category} • {el?.start_time && new Date(el.start_time).toLocaleDateString()}</p>
                  {r.status === 'finalized' && r.secret_code && (
                    <p className="text-xs text-violet-400 mt-1 font-mono">
                      🔑 Code ends: ****{r.secret_code.slice(-4)}
                    </p>
                  )}
                  {r.status === 'voted' && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-500">Your Session ID at vote:</span>
                      <SessionIdBadge sessionId={sessionId} showCopy={false} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {canVote && (
                    <button onClick={() => navigate(`/vote/${el?.id}`)} className="btn btn-violet btn-sm">
                      🗳️ Vote Now
                    </button>
                  )}
                  {el?.status === 'completed' && (
                    <Link to={`/results/${el?.id}`} className="btn btn-secondary btn-sm">📊 Results</Link>
                  )}
                  <Link to={`/election/${el?.id}`} className="btn btn-ghost btn-sm">Details</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── VOTING PAGE ────────────────────────────────────────────────────────── */
export function VotingPage() {
  const { id } = useParams()
  const { user, profile, sessionId } = useAuth()
  const navigate = useNavigate()
  const [election, setElection]       = useState(null)
  const [candidates, setCandidates]   = useState([])
  const [registration, setRegistration] = useState(null)
  const [step, setStep]               = useState('verify') // verify | vote | confirmed
  const [secretInput, setSecretInput] = useState('')
  const [selected, setSelected]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }, { data: reg }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('name'),
        supabase.from('voter_registrations').select('*').eq('election_id', id).eq('voter_id', user.id).maybeSingle()
      ])
      setElection(el); setCandidates(cands || []); setRegistration(reg)
      if (reg?.status === 'voted') setStep('confirmed')
      setLoading(false)
    }
    load()
  }, [id, user])

  function verify() {
    if (!registration?.secret_code) { toast.error('You are not a finalized voter.'); return }
    if (secretInput.trim().toUpperCase() !== registration.secret_code.toUpperCase()) {
      toast.error('❌ Invalid secret code. Check your email/notifications.')
      return
    }
    setStep('vote')
    toast.success('✅ Code verified!')
  }

  async function castVote() {
    if (!selected) { toast.error('Please select a candidate'); return }
    if (!window.confirm('Cast your vote? This is final and cannot be changed.')) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('votes').insert({
        election_id: id, candidate_id: selected, secret_code: registration.secret_code
      })
      if (error) {
        if (error.message?.includes('unique')) throw new Error('You have already voted!')
        throw error
      }
      await supabase.rpc('increment_vote', { p_candidate_id: selected })
      await supabase.from('voter_registrations')
        .update({ status: 'voted', voted_at: new Date().toISOString() })
        .eq('id', registration.id)
      await logAudit(user.id, profile?.full_name, 'vote_cast', 'election', id, {
        anonymous: true, session_id: sessionId
      })
      await createNotification(user.id, '✅ Vote Cast!',
        `Your vote in "${election.title}" is recorded. Session ID: ${sessionId}`, 'success')
      setStep('confirmed')
      toast.success('🎉 Vote cast successfully!')
    } catch (err) { toast.error(err.message) }
    setSubmitting(false)
  }

  if (loading) return <LoadingPage />

  if (!election) return (
    <div className="page-wrapper"><Alert type="danger">Election not found.</Alert></div>
  )

  if (election.status !== 'active') return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="card text-center p-16 max-w-sm w-full">
        <div className="text-5xl mb-4">⏸️</div>
        <h2 className="font-bold text-lg mb-2">Election Not Active</h2>
        <p className="text-surface-400 text-sm mb-6">Status: <Badge variant={election.status}>{election.status}</Badge></p>
        <button onClick={() => navigate(`/election/${id}`)} className="btn btn-secondary">← Back to Election</button>
      </div>
    </div>
  )

  if (!registration || ['registered','waitlisted'].includes(registration.status)) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="card text-center p-16 max-w-sm w-full">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="font-bold text-lg mb-2">Not Authorized</h2>
        <p className="text-surface-400 text-sm mb-6">You haven't been finalized as a voter for this election.</p>
        <button onClick={() => navigate(`/election/${id}`)} className="btn btn-secondary">← Back</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.06) 0%, transparent 60%)' }}>
      <div className="w-full max-w-xl">
        {/* Election title */}
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-xl text-surface-100">{election.title}</h2>
          {election.end_time && (
            <div className="flex justify-center mt-3">
              <Countdown target={election.end_time} label="⏰ Voting closes in" />
            </div>
          )}
        </div>

        {/* Session ID */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-xs text-surface-600">Your Session ID:</span>
          <span className="session-id">{sessionId}</span>
        </div>

        {/* STEP 1: Verify */}
        {step === 'verify' && (
          <div className="card animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-4">🔐</div>
              <h1 className="font-display font-bold text-2xl mb-2">Verify Identity</h1>
              <p className="text-surface-400 text-sm">Enter the secret voter code sent to your email or notifications.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Secret Voter Code</label>
                <input className="input text-center font-mono text-xl tracking-[0.2em] h-14 text-brand-300"
                  placeholder="POLL-XXXX-0001"
                  value={secretInput}
                  onChange={e => setSecretInput(e.target.value.toUpperCase())} />
              </div>
              {registration?.secret_code && (
                <Alert type="info">
                  <p className="text-xs">💡 Your code ends in: <span className="font-mono font-bold">****{registration.secret_code.slice(-4)}</span></p>
                </Alert>
              )}
              <button onClick={verify} className="btn btn-violet btn-full btn-lg" disabled={!secretInput}>
                Verify &amp; Continue →
              </button>
              <button onClick={() => navigate(`/election/${id}`)} className="btn btn-ghost btn-full text-surface-500">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Vote */}
        {step === 'vote' && (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-success-500/15 border border-success-500/20 flex items-center justify-center text-2xl mx-auto mb-3">✅</div>
              <h1 className="font-display font-bold text-2xl mb-1">Cast Your Vote</h1>
              <Alert type="info" className="text-left mt-3">
                <p className="text-xs">🔒 Your vote is anonymous. Candidates can see your Session ID but not your personal info.</p>
              </Alert>
            </div>
            <div className="space-y-3 mb-6">
              {candidates.map(c => (
                <div key={c.id}
                  className={`vote-option ${selected === c.id ? 'selected' : ''}`}
                  onClick={() => setSelected(c.id)}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" /> : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-surface-100">{c.name}</p>
                    {c.designation && <p className="text-xs text-brand-400 mt-0.5">{c.designation}</p>}
                    {c.manifesto && <p className="text-xs text-surface-500 mt-1 truncate-2">{c.manifesto}</p>}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected === c.id ? 'border-violet-400 bg-violet-500' : 'border-surface-600'}`}>
                    {selected === c.id && <CheckCircle size={14} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={castVote} className="btn btn-violet btn-full btn-lg" disabled={!selected || submitting}>
              {submitting ? <><Spinner size="sm" /> Submitting...</> : '✅ Confirm Vote'}
            </button>
            <p className="text-xs text-surface-600 text-center mt-3">This action is irreversible.</p>
          </div>
        )}

        {/* STEP 3: Confirmed */}
        {step === 'confirmed' && (
          <div className="card text-center p-12 animate-fade-in">
            <div className="text-7xl mb-4 animate-bounce-sm">🎉</div>
            <h1 className="font-display font-bold text-3xl mb-3">Vote Cast!</h1>
            <p className="text-surface-400 text-sm mb-6 leading-relaxed">
              Your anonymous vote has been securely recorded.<br />
              Thank you for participating in democracy!
            </p>
            <div className="inline-flex items-center gap-2 bg-surface-800/60 border border-surface-700 rounded-xl px-4 py-2.5 mb-8">
              <Shield size={14} className="text-success-400" />
              <span className="text-xs text-surface-400">Session ID:</span>
              <span className="session-id text-xs">{sessionId}</span>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate(`/results/${id}`)} className="btn btn-primary btn-lg">📊 Live Results</button>
              <button onClick={() => navigate('/voter')} className="btn btn-secondary">My Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
