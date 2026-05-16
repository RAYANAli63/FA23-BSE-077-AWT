import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function Countdown({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ d:0, h:0, m:0, s:0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div style={{ marginBottom:'20px' }}>
      <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'10px' }}>{label}</p>
      <div className="countdown">
        {Object.entries(timeLeft).map(([unit, val]) => (
          <div className="countdown-unit" key={unit}>
            <div className="countdown-num">{String(val).padStart(2,'0')}</div>
            <div className="countdown-lbl">{unit === 'd' ? 'Days' : unit === 'h' ? 'Hrs' : unit === 'm' ? 'Min' : 'Sec'}</div>
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

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }, { count }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('name'),
        supabase.from('voter_registrations').select('*', { count: 'exact', head: true })
          .eq('election_id', id).neq('status', 'waitlisted')
      ]);
      setElection(el);
      setCandidates(cands || []);
      setVoterCount(count || 0);

      if (user) {
        const { data: reg } = await supabase.from('voter_registrations')
          .select('*').eq('election_id', id).eq('voter_id', user.id).single();
        setRegistration(reg);
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const isFull = voterCount >= election.max_voters;
      const { error } = await supabase.from('voter_registrations').insert({
        election_id: id,
        voter_id: user.id,
        status: isFull ? 'waitlisted' : 'registered'
      });
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: isFull ? 'voter_waitlisted' : 'voter_registered',
        entity_type: 'election', entity_id: id,
        details: { election_title: election.title }
      });

      toast.success(isFull ? 'Added to waitlist!' : 'Successfully registered! 🎉');
      setRegistration({ status: isFull ? 'waitlisted' : 'registered' });
      if (!isFull) setVoterCount(v => v + 1);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
    setRegistering(false);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!election) return <div className="container page"><div className="alert alert-danger">Election not found.</div></div>;

  const regOpen = new Date() < new Date(election.registration_deadline);
  const pct = Math.min(100, Math.round((voterCount / election.max_voters) * 100));

  return (
    <div className="container page">
      <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'24px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Back</button>
        <span className={`badge badge-${election.status === 'active' ? 'active' : election.status === 'published' ? 'upcoming' : 'completed'}`}>
          {election.status}
        </span>
        {election.category && <span style={{ fontSize:'12px', color:'var(--text3)', background:'var(--bg3)', padding:'3px 10px', borderRadius:'20px' }}>{election.category}</span>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'24px' }}>
        {/* Main */}
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700, marginBottom:'12px' }}>{election.title}</h1>
          <p style={{ color:'var(--text2)', lineHeight:1.7, marginBottom:'24px' }}>{election.description}</p>

          {/* Countdown */}
          {election.status === 'active' && (
            <Countdown targetDate={election.end_time} label="⏰ Election ends in:" />
          )}
          {election.status === 'published' && (
            <Countdown targetDate={election.start_time} label="🚀 Election starts in:" />
          )}

          {/* Candidates */}
          <h2 style={{ fontSize:'20px', marginBottom:'16px' }}>Candidates ({candidates.length})</h2>
          <div className="grid-2" style={{ marginBottom:'24px' }}>
            {candidates.map(c => (
              <div key={c.id} className="card" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'var(--bg3)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {c.photo_url
                    ? <img src={c.photo_url} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:'20px' }}>👤</span>}
                </div>
                <div>
                  <h4 style={{ fontWeight:600, marginBottom:'2px' }}>{c.name}</h4>
                  {c.designation && <p style={{ fontSize:'12px', color:'var(--accent)', marginBottom:'4px' }}>{c.designation}</p>}
                  {c.manifesto && <p style={{ fontSize:'12px', color:'var(--text2)', lineHeight:1.5 }}>{c.manifesto}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Vote button if active and registered */}
          {election.status === 'active' && registration?.status === 'finalized' && (
            <div className="alert alert-info" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🗳️ You are authorized to vote in this election!</span>
              <button onClick={() => navigate(`/vote/${id}`)} className="btn btn-primary">
                Cast Vote →
              </button>
            </div>
          )}
          {registration?.status === 'voted' && (
            <div className="alert alert-success">✅ You have already cast your vote in this election.</div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Registration Card */}
          <div className="card">
            <h3 style={{ marginBottom:'16px', fontSize:'16px' }}>Voter Registration</h3>
            <div style={{ marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text2)', marginBottom:'6px' }}>
                <span>Registered Voters</span>
                <span style={{ fontWeight:600, color:'var(--text)' }}>{voterCount} / {election.max_voters}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width:`${pct}%` }} />
              </div>
              {election.is_locked && (
                <p style={{ fontSize:'12px', color:'var(--danger)', marginTop:'6px' }}>🔒 Voter registration is locked</p>
              )}
            </div>

            {!registration && election.status === 'published' && regOpen && !election.is_locked ? (
              <button onClick={handleRegister} disabled={registering} className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>
                {registering ? <><span className="spinner" /> Registering...</> : '✋ I Want to Participate'}
              </button>
            ) : !registration && election.status === 'published' && !election.is_locked && !regOpen ? (
              <div className="alert alert-warning" style={{ margin:0 }}>Registration deadline passed</div>
            ) : !registration && election.is_locked ? (
              <button onClick={handleRegister} disabled={registering} className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }}>
                {registering ? 'Adding...' : '📋 Join Waitlist'}
              </button>
            ) : registration ? (
              <div className={`alert alert-${registration.status === 'waitlisted' ? 'warning' : 'success'}`} style={{ margin:0, textAlign:'center' }}>
                {registration.status === 'waitlisted' ? '📋 You are on the waitlist' :
                 registration.status === 'voted' ? '✅ Vote cast!' :
                 registration.status === 'finalized' ? '🎫 You are a finalized voter' :
                 '✅ Registration confirmed!'}
              </div>
            ) : null}
          </div>

          {/* Election Info */}
          <div className="card">
            <h3 style={{ marginBottom:'14px', fontSize:'16px' }}>Election Details</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', fontSize:'13px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>Category</span>
                <span>{election.category || '—'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>Start</span>
                <span>{new Date(election.start_time).toLocaleDateString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>End</span>
                <span>{new Date(election.end_time).toLocaleDateString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>Reg. Deadline</span>
                <span>{new Date(election.registration_deadline).toLocaleDateString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>Max Voters</span>
                <span>{election.max_voters.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Results link if completed */}
          {election.status === 'completed' && (
            <button onClick={() => navigate(`/results/${id}`)} className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>
              📊 View Final Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
