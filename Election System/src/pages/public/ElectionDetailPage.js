import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, logAudit, createNotification } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function Countdown({ target, label }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target) - new Date();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [target]);
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '10px', fontWeight: 500 }}>{label}</p>
      <div className="countdown">
        {Object.entries(t).map(([k, v]) => (
          <div className="countdown-unit" key={k}>
            <div className="countdown-num">{String(v).padStart(2, '0')}</div>
            <div className="countdown-lbl">{k === 'd' ? 'Days' : k === 'h' ? 'Hrs' : k === 'm' ? 'Min' : 'Sec'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ElectionDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [voterCount, setVoterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => { loadData(); }, [id, user]);

  async function loadData() {
    const [{ data: el }, { data: cands }, { count }] = await Promise.all([
      supabase.from('elections').select('*').eq('id', id).single(),
      supabase.from('candidates').select('*').eq('election_id', id).order('name'),
      supabase.from('voter_registrations').select('*', { count: 'exact', head: true })
        .eq('election_id', id).in('status', ['registered', 'finalized', 'voted'])
    ]);
    setElection(el);
    setCandidates(cands || []);
    setVoterCount(count || 0);
    if (user) {
      const { data: reg } = await supabase.from('voter_registrations')
        .select('*').eq('election_id', id).eq('voter_id', user.id).maybeSingle();
      setRegistration(reg);
    }
    setLoading(false);
  }

  async function handleRegister() {
    if (!user) { navigate('/login'); return; }
    if (!termsAccepted) { toast.error('Please accept the terms first'); return; }
    setRegistering(true);
    try {
      const isFull = voterCount >= election.max_voters;
      const { error } = await supabase.from('voter_registrations').insert({
        election_id: id, voter_id: user.id,
        status: isFull ? 'waitlisted' : 'registered',
        terms_accepted: true
      });
      if (error) throw error;
      await logAudit(user.id, profile?.full_name, isFull ? 'voter_waitlisted' : 'voter_registered', 'election', id, { title: election.title });
      await createNotification(user.id, isFull ? 'Added to Waitlist' : 'Registration Confirmed!',
        isFull ? `You are on the waitlist for "${election.title}"` : `You successfully registered for "${election.title}"`,
        isFull ? 'warning' : 'success'
      );
      toast.success(isFull ? '📋 Added to waitlist!' : '✅ Successfully registered!');
      setRegistration({ status: isFull ? 'waitlisted' : 'registered' });
      if (!isFull) setVoterCount(v => v + 1);
    } catch (err) {
      toast.error(err.message);
    }
    setRegistering(false);
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!election) return <div className="container page"><div className="alert alert-danger">Election not found.</div></div>;

  const regOpen = new Date() < new Date(election.registration_deadline);
  const pct = Math.min(100, Math.round((voterCount / election.max_voters) * 100));
  const shareUrl = `${window.location.origin}/election/${id}`;

  return (
    <div className="container page">
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Back</button>
        <span className={`badge badge-${election.status}`}>
          {election.status === 'active' && <span className="live-dot" style={{ marginRight: '4px' }} />}
          {election.status}
        </span>
        {election.category && <span style={{ fontSize: '12px', color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 10px', borderRadius: '20px' }}>{election.category}</span>}
        {election.is_locked && <span className="badge badge-rejected">🔒 Locked</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Content */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>{election.title}</h1>
          <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: '24px' }}>{election.description}</p>

          {/* Countdown */}
          {election.status === 'active' && <Countdown target={election.end_time} label="⏰ Election closes in:" />}
          {election.status === 'published' && <Countdown target={election.start_time} label="🚀 Election starts in:" />}

          {/* Vote Now Alert */}
          {election.status === 'active' && registration?.status === 'finalized' && (
            <div className="alert alert-success" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>🎫 You are authorized to vote!</strong>
                <p style={{ fontSize: '12px', marginTop: '2px' }}>Your secret code: <span style={{ fontFamily: 'monospace', color: 'var(--accent2)' }}>****{registration.secret_code?.slice(-4)}</span></p>
              </div>
              <button onClick={() => navigate(`/vote/${id}`)} className="btn btn-success btn-sm">Vote Now →</button>
            </div>
          )}
          {registration?.status === 'voted' && (
            <div className="alert alert-success">✅ You have already cast your vote! <button onClick={() => navigate(`/results/${id}`)} className="btn btn-outline btn-sm" style={{ marginLeft: '8px' }}>View Results</button></div>
          )}

          {/* QR Invite - Bonus Feature */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowQR(!showQR)} className="btn btn-outline btn-sm">
              {showQR ? '❌ Hide QR' : '📲 Share QR Code'}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }} className="btn btn-outline btn-sm">
              🔗 Copy Link
            </button>
          </div>
          {showQR && (
            <div className="card" style={{ display: 'inline-block', marginBottom: '24px', textAlign: 'center' }}>
              <div className="qr-container"><QRCodeSVG value={shareUrl} size={160} /></div>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>Scan to access this election</p>
            </div>
          )}

          {/* Candidates */}
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
            Candidates ({candidates.length})
          </h2>
          {candidates.length === 0 ? (
            <div className="alert alert-warning">No candidates added yet.</div>
          ) : (
            <div className="grid-2">
              {candidates.map(c => (
                <div key={c.id} className="card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: '22px' }}>
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '2px' }}>{c.name}</h4>
                    {c.designation && <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px' }}>{c.designation}</p>}
                    {c.manifesto && <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>{c.manifesto}</p>}
                    {election.status === 'active' || election.status === 'completed' ? (
                      <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>
                        🗳️ {c.vote_count || 0} votes
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Registration Card */}
          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Voter Registration</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px' }}>
                <span>Registered</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{voterCount} / {election.max_voters}</span>
              </div>
              <div className="progress"><div className="progress-bar progress-blue" style={{ width: `${pct}%` }} /></div>
              {pct >= 90 && !election.is_locked && <p style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '4px' }}>⚠️ Almost full!</p>}
              {election.is_locked && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>🔒 Registration closed</p>}
            </div>

            {/* Registration Action */}
            {!registration && election.status === 'published' && regOpen && !election.is_locked && (
              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text2)', marginBottom: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: '2px' }} />
                  I agree to participate honestly and understand that my vote is anonymous and final.
                </label>
                <button onClick={handleRegister} disabled={registering || !termsAccepted} className="btn btn-primary btn-full">
                  {registering ? <><span className="spinner" /> Registering...</> : '✋ I Want to Participate'}
                </button>
              </div>
            )}
            {!registration && election.status === 'published' && !regOpen && (
              <div className="alert alert-warning" style={{ margin: 0 }}>📅 Registration deadline passed</div>
            )}
            {!registration && election.is_locked && voterCount >= election.max_voters && (
              <button onClick={handleRegister} disabled={registering} className="btn btn-outline btn-full">
                {registering ? 'Adding...' : '📋 Join Waitlist'}
              </button>
            )}
            {registration && (
              <div className={`alert alert-${registration.status === 'waitlisted' ? 'warning' : registration.status === 'voted' ? 'success' : 'success'}`} style={{ margin: 0, flexDirection: 'column' }}>
                <strong>
                  {registration.status === 'waitlisted' ? '📋 On Waitlist' :
                    registration.status === 'voted' ? '✅ Vote Cast!' :
                      registration.status === 'finalized' ? '🎫 Authorized Voter' :
                        '✅ Registered!'}
                </strong>
                {registration.status === 'finalized' && registration.secret_code && (
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>
                    Secret code sent to your email. Code ends in: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>****{registration.secret_code.slice(-4)}</span>
                  </p>
                )}
              </div>
            )}
            {!user && (
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-full">Login to Register</button>
            )}
          </div>

          {/* Election Info */}
          <div className="card">
            <h3 style={{ marginBottom: '14px', fontSize: '16px' }}>Election Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {[
                { label: 'Category', value: election.category || '—' },
                { label: 'Starts', value: new Date(election.start_time).toLocaleString() },
                { label: 'Ends', value: new Date(election.end_time).toLocaleString() },
                { label: 'Reg. Deadline', value: new Date(election.registration_deadline).toLocaleString() },
                { label: 'Max Voters', value: election.max_voters.toLocaleString() },
                { label: 'Candidates', value: candidates.length }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: 'var(--text2)' }}>{item.label}</span>
                  <span style={{ fontWeight: 500, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {election.status === 'completed' && (
            <button onClick={() => navigate(`/results/${id}`)} className="btn btn-primary btn-full">
              📊 View Final Results
            </button>
          )}
          {election.status === 'active' && registration?.status === 'finalized' && (
            <button onClick={() => navigate(`/vote/${id}`)} className="btn btn-purple btn-full btn-lg">
              🗳️ Cast Your Vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
