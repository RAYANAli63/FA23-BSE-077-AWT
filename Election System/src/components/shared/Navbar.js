import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, profile, signOut, notifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const getDashLink = () => {
    if (profile?.role === 'super_admin') return '/admin';
    if (profile?.role === 'election_creator') return '/creator';
    return '/dashboard';
  };

  const getRoleLabel = () => {
    if (profile?.role === 'super_admin') return '⚙️ Admin';
    if (profile?.role === 'election_creator') return '📊 Creator';
    return '🗳️ Dashboard';
  };

  return (
    <nav style={{
      background: 'rgba(8,11,20,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      height: '64px', display: 'flex', alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🗳️</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>VoteSecure</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" className="btn btn-ghost btn-sm">Elections</Link>

          {/* Dark mode toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ fontSize: '16px' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNotif(!showNotif)} className="btn btn-ghost btn-sm" style={{ position: 'relative', fontSize: '18px' }}>
                  🔔
                  {notifications.length > 0 && (
                    <span className="notif-badge">{notifications.length}</span>
                  )}
                </button>
                {showNotif && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', width: '300px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', zIndex: 200, boxShadow: 'var(--shadow)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Notifications</p>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text2)', padding: '8px 0' }}>No new notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: 'var(--bg3)' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{n.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to={getDashLink()} className="btn btn-outline btn-sm">{getRoleLabel()}</Link>
              <button onClick={handleSignOut} className="btn btn-danger btn-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
