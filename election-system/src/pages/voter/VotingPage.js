import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function VotingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [step, setStep] = useState('verify'); // verify | vote | confirmed
  const [secretInput, setSecretInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }, { data: reg }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('name'),
        supabase.from('voter_registrations').select('*').eq('election_id', id).eq('voter_id', user.id).single()
      ]);
      setElection(el);
      setCandidates(cands || []);
      setRegistration(reg);
      if (reg?.status === 'voted') setStep('confirmed');
      setLoading(false);
    }
    load();
  }, [id, user]);

  function verifyCode() {
    if (!registration?.secret_code) { toast.error('You are not a finalized voter'); return; }
    if (secretInput.trim().toUpperCase() !== registration.secret_code.toUpperCase()) {
      toast.error('Invalid secret code. Please check your email.');
      return;
    }
    setStep('vote');
  }

  async function castVote() {
    if (!selectedCandidate) { toast.error('Please select a candidate'); return; }
    if (!window.confirm('Are you sure you want to cast this vote? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      // Insert anonymous vote
      const { error: voteError } = await supabase.from('votes').insert({
        election_id: id,
        candidate_id: selectedCandidate,
        secret_code: registration.secret_code
      });
      if (voteError) throw voteError;

      // Increment candidate vote count
      await supabase.rpc('increment_vote', { candidate_id: selectedCandidate }).catch(() => {
        // Fallback: direct update
        const c = candidates.find(c => c.id === selectedCandidate);
        supabase.from('candidates').update({ vote_count: (c?.vote_count || 0) + 1 }).eq('id', selectedCandidate);
      });

      // Mark voter as voted
      await supabase.from('voter_registrations').update({ status: 'voted', voted_at: new Date().toISOString() })
        .eq('id', registration.id);

      await supabase.from('audit_logs').insert({
        actor_id: user.id, action: 'vote_cast',
        entity_type: 'election', entity_id: id,
        details: { anonymous: true }
      });

      setStep('confirmed');
      toast.success('Vote cast successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Failed to cast vote');
    }
    setSubmitting(false);
  }

  if (loading) return <LoadingSpinner fullPage />;

  if (!election) return <div className="container page"><div className="alert alert-danger">Election not found.</div></div>;

  if (election.status !== 'active') {
    return (
      <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div className="card" style={{ maxWidth:'400px', width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>⏸️</div>
          <h2>Election Not Active</h2>
          <p style={{ color:'var(--text2)', marginTop:'8px', marginBottom:'20px' }}>This election is currently <strong>{election.status}</strong>.</p>
          <button onClick={() => navigate(`/election/${id}`)} className="btn btn-outline">← Back to Election</button>
        </div>
      </div>
    );
  }

  if (!registration || registration.status === 'registered' || registration.status === 'waitlisted') {
    return (
      <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div className="card" style={{ maxWidth:'400px', width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🚫</div>
          <h2>Not Authorized</h2>
          <p style={{ color:'var(--text2)', marginTop:'8px' }}>You are not a finalized voter for this election.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'560px' }}>
        {/* Step: Verify Secret Code */}
        {step === 'verify' && (
          <div className="card">
            <div style={{ textAlign:'center', marginBottom:'28px' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔐</div>
              <h1 style={{ fontSize:'22px' }}>Verify Your Identity</h1>
              <p style={{ color:'var(--text2)', marginTop:'8px', fontSize:'14px' }}>
                Enter the secret voter code sent to your email to proceed.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Secret Voter Code</label>
              <input
                className="form-control"
                placeholder="e.g. POLL-XXXX-0001"
                value={secretInput}
                onChange={e => setSecretInput(e.target.value.toUpperCase())}
                style={{ textAlign:'center', fontFamily:'monospace', fontSize:'16px', letterSpacing:'0.1em' }}
              />
              <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'6px', textAlign:'center' }}>
                Check your registered email inbox for the code
              </p>
            </div>
            <button onClick={verifyCode} className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={!secretInput}>
              Verify & Continue →
            </button>
            <button onClick={() => navigate(`/election/${id}`)} className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:'8px' }}>
              Cancel
            </button>
          </div>
        )}

        {/* Step: Vote */}
        {step === 'vote' && (
          <div className="card">
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>🗳️</div>
              <h1 style={{ fontSize:'22px' }}>Cast Your Vote</h1>
              <p style={{ color:'var(--text2)', marginTop:'6px', fontSize:'14px' }}>{election.title}</p>
              <div className="alert alert-info" style={{ marginTop:'12px', fontSize:'13px' }}>
                🔒 Your vote is anonymous. Select one candidate below.
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px' }}>
              {candidates.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c.id)}
                  style={{
                    padding:'16px', borderRadius:'10px', cursor:'pointer',
                    border: `2px solid ${selectedCandidate === c.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedCandidate === c.id ? 'rgba(108,99,255,0.08)' : 'var(--bg3)',
                    display:'flex', gap:'14px', alignItems:'center',
                    transition:'all 0.15s'
                  }}
                >
                  <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'var(--bg2)', border:`2px solid ${selectedCandidate === c.id ? 'var(--accent)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>👤</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{c.name}</div>
                    {c.designation && <div style={{ fontSize:'12px', color:'var(--accent)', marginTop:'2px' }}>{c.designation}</div>}
                  </div>
                  <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${selectedCandidate === c.id ? 'var(--accent)' : 'var(--border)'}`, background: selectedCandidate === c.id ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {selectedCandidate === c.id && <span style={{ color:'white', fontSize:'12px' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={castVote}
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', fontSize:'16px', padding:'14px' }}
              disabled={!selectedCandidate || submitting}
            >
              {submitting ? 'Submitting...' : '✅ Confirm Vote'}
            </button>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === 'confirmed' && (
          <div className="card" style={{ textAlign:'center', padding:'48px 32px' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
            <h1 style={{ fontSize:'24px', marginBottom:'8px' }}>Vote Cast Successfully!</h1>
            <p style={{ color:'var(--text2)', marginBottom:'24px' }}>
              Your anonymous vote has been recorded. Thank you for participating in this election.
            </p>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate(`/results/${id}`)} className="btn btn-primary">View Live Results</button>
              <button onClick={() => navigate('/')} className="btn btn-outline">Back to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
