import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (profile?.role === 'super_admin') return '/admin';
    if (profile?.role === 'election_creator') return '/creator';
    return '/voter';
  };

  return (
    <nav style={{
      background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      height: '64px', display: 'flex', alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>🗳️</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>
            VoteSecure
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" className="btn btn-outline btn-sm" style={{ display: window.innerWidth < 600 ? 'none' : 'inline-flex' }}>
            Elections
          </Link>

          {user ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-outline btn-sm">
                {profile?.role === 'super_admin' ? '⚙️ Admin' :
                 profile?.role === 'election_creator' ? '📊 Creator' : '🗳️ My Votes'}
              </Link>
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
