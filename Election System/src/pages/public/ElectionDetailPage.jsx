import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Share2, Copy, Lock, Users, Calendar, ArrowRight } from 'lucide-react'
import { supabase, logAudit, createNotification } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge, LoadingPage, Spinner, Alert, Countdown, ProgressBar, QRShare } from '../../components/ui/index.jsx'

export default function ElectionDetailPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [election, setElection]       = useState(null)
  const [candidates, setCandidates]   = useState([])
  const [registration, setRegistration] = useState(null)
  const [voterCount, setVoterCount]   = useState(0)
  const [loading, setLoading]         = useState(true)
  const [registering, setRegistering] = useState(false)
  const [terms, setTerms]             = useState(false)

  useEffect(() => { load() }, [id, user])

  async function load() {
    const [{ data: el }, { data: cands }, { count }] = await Promise.all([
      supabase.from('elections').select('*').eq('id', id).single(),
      supabase.from('candidates').select('*').eq('election_id', id).order('name'),
      supabase.from('voter_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('election_id', id).in('status', ['registered','finalized','voted'])
    ])
    setElection(el); setCandidates(cands || []); setVoterCount(count || 0)
    if (user) {
      const { data: reg } = await supabase.from('voter_registrations')
        .select('*').eq('election_id', id).eq('voter_id', user.id).maybeSingle()
      setRegistration(reg)
    }
    setLoading(false)
  }

  async function handleRegister() {
    if (!user) { navigate('/login'); return }
    if (!terms) { toast.error('Please accept the terms'); return }
    setRegistering(true)
    try {
      const isFull = voterCount >= election.max_voters
      const { error } = await supabase.from('voter_registrations').insert({
        election_id: id, voter_id: user.id,
        status: isFull ? 'waitlisted' : 'registered',
        terms_accepted: true
      })
      if (error) throw error
      await logAudit(user.id, profile?.full_name, isFull ? 'voter_waitlisted' : 'voter_registered', 'election', id, { title: election.title })
      await createNotification(user.id,
        isFull ? 'Added to Waitlist' : '✅ Registration Confirmed!',
        isFull ? `You're on the waitlist for "${election.title}"` : `Successfully registered for "${election.title}"`,
        isFull ? 'warning' : 'success'
      )
      toast.success(isFull ? '📋 Added to waitlist!' : '✅ Registered successfully!')
      setRegistration({ status: isFull ? 'waitlisted' : 'registered' })
      if (!isFull) setVoterCount(v => v + 1)
    } catch (err) { toast.error(err.message) }
    setRegistering(false)
  }

  if (loading) return <LoadingPage />
  if (!election) return <div className="page-wrapper"><Alert type="danger">Election not found.</Alert></div>

  const regOpen = new Date() < new Date(election.registration_deadline)
  const shareUrl = `${window.location.origin}/election/${id}`

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">← Back</button>
        <Badge variant={election.status}>
          {election.status === 'active' && <span className="live-dot mr-1" />}
          {election.status}
        </Badge>
        {election.category && <span className="chip">{election.category}</span>}
        {election.is_locked && <span className="chip"><Lock size={10} /> Locked</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-surface-50 mb-3 leading-tight">{election.title}</h1>
            <p className="text-surface-400 leading-relaxed">{election.description}</p>
          </div>

          {/* Countdown */}
          {election.status === 'active' && (
            <Countdown target={election.end_time} label="⏰ Election closes in" />
          )}
          {election.status === 'published' && (
            <Countdown target={election.start_time} label="🚀 Election starts in" />
          )}

          {/* Vote/status alerts */}
          {election.status === 'active' && registration?.status === 'finalized' && (
            <Alert type="success">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">🎫 You are authorized to vote!</p>
                  <p className="text-xs mt-0.5 opacity-80">Code ends: <span className="font-mono font-bold">****{registration.secret_code?.slice(-4)}</span></p>
                </div>
                <button onClick={() => navigate(`/vote/${id}`)} className="btn btn-success btn-sm">
                  Vote Now <ArrowRight size={13} />
                </button>
              </div>
            </Alert>
          )}
          {registration?.status === 'voted' && (
            <Alert type="success">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span>✅ You have already cast your vote!</span>
                <Link to={`/results/${id}`} className="btn btn-secondary btn-sm">View Results</Link>
              </div>
            </Alert>
          )}

          {/* Share */}
          <div className="flex gap-2 items-center flex-wrap">
            <QRShare url={shareUrl} title="Scan to access election" />
            <button onClick={() => { navigator.clipboard?.writeText(shareUrl); toast.success('Link copied!') }}
              className="btn btn-secondary btn-sm">
              <Copy size={13} /> Copy Link
            </button>
          </div>

          {/* Candidates */}
          <div>
            <h2 className="font-display font-bold text-xl text-surface-100 mb-4">
              Candidates <span className="text-surface-500 font-normal text-base">({candidates.length})</span>
            </h2>
            {candidates.length === 0 ? (
              <Alert type="warning">No candidates have been added yet.</Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates.map(c => (
                  <div key={c.id} className="card-hover flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                      {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" /> : '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-surface-100">{c.name}</p>
                      {c.designation && <p className="text-xs text-brand-400 mt-0.5">{c.designation}</p>}
                      {c.manifesto && <p className="text-xs text-surface-400 mt-1.5 leading-relaxed truncate-3">{c.manifesto}</p>}
                      {(election.status === 'active' || election.status === 'completed') && (
                        <p className="text-xs text-success-400 font-semibold mt-2">🗳️ {c.vote_count || 0} votes</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration card */}
          <div className="card">
            <h3 className="font-display font-bold text-base mb-4">Voter Registration</h3>
            <ProgressBar value={voterCount} max={election.max_voters} color="blue" showLabel className="mb-4" />
            {voterCount / election.max_voters >= 0.9 && !election.is_locked && (
              <Alert type="warning" className="mb-3 py-2"><span className="text-xs">⚠️ Almost full!</span></Alert>
            )}
            {election.is_locked && (
              <Alert type="danger" className="mb-3 py-2"><span className="text-xs">🔒 Registration closed</span></Alert>
            )}

            {!registration && election.status === 'published' && regOpen && !election.is_locked && (
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer mb-4">
                  <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                    className="mt-0.5 accent-brand-500" />
                  <span className="text-xs text-surface-400 leading-relaxed">
                    I agree to participate honestly and understand that my vote is anonymous and final.
                  </span>
                </label>
                <button onClick={handleRegister} disabled={registering || !terms} className="btn btn-primary btn-full">
                  {registering ? <><Spinner size="sm" /> Registering...</> : '✋ I Want to Participate'}
                </button>
              </div>
            )}
            {!registration && election.status === 'published' && !regOpen && (
              <Alert type="warning"><span className="text-xs">📅 Registration deadline passed</span></Alert>
            )}
            {!registration && !user && (
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-full">Login to Register</button>
            )}
            {registration && (
              <div className={`p-3 rounded-xl text-sm ${
                registration.status === 'waitlisted' ? 'bg-warning-500/10 border border-warning-500/20 text-warning-300' :
                'bg-success-500/10 border border-success-500/20 text-success-300'
              }`}>
                <p className="font-semibold">
                  {registration.status === 'waitlisted' ? '📋 On Waitlist' :
                   registration.status === 'voted' ? '✅ Vote Cast!' :
                   registration.status === 'finalized' ? '🎫 Authorized Voter' : '✅ Registered!'}
                </p>
                {registration.status === 'finalized' && registration.secret_code && (
                  <p className="text-xs mt-1 opacity-80 font-mono">Code ends: ****{registration.secret_code.slice(-4)}</p>
                )}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="card">
            <h3 className="font-display font-bold text-base mb-4">Election Info</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Category',   value: election.category || '—' },
                { label: 'Start',      value: new Date(election.start_time).toLocaleString() },
                { label: 'End',        value: new Date(election.end_time).toLocaleString() },
                { label: 'Reg. Deadline', value: new Date(election.registration_deadline).toLocaleString() },
                { label: 'Max Voters', value: election.max_voters.toLocaleString() },
                { label: 'Candidates', value: candidates.length },
              ].map(item => (
                <div key={item.label} className="flex justify-between gap-3">
                  <span className="text-surface-500">{item.label}</span>
                  <span className="text-surface-200 font-medium text-right text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {election.status === 'completed' && (
            <Link to={`/results/${id}`} className="btn btn-primary btn-full">📊 View Final Results</Link>
          )}
          {election.status === 'active' && registration?.status === 'finalized' && (
            <button onClick={() => navigate(`/vote/${id}`)} className="btn btn-violet btn-full btn-lg">
              🗳️ Cast Your Vote
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
