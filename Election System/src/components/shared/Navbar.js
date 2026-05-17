import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onSidebarToggle }) {
  const { user, profile, signOut, notifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const notifRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const getDashLink = () => {
    if (profile?.role === 'super_admin') return '/admin';
    if (profile?.role === 'election_creator') return '/creator';
    return '/dashboard';
  };

  const sessionId = user ? `VS-${user.id.slice(0, 8).toUpperCase()}` : null;

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
        {/* Left: hamburger (mobile) + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <button className="btn btn-ghost btn-icon mobile-nav-toggle" onClick={onSidebarToggle} style={{ fontSize: '18px' }}>☰</button>
          )}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🗳️</div>
            <span className="nav-logo-text">VoteSecure</span>
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" className="btn btn-ghost btn-sm nav-links-desktop" style={{ color: 'var(--text2)' }}>Elections</Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="theme-toggle" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
                  className="btn btn-ghost btn-icon" style={{ fontSize: '18px', position: 'relative' }}>
                  🔔
                  {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                </button>
                {showNotif && (
                  <div className="fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '300px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', zIndex: 200, boxShadow: 'var(--shadow)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Notifications</p>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text3)', padding: '12px 0', textAlign: 'center' }}>No new notifications</p>
                    ) : notifications.slice(0, 6).map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)}
                        style={{ padding: '10px 12px', borderRadius: '9px', cursor: 'pointer', marginBottom: '4px', background: 'var(--bg3)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{n.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px', lineHeight: 1.4 }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div style={{ position: 'relative' }} ref={userRef}>
                <button onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>
                    {profile?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="nav-links-desktop">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }} className="nav-links-desktop">▾</span>
                </button>

                {showUser && (
                  <div className="fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '240px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px', zIndex: 200, boxShadow: 'var(--shadow)' }}>
                    {/* User info */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{profile?.full_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>{profile?.email}</p>
                      <span className={`badge badge-${profile?.role}`} style={{ marginTop: '6px' }}>{profile?.role?.replace('_',' ')}</span>
                    </div>
                    {/* Session ID */}
                    <div style={{ padding: '10px 12px', marginBottom: '8px', background: 'var(--bg3)', borderRadius: '9px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', fontWeight: 600 }}>Session User ID</p>
                      <p style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>{sessionId}</p>
                    </div>
                    <Link to={getDashLink()} className="sidebar-link" style={{ borderRadius: '8px', marginBottom: '2px' }} onClick={() => setShowUser(false)}>
                      <span className="icon">📊</span> Dashboard
                    </Link>
                    <button onClick={async () => { await signOut(); navigate('/'); setShowUser(false); }}
                      className="btn btn-danger btn-sm btn-full" style={{ marginTop: '6px' }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
