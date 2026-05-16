import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function ElectionCard({ election }) {
  const now = new Date();
  const start = new Date(election.start_time);
  const end = new Date(election.end_time);
  const regDeadline = new Date(election.registration_deadline);
  const isActive = election.status === 'active';
  const isUpcoming = election.status === 'published';
  const isCompleted = election.status === 'completed';

  const pct = election.voter_count
    ? Math.min(100, Math.round((election.voter_count / election.max_voters) * 100))
    : 0;

  return (
    <div className="card" style={{ position:'relative', transition:'transform 0.2s,box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(108,99,255,0.15)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <span style={{ fontSize:'12px', color:'var(--text3)', background:'var(--bg3)', padding:'3px 10px', borderRadius:'20px' }}>
          {election.category || 'General'}
        </span>
        <span className={`badge badge-${election.status === 'active' ? 'active' : election.status === 'published' ? 'upcoming' : 'completed'}`}>
          {isActive ? '🔴 Live' : isUpcoming ? '🟡 Upcoming' : '✅ Completed'}
        </span>
      </div>

      <h3 style={{ fontSize:'17px', fontWeight:600, marginBottom:'8px', lineHeight:1.3 }}>{election.title}</h3>
      <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'16px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {election.description}
      </p>

      <div style={{ marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text2)', marginBottom:'6px' }}>
          <span>Voter Registration</span>
          <span>{election.voter_count || 0} / {election.max_voters}</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width:`${pct}%` }} />
        </div>
      </div>

      <div style={{ fontSize:'12px', color:'var(--text3)', marginBottom:'16px', display:'flex', flexDirection:'column', gap:'3px' }}>
        {isUpcoming && <span>📅 Starts: {start.toLocaleString()}</span>}
        {isActive && <span>⏰ Ends: {end.toLocaleString()}</span>}
        {isUpcoming && <span>📝 Register by: {regDeadline.toLocaleString()}</span>}
        {isCompleted && <span>✅ Ended: {end.toLocaleString()}</span>}
      </div>

      <div style={{ display:'flex', gap:'8px' }}>
        <Link to={`/election/${election.id}`} className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }}>
          View Details
        </Link>
        {isCompleted && (
          <Link to={`/results/${election.id}`} className="btn btn-primary btn-sm">
            Results →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchElections() {
      const { data } = await supabase
        .from('elections')
        .select('*, voter_registrations(count)')
        .in('status', ['published', 'active', 'completed'])
        .order('created_at', { ascending: false });

      const enriched = (data || []).map(e => ({
        ...e,
        voter_count: e.voter_registrations?.[0]?.count || 0
      }));
      setElections(enriched);
      setLoading(false);
    }
    fetchElections();

    const channel = supabase
      .channel('elections-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, fetchElections)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = elections.filter(e => {
    const matchesFilter = filter === 'all' || e.status === filter ||
      (filter === 'upcoming' && e.status === 'published');
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const active = elections.filter(e => e.status === 'active');
  const upcoming = elections.filter(e => e.status === 'published');
  const completed = elections.filter(e => e.status === 'completed');

  return (
    <div>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg, #0a0a0f 0%, #13131e 50%, #0a0a0f 100%)', borderBottom:'1px solid var(--border)', padding:'64px 0 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundImage:'radial-gradient(circle at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,212,255,0.06) 0%, transparent 50%)' }} />
        <div className="container" style={{ position:'relative', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:'20px', padding:'6px 16px', marginBottom:'24px', fontSize:'13px', color:'var(--accent2)' }}>
            🔒 Secure • Anonymous • Transparent
          </div>
          <h1 style={{ fontSize:'clamp(32px, 5vw, 56px)', fontWeight:800, lineHeight:1.1, marginBottom:'16px' }}>
            Democracy in the
            <span style={{ background:'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}> Digital Age</span>
          </h1>
          <p style={{ fontSize:'17px', color:'var(--text2)', maxWidth:'520px', margin:'0 auto 32px' }}>
            Secure, transparent, and anonymous online elections with real-time results.
          </p>
          <input
            className="form-control"
            placeholder="🔍 Search elections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth:'400px', margin:'0 auto', display:'block', textAlign:'center' }}
          />
        </div>
      </div>

      <div className="container page">
        {/* Stats */}
        <div className="grid-3" style={{ marginBottom:'40px' }}>
          <div className="stat-card" style={{ borderColor:'rgba(255,71,87,0.2)' }}>
            <div className="stat-value" style={{ color:'var(--danger)' }}>{active.length}</div>
            <div className="stat-label">🔴 Active Elections</div>
          </div>
          <div className="stat-card" style={{ borderColor:'rgba(108,99,255,0.2)' }}>
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">🟡 Upcoming Elections</div>
          </div>
          <div className="stat-card" style={{ borderColor:'rgba(0,200,150,0.2)' }}>
            <div className="stat-value" style={{ color:'var(--success)' }}>{completed.length}</div>
            <div className="stat-label">✅ Completed Elections</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
          {['all','active','upcoming','completed'].map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`}
              onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>
              {f === 'active' ? '🔴' : f === 'upcoming' ? '🟡' : f === 'completed' ? '✅' : '📋'} {f}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          filtered.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'48px' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>🗳️</div>
              <h3>No elections found</h3>
              <p style={{ color:'var(--text2)', marginTop:'8px' }}>Try a different filter or check back later.</p>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map(e => <ElectionCard key={e.id} election={e} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
