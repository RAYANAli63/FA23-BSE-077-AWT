import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../redux/slices/authSlice';

export default function Header({ onMenuClick, darkMode, onToggleDark }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { admin } = useSelector((s) => s.auth);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.map((p, i) => ({
    label: p.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
    to: '/' + pathParts.slice(0, i + 1).join('/'),
    isLast: i === pathParts.length - 1,
  }));

  return (
    <header
      className={`sticky top-0 z-20 h-14 flex items-center px-4 sm:px-6 gap-3
                  border-b backdrop-blur-md flex-shrink-0
                  ${darkMode
                    ? 'bg-slate-950/90 border-slate-800 text-slate-200'
                    : 'bg-white/90 border-slate-200 text-slate-700'
                  }`}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        className={`lg:hidden p-2 rounded-lg transition-colors
                    ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
        <Link to="/" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
          Home
        </Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb.to} className="flex items-center gap-1.5">
            <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>/</span>
            {crumb.isLast ? (
              <span className={`truncate max-w-[180px] font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.to} className={`font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          className={`p-2 rounded-lg transition-colors
                      ${darkMode
                        ? 'text-yellow-400 hover:bg-yellow-400/10'
                        : 'text-slate-500 hover:bg-slate-100'
                      }`}
        >
          {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </motion.button>

        {admin ? (
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                          ${darkMode
                            ? 'bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors
                          ${darkMode
                            ? 'text-slate-400 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${darkMode
                          ? 'text-slate-400 hover:text-white hover:bg-white/10'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
      </div>
    </header>
  );
}
