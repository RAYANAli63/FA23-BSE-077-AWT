import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase, logAudit, createNotification } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// ─── SESSION USER ID BANNER ───────────────────────────────────────────────────
function UserIDBanner({ user }) {
  const [copied, setCopied] = useState(false);
  const sessionId = `VS-${user.id.slice(0,8).toUpperCase()}`;
  const fullId = user.id;

  const copy = (val) => {
    navigator.clipboard?.writeText(val).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="user-id-full fade-in" style={{ marginBottom: '28px' }}>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>
          🔐 Your Session User ID
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="session-id-display">{sessionId}</span>
          <button onClick={() => copy(sessionId)} className="btn btn-outline btn-sm copy-btn">
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '5px' }}>
          Full ID: <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{fullId.slice(0,20)}...</span>
          <button onClick={() => copy(fullId)} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '4px' }}>Copy full</button>
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px' }}>New ID each session</div>
        <span className="badge badge-active">● Active</span>
      </div>
    </div>
  );
}

// ─── VOTER DASHBOARD ──────────────────────────────────────────────────────────
export function VoterDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('voter_registrations')
      .select('*, elections(id, title, status, start_time, end_time, category, max_voters)')
      .eq('voter_id', user.id).order('registered_at', { ascending: false })
      .then(({ data }) => { setRegistrations(data || []); setLoading(false); });
  }, [user]);

  const statusMap = {
    registered: { label: '✅ Registered', badge: 'approved' },
    finalized: { label: '🎫 Authorized', badge: 'active' },
    waitlisted: { label: '📋 Waitlisted', badge: 'pending' },
    voted: { label: '🗳️ Voted', badge: 'completed' }
  };

  const pendingVotes = registrations.filter(r => r.status === 'finalized' && r.elections?.status === 'active');

  return (
    <div className="container page">
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <h1>My Dashboard</h1>
        <p style={{ color: 'var(--text2)', marginTop: '4px' }}>Welcome back, <strong>{profile?.full_name}</strong> 👋</p>
      </div>

      {/* User ID Banner */}
      <UserIDBanner user={user} />

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Elections Joined', value: registrations.length, color: 'var(--accent)', icon: '🗳️' },
          { label: 'Votes Cast', value: registrations.filter(r => r.status === 'voted').length, color: 'var(--success)', icon: '✅' },
          { label: 'Pending Votes', value: registrations.filter(r => r.status === 'finalized').length, color: 'var(--accent2)', icon: '⏳' },
          { label: 'Waitlisted', value: registrations.filter(r => r.status === 'waitlisted').length, color: 'var(--warning)', icon: '📋' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pendingVotes.length > 0 && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          🎉 You have <strong>{pendingVotes.length}</strong> election(s) waiting for your vote!
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 600 }}>My Elections</h2>
        <Link to="/" className="btn btn-outline btn-sm">Browse Elections →</Link>
      </div>

      {loading ? <LoadingSpinner /> : registrations.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🗳️</div>
          <h3>No elections joined yet</h3>
          <p>Browse elections and click "I Want to Participate"</p>
          <Link to="/" className="btn btn-primary">Explore Elections</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {registrations.map(r => (
            <div key={r.id} className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontWeight: 600 }}>{r.elections?.title}</h4>
                  <span className={`badge badge-${r.elections?.status}`}>{r.elections?.status}</span>
                  <span className={`badge badge-${statusMap[r.status]?.badge}`}>{statusMap[r.status]?.label}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
                  {r.elections?.category} • {new Date(r.elections?.start_time).toLocaleDateString()}
                </p>
                {r.status === 'finalized' && r.secret_code && (
                  <p style={{ fontSize: '12px', color: 'var(--accent2)', marginTop: '4px', fontFamily: 'monospace' }}>
                    🔑 Code ends in: <strong>****{r.secret_code.slice(-4)}</strong>
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {r.status === 'finalized' && r.elections?.status === 'active' && (
                  <button onClick={() => navigate(`/vote/${r.elections?.id}`)} className="btn btn-purple btn-sm">
                    🗳️ Vote Now
                  </button>
                )}
                {r.elections?.status === 'completed' && (
                  <Link to={`/results/${r.elections?.id}`} className="btn btn-outline btn-sm">📊 Results</Link>
                )}
                <Link to={`/election/${r.elections?.id}`} className="btn btn-outline btn-sm">Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VOTING PAGE ──────────────────────────────────────────────────────────────
export function VotingPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [step, setStep] = useState('verify');
  const [secretInput, setSecretInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const sessionId = user ? `VS-${user.id.slice(0,8).toUpperCase()}` : null;

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }, { data: reg }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('name'),
        supabase.from('voter_registrations').select('*').eq('election_id', id).eq('voter_id', user.id).maybeSingle()
      ]);
      setElection(el); setCandidates(cands || []); setRegistration(reg);
      if (reg?.status === 'voted') setStep('confirmed');
      setLoading(false);
    }
    load();
  }, [id, user]);

  useEffect(() => {
    if (!election?.end_time) return;
    const calc = () => {
      const diff = new Date(election.end_time) - new Date();
      if (diff <= 0) { setTimeLeft('Election ended'); return; }
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [election]);

  function verifyCode() {
    if (!registration?.secret_code) { toast.error('You are not a finalized voter for this election.'); return; }
    if (secretInput.trim().toUpperCase() !== registration.secret_code.toUpperCase()) {
      toast.error('❌ Invalid secret code. Please check your email/notifications.'); return;
    }
    setStep('vote');
    toast.success('✅ Code verified! Select your candidate.');
  }

  async function castVote() {
    if (!selectedCandidate) { toast.error('Please select a candidate'); return; }
    if (!window.confirm('Are you sure? Your vote is final and cannot be changed.')) return;
    setSubmitting(true);
    try {
      const { error: vErr } = await supabase.from('votes').insert({
        election_id: id, candidate_id: selectedCandidate, secret_code: registration.secret_code
      });
      if (vErr) {
        if (vErr.message.includes('unique')) throw new Error('You have already voted!');
        throw vErr;
      }
      await supabase.rpc('increment_vote', { p_candidate_id: selectedCandidate });
      await supabase.from('voter_registrations').update({ status: 'voted', voted_at: new Date().toISOString() }).eq('id', registration.id);
      await logAudit(user.id, profile?.full_name, 'vote_cast', 'election', id, { anonymous: true, session_id: sessionId });
      await createNotification(user.id, '✅ Vote Cast!', `Your vote in "${election.title}" has been recorded anonymously.`, 'success');
      setStep('confirmed');
      toast.success('🎉 Vote cast successfully!');
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  }

  if (loading) return <LoadingSpinner fullPage />;

  if (!election) return <div className="container page"><div className="alert alert-danger">Election not found.</div></div>;

  if (election.status !== 'active') return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏸️</div>
        <h2>Election Not Active</h2>
        <p style={{ color: 'var(--text2)', margin: '10px 0 24px' }}>Status: <strong>{election.status}</strong></p>
        <button onClick={() => navigate(`/election/${id}`)} className="btn btn-outline">← Back to Election</button>
      </div>
    </div>
  );

  if (!registration || registration.status === 'registered' || registration.status === 'waitlisted') return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚫</div>
        <h2>Not Authorized</h2>
        <p style={{ color: 'var(--text2)', margin: '10px 0 24px' }}>You are not a finalized voter for this election.</p>
        <button onClick={() => navigate(`/election/${id}`)} className="btn btn-outline">← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.07) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{election.title}</h2>
          {timeLeft && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ color: 'var(--danger)' }}>⏰</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--danger)', fontSize: '14px' }}>{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Session ID display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Your Session ID:</span>
          <span className="user-id-badge">{sessionId}</span>
        </div>

        {/* Step 1: Verify */}
        {step === 'verify' && (
          <div className="card fade-in" style={{ boxShadow: 'var(--shadow)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔐</div>
              <h1 style={{ fontSize: '22px' }}>Verify Your Identity</h1>
              <p style={{ color: 'var(--text2)', marginTop: '8px', fontSize: '14px' }}>Enter the secret voter code from your email or notifications.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Secret Voter Code</label>
              <input className="form-control" placeholder="POLL-XXXX-0001" value={secretInput}
                onChange={e => setSecretInput(e.target.value.toUpperCase())}
                style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '20px', letterSpacing: '0.1em' }} />
              <p className="form-hint" style={{ textAlign: 'center' }}>Check your VoteSecure notifications or email inbox</p>
            </div>
            {registration?.secret_code && (
              <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                💡 Your code ends in: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>****{registration.secret_code.slice(-4)}</span>
              </div>
            )}
            <button onClick={verifyCode} className="btn btn-purple btn-full btn-lg" disabled={!secretInput}>
              Verify & Continue →
            </button>
            <button onClick={() => navigate(`/election/${id}`)} className="btn btn-ghost btn-full" style={{ marginTop: '8px' }}>Cancel</button>
          </div>
        )}

        {/* Step 2: Vote */}
        {step === 'vote' && (
          <div className="card fade-in" style={{ boxShadow: 'var(--shadow)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '44px', marginBottom: '8px' }}>🗳️</div>
              <h1 style={{ fontSize: '22px' }}>Cast Your Vote</h1>
              <div className="alert alert-info" style={{ marginTop: '14px', fontSize: '13px' }}>
                🔒 Your vote is anonymous. Candidates can see your Session ID but not your personal info.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {candidates.map(c => (
                <div key={c.id} className={`candidate-vote-card${selectedCandidate === c.id ? ' selected' : ''}`}
                  onClick={() => setSelectedCandidate(c.id)}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: '22px' }}>
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{c.name}</div>
                    {c.designation && <div style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '2px' }}>{c.designation}</div>}
                    {c.manifesto && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.5 }}>{c.manifesto.substring(0, 80)}{c.manifesto.length > 80 ? '...' : ''}</div>}
                  </div>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `2px solid ${selectedCandidate === c.id ? 'var(--accent2)' : 'var(--border2)'}`, background: selectedCandidate === c.id ? 'var(--accent2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {selectedCandidate === c.id && <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={castVote} className="btn btn-purple btn-full btn-lg" disabled={!selectedCandidate || submitting}>
              {submitting ? <><span className="spinner" /> Submitting vote...</> : '✅ Confirm Vote'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', marginTop: '10px' }}>
              This action is irreversible. Your identity remains protected.
            </p>
          </div>
        )}

        {/* Step 3: Confirmed */}
        {step === 'confirmed' && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '56px 32px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '70px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '26px', marginBottom: '10px' }}>Vote Cast!</h1>
            <p style={{ color: 'var(--text2)', marginBottom: '20px', lineHeight: 1.8, fontSize: '15px' }}>
              Your anonymous vote has been securely recorded.<br />
              Thank you for participating in democracy!
            </p>
            <div className="user-id-badge" style={{ margin: '0 auto 28px', display: 'inline-flex' }}>
              Session ID: {sessionId}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/results/${id}`)} className="btn btn-primary btn-lg">📊 View Live Results</button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-outline">My Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoterDashboard;
