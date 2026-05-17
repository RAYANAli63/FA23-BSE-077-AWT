import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Shield, Zap, BarChart3, Globe, ArrowRight, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Countdown, ProgressBar, Badge, SkeletonCard, Spinner } from '../../components/ui/index.jsx'

function ElectionCard({ election, delay = 0 }) {
  const navigate = useNavigate()
  const pct = election.max_voters > 0 ? Math.round((election.voter_count / election.max_voters) * 100) : 0
  const isActive = election.status === 'active'
  const isUpcoming = election.status === 'published'
  const isCompleted = election.status === 'completed'

  return (
    <div className="card-hover group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/election/${election.id}`)}>
      
      {/* Top bar accent */}
      <div className={`h-0.5 -mx-6 -mt-6 mb-5 rounded-t-2xl ${isActive ? 'bg-gradient-to-r from-success-500 to-cyan-400' : isUpcoming ? 'bg-gradient-to-r from-brand-500 to-violet-500' : 'bg-surface-700'}`} />
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="chip text-xs">{election.category || 'General'}</span>
        <div className="flex items-center gap-1.5">
          {isActive && <span className="live-dot" />}
          <Badge variant={isActive ? 'active' : isUpcoming ? 'upcoming' : 'completed'}>
            {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Ended'}
          </Badge>
        </div>
      </div>

      <h3 className="font-display font-bold text-surface-100 text-base mb-2 leading-snug group-hover:text-brand-300 transition-colors">
        {election.title}
      </h3>
      <p className="text-surface-500 text-xs leading-relaxed mb-4 truncate-2">
        {election.description || 'No description provided.'}
      </p>

      {/* Voter progress */}
      <div className="mb-4">
        <ProgressBar value={election.voter_count || 0} max={election.max_voters} color="blue" showLabel />
        {pct >= 90 && !election.is_locked && (
          <p className="text-warning-400 text-[10px] mt-1 font-medium">⚠️ Almost full</p>
        )}
        {election.is_locked && (
          <p className="text-danger-400 text-[10px] mt-1 font-medium">🔒 Registration closed</p>
        )}
      </div>

      {/* Countdown */}
      {isActive && election.end_time && (
        <Countdown target={election.end_time} label="⏰ Closes in" className="mb-4" />
      )}
      {isUpcoming && election.start_time && (
        <Countdown target={election.start_time} label="🚀 Starts in" className="mb-4" />
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <button className="btn btn-secondary btn-sm flex-1"
          onClick={e => { e.stopPropagation(); navigate(`/election/${election.id}`) }}>
          View Details
        </button>
        {isCompleted && (
          <button className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); navigate(`/results/${election.id}`) }}>
            Results <ArrowRight size={12} />
          </button>
        )}
        {isActive && (
          <button className="btn btn-success btn-sm"
            onClick={e => { e.stopPropagation(); navigate(`/election/${election.id}`) }}>
            Join →
          </button>
        )}
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: <Shield size={20} />, title: 'Bank-Grade Security', desc: 'End-to-end encryption, RLS policies, and anonymous voting ensure complete protection.', color: 'brand' },
  { icon: <Zap size={20} />, title: 'Real-Time Results', desc: 'Live vote counting with WebSocket connections. See results update instantly.', color: 'success' },
  { icon: <BarChart3 size={20} />, title: 'Deep Analytics', desc: 'Turnout charts, vote distribution, candidate rankings — all visualised beautifully.', color: 'violet' },
  { icon: <Globe size={20} />, title: 'Fully Transparent', desc: 'Complete audit logs for every action. Download full transparency reports.', color: 'cyan' },
  { icon: <Users size={20} />, title: 'Smart Voter Management', desc: 'Auto-waitlist, voter finalization, secret code generation, and bulk management.', color: 'warning' },
  { icon: <CheckCircle size={20} />, title: 'Session User IDs', desc: 'Each voter gets a unique session ID per login — traceable without exposing identity.', color: 'danger' },
]

export default function LandingPage() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0, completed: 0, totalVoters: 0 })
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadElections()
    const ch = supabase.channel('elections-lp')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, loadElections)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function loadElections() {
    const { data } = await supabase
      .from('elections')
      .select('*, voter_registrations(count)')
      .in('status', ['published', 'active', 'completed'])
      .order('created_at', { ascending: false })

    const enriched = (data || []).map(e => ({
      ...e, voter_count: e.voter_registrations?.[0]?.count || 0
    }))
    setElections(enriched)
    const totalVoters = enriched.reduce((s, e) => s + (e.voter_count || 0), 0)
    setStats({
      total: enriched.length,
      active: enriched.filter(e => e.status === 'active').length,
      upcoming: enriched.filter(e => e.status === 'published').length,
      completed: enriched.filter(e => e.status === 'completed').length,
      totalVoters
    })
    setLoading(false)
  }

  const filtered = elections.filter(e => {
    const matchFilter = filter === 'all' || e.status === filter || (filter === 'upcoming' && e.status === 'published')
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const dashLink = profile?.role === 'super_admin' ? '/admin' : profile?.role === 'election_creator' ? '/creator' : '/voter'

  return (
    <div>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-surface-800/60">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
              <span className="live-dot" />
              Secure • Anonymous • Transparent • Real-Time
            </div>

            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Democracy in the{' '}
              <span className="gradient-text">Digital Age</span>
            </h1>

            <p className="text-surface-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              Create, manage, and participate in secure online elections with real-time results, full transparency, and enterprise-grade security.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg shadow-glow">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                </>
              ) : (
                <>
                  <Link to={dashLink} className="btn btn-primary btn-lg shadow-glow">
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                  <a href="#elections" className="btn btn-secondary btn-lg">Browse Elections</a>
                </>
              )}
            </div>

            {/* Live stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
              {[
                { label: 'Total Elections', value: stats.total, icon: '🗳️' },
                { label: 'Live Now', value: stats.active, icon: '🔴', glow: stats.active > 0 },
                { label: 'Upcoming', value: stats.upcoming, icon: '📅' },
                { label: 'Voters Registered', value: stats.totalVoters.toLocaleString(), icon: '👥' },
              ].map(s => (
                <div key={s.label} className={`card-sm text-center py-4 ${s.glow ? 'border-success-500/30 bg-success-500/5' : ''}`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="font-display font-bold text-xl text-surface-100 tabular-nums">{s.value}</p>
                  <p className="text-surface-500 text-[10px] uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ELECTIONS ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" id="elections">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              className="input pl-10 h-11"
              placeholder="Search elections by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { k: 'all', l: 'All' },
              { k: 'active', l: '🔴 Live' },
              { k: 'upcoming', l: '📅 Upcoming' },
              { k: 'completed', l: '✅ Ended' }
            ].map(f => (
              <button key={f.k}
                className={`btn btn-sm ${filter === f.k ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f.k)}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Elections</h2>
            <p className="section-subtitle">{filtered.length} election{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-lg font-bold text-surface-200 mb-2">No elections found</h3>
            <p className="text-surface-500 text-sm">Try a different filter or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((e, i) => <ElectionCard key={e.id} election={e} delay={i * 60} />)}
          </div>
        )}
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-surface-800/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-50 mb-3">
              Built for <span className="gradient-text">Enterprise</span>
            </h2>
            <p className="text-surface-400 text-base max-w-xl mx-auto">
              Every feature designed with security, transparency, and scalability in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const colorMap = {
                brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                success: 'bg-success-500/10 text-success-400 border-success-500/20',
                violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                warning: 'bg-warning-500/10 text-warning-400 border-warning-500/20',
                danger: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
              }
              return (
                <div key={f.title} className="card-hover animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`inline-flex w-11 h-11 rounded-xl items-center justify-center border mb-4 ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-display font-bold text-surface-100 mb-2">{f.title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="border-t border-surface-800/60 py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="card-gradient p-12 rounded-3xl border border-brand-500/20">
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                Ready to <span className="gradient-text">Run Your Election?</span>
              </h2>
              <p className="text-surface-400 mb-8 text-base leading-relaxed">
                Join organisations using VoteSecure for secure, transparent, democratic elections.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/register" className="btn btn-primary btn-lg shadow-glow-lg">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-800/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-surface-600 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗳️</span>
            <span className="font-bold font-display">VoteSecure Pro</span>
            <span>— Secure Online Elections</span>
          </div>
          <p>Built with React + Supabase • Secure • Transparent • Anonymous</p>
        </div>
      </footer>
    </div>
  )
}
