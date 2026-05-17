import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function CountdownTimer({ targetDate }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [targetDate]);
  return (
    <div className="countdown" style={{ justifyContent: 'center' }}>
      {Object.entries(t).map(([k, v]) => (
        <div className="countdown-unit" key={k}>
          <div className="countdown-num">{String(v).padStart(2, '0')}</div>
          <div className="countdown-lbl">{k === 'd' ? 'Days' : k === 'h' ? 'Hrs' : k === 'm' ? 'Min' : 'Sec'}</div>
        </div>
      ))}
    </div>
  );
}

function ElectionCard({ election }) {
  const navigate = useNavigate();
  const pct = Math.min(100, Math.round(((election.voter_count || 0) / election.max_voters) * 100));
  const isActive = election.status === 'active';
  const isUpcoming = election.status === 'published';

  return (
    <div className="election-card card-hover fade-in" onClick={() => navigate(`/election/${election.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 10px', borderRadius: '20px' }}>
          {election.category || 'General'}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isActive && <span className="live-dot" />}
          <span className={`badge badge-${election.status}`}>
            {isActive ? 'Live' : isUpcoming ? 'Upcoming' : election.status}
          </span>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4 }}>{election.title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {election.description}
      </p>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>
          <span>Voter Registration</span>
          <span style={{ fontWeight: 600 }}>{election.voter_count || 0} / {election.max_voters}</span>
        </div>
        <div className="progress"><div className="progress-bar progress-blue" style={{ width: `${pct}%` }} /></div>
      </div>

      {isActive && election.end_time && (
        <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
          ⏰ Ends: {new Date(election.end_time).toLocaleString()}
        </div>
      )}
      {isUpcoming && election.start_time && (
        <CountdownTimer targetDate={election.start_time} />
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); navigate(`/election/${election.id}`); }}>
          View Details
        </button>
        {election.status === 'completed' && (
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/results/${election.id}`); }}>
            Results →
          </button>
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
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0, completed: 0 });
  const { user, profile } = useAuth();

  useEffect(() => {
    loadElections();
    const ch = supabase.channel('elections-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, loadElections)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  async function loadElections() {
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
    setStats({
      total: enriched.length,
      active: enriched.filter(e => e.status === 'active').length,
      upcoming: enriched.filter(e => e.status === 'published').length,
      completed: enriched.filter(e => e.status === 'completed').length
    });
    setLoading(false);
  }

  const filtered = elections.filter(e => {
    const matchFilter = filter === 'all' || e.status === filter || (filter === 'upcoming' && e.status === 'published');
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(180deg, rgba(79,142,247,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '64px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '20px', padding: '6px 16px', marginBottom: '24px', fontSize: '13px', color: 'var(--accent)' }}>
            🔒 Secure • Anonymous • Transparent • Real-time
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
            Democracy in the{' '}
            <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Age</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text2)', maxWidth: '500px', margin: '0 auto 32px' }}>
            Create, manage, and participate in secure online elections with real-time results and full transparency.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            {!user && <Link to="/register" className="btn btn-primary btn-lg">Get Started →</Link>}
            {user && profile?.role === 'voter' && <Link to="/dashboard" className="btn btn-primary btn-lg">My Dashboard</Link>}
            {user && profile?.role === 'election_creator' && <Link to="/creator" className="btn btn-primary btn-lg">Creator Dashboard</Link>}
            {user && profile?.role === 'super_admin' && <Link to="/admin" className="btn btn-primary btn-lg">Admin Dashboard</Link>}
            <Link to="/#elections" className="btn btn-outline btn-lg">Browse Elections</Link>
          </div>
          <input className="form-control" placeholder="🔍 Search elections by name or description..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: '480px', margin: '0 auto', display: 'block' }} />
        </div>
      </div>

      <div className="container page" id="elections">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          {[
            { label: 'Total Elections', value: stats.total, color: 'var(--accent)', icon: '🗳️' },
            { label: 'Live Now', value: stats.active, color: 'var(--danger)', icon: '🔴' },
            { label: 'Upcoming', value: stats.upcoming, color: 'var(--warning)', icon: '📅' },
            { label: 'Completed', value: stats.completed, color: 'var(--success)', icon: '✅' }
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: '📋 All' },
              { key: 'active', label: '🔴 Live' },
              { key: 'upcoming', label: '📅 Upcoming' },
              { key: 'completed', label: '✅ Completed' }
            ].map(f => (
              <button key={f.key} className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{filtered.length} election{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Election Cards */}
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗳️</div>
            <h3 style={{ marginBottom: '8px' }}>No elections found</h3>
            <p style={{ color: 'var(--text2)' }}>Try a different filter or check back later.</p>
          </div>
        ) : (
          <div className="grid-3">{filtered.map(e => <ElectionCard key={e.id} election={e} />)}</div>
        )}
      </div>
    </div>
  );
}
