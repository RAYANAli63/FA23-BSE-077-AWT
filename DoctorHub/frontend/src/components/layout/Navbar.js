import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_DASHBOARD = {
  patient:'/patient/dashboard', doctor:'/doctor/dashboard',
  assistant:'/assistant/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard',
};

const ROLE_BADGE = {
  patient:'bg-teal-500/20 text-teal-300', doctor:'bg-blue-500/20 text-blue-300',
  assistant:'bg-purple-500/20 text-purple-300', admin:'bg-orange-500/20 text-orange-300',
  super_admin:'bg-red-500/20 text-red-300',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DH</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Doctor Hub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/doctors" className="text-slate-300 hover:text-teal-400 text-sm transition-colors">Find Doctors</Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={ROLE_DASHBOARD[user.role] || '/'} className="text-slate-300 hover:text-teal-400 text-sm transition-colors">Dashboard</Link>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_BADGE[user.role]}`}>
                  {user.role?.replace('_',' ').toUpperCase()}
                </span>
                <span className="text-slate-300 text-sm">{user.name}</span>
                <button onClick={handleLogout} className="bg-slate-700 hover:bg-red-600/80 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-300 hover:text-white text-sm transition-colors">Login</Link>
                <Link to="/register" className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">Register</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50 flex flex-col gap-3">
            <Link to="/doctors" className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Find Doctors</Link>
            {user ? (
              <>
                <Link to={ROLE_DASHBOARD[user.role]} className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-red-400 text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="text-teal-400 text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
