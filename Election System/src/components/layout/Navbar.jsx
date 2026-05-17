import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, Sun, Moon, Menu, X, ChevronDown, LogOut, LayoutDashboard, User, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Badge, Spinner } from '../ui/index.jsx'

export default function Navbar({ onMenuToggle }) {
  const { user, profile, sessionId, notifications, signOut, markNotificationRead, markAllRead } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const notifRef = useRef()
  const userRef = useRef()

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.body.style.background = next === 'light' ? '#f1f5f9' : ''
    localStorage.setItem('theme', next)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/')
    setSigningOut(false)
  }

  const dashLink = () => {
    if (profile?.role === 'super_admin') return '/admin'
    if (profile?.role === 'election_creator') return '/creator'
    return '/voter'
  }

  const roleLabel = {
    super_admin: { label: 'Super Admin', color: 'danger', icon: <Shield size={12} /> },
    election_creator: { label: 'Creator', color: 'violet', icon: '🏛️' },
    voter: { label: 'Voter', color: 'cyan', icon: '🗳️' },
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    : '?'

  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center border-b border-surface-800/60"
      style={{ background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(20px) saturate(180%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-3">

        {/* LEFT: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button onClick={onMenuToggle} className="btn btn-ghost btn-icon text-surface-400 lg:hidden">
              <Menu size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-base shadow-glow group-hover:shadow-glow-lg transition-all">
              🗳️
            </div>
            <span className="font-display font-bold text-lg text-surface-50 tracking-tight hidden sm:block">
              Vote<span className="gradient-text-blue">Secure</span>
            </span>
          </Link>
        </div>

        {/* CENTER: Nav links (desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          <Link to="/" className={`nav-pill ${pathname === '/' ? 'bg-surface-800 text-surface-100' : ''}`}>Elections</Link>
          {user && (
            <Link to={dashLink()} className={`nav-pill ${pathname.startsWith('/admin') || pathname.startsWith('/creator') || pathname.startsWith('/voter') ? 'bg-surface-800 text-surface-100' : ''}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost btn-icon text-surface-400 hover:text-surface-100">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotif(p => !p); setShowUser(false) }}
                  className="btn btn-ghost btn-icon text-surface-400 hover:text-surface-100 relative">
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-surface-950">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-80 card-sm shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-slide-up z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-surface-400">Notifications</p>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300">Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-surface-500 text-sm">All caught up! ✅</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)}
                        className="p-3 rounded-xl hover:bg-surface-800/50 cursor-pointer mb-1 transition-colors">
                        <p className="text-sm font-medium text-surface-200">{n.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-surface-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userRef}>
                <button onClick={() => { setShowUser(p => !p); setShowNotif(false) }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-800/80 border border-surface-700/50 hover:border-surface-600 transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-surface-200 max-w-[90px] truncate hidden sm:block">
                    {profile?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className="text-surface-500 group-hover:text-surface-300 transition-transform duration-200" style={{ transform: showUser ? 'rotate(180deg)' : 'none' }} />
                </button>

                {showUser && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-64 card-sm shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-slide-up z-50">
                    {/* User info */}
                    <div className="mb-3 pb-3 border-b border-surface-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-surface-100">{profile?.full_name}</p>
                          <p className="text-xs text-surface-500 truncate max-w-[150px]">{profile?.email}</p>
                        </div>
                      </div>
                      {profile?.role && <Badge variant={profile.role}>{profile.role.replace('_',' ')}</Badge>}
                    </div>

                    {/* Session ID */}
                    <div className="mb-3 pb-3 border-b border-surface-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-surface-600 mb-1.5">Session ID</p>
                      <span className="session-id text-xs">{sessionId}</span>
                      <p className="text-[10px] text-surface-600 mt-1">New ID generated per session</p>
                    </div>

                    <Link to={dashLink()} onClick={() => setShowUser(false)}
                      className="sidebar-link mb-1">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/voter/profile" onClick={() => setShowUser(false)}
                      className="sidebar-link mb-3">
                      <User size={15} /> My Profile
                    </Link>

                    <button onClick={handleSignOut} disabled={signingOut}
                      className="btn btn-danger btn-sm btn-full gap-2">
                      {signingOut ? <Spinner size="xs" /> : <LogOut size={13} />}
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm hidden sm:flex">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
