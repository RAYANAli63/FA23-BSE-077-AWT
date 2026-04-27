import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  XMarkIcon,
  AcademicCapIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { fetchLectures, setSearchQuery } from '../redux/slices/lectureSlice';

const PROGRESS_KEY = 'lms_progress';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { lectures, loading } = useSelector((s) => s.lectures);
  const [localSearch, setLocalSearch] = useState('');
  const [progress, setProgress] = useState(getProgress());
  const searchTimer = useRef(null);

  useEffect(() => {
    dispatch(fetchLectures());
    const interval = setInterval(() => setProgress(getProgress()), 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch(setSearchQuery(val));
      dispatch(fetchLectures(val));
    }, 400);
  };

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/*
        Sidebar structure:
        - Mobile: fixed + slide from left (z-50)
        - Desktop (lg+): static in flex row, w-72, no transform
      */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col flex-shrink-0
          bg-slate-900 text-white border-r border-slate-800
          transform transition-transform duration-300 ease-in-out
          lg:static lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-5 bg-gradient-to-r from-indigo-700 to-purple-700 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              📚
            </div>
            <div>
              <p className="font-bold text-base leading-tight tracking-tight">LearnHub</p>
              <p className="text-[10px] font-semibold text-indigo-200 uppercase tracking-widest">Platform</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {lectures.length > 0 && (
          <div className="px-5 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <AcademicCapIcon className="w-3.5 h-3.5" />
                Progress
              </span>
              <span className="font-bold">{completedCount}/{lectures.length}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${lectures.length ? (completedCount / lectures.length) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearch}
              placeholder="Search lectures…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700
                         rounded-lg text-white placeholder:text-slate-500 outline-none
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Lecture list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-2 pt-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Modules
          </p>

          {loading ? (
            <div className="space-y-2 px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpenIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No lectures found</p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {lectures.map((lecture, idx) => {
                const isActive = lecture.slug === slug;
                const isDone = !!progress[lecture._id];
                return (
                  <li key={lecture._id}>
                    <Link
                      to={`/lecture/${lecture.slug}`}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                  font-medium transition-colors relative
                                  ${isActive
                                    ? 'bg-indigo-600/15 text-indigo-300'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                  }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1 bottom-1 w-[3px] bg-indigo-500 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className={`flex-shrink-0 w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center
                                        ${isActive ? 'bg-indigo-500/20 text-indigo-400'
                                          : isDone ? 'bg-emerald-500/15 text-emerald-400'
                                          : 'bg-slate-800 text-slate-500'}`}>
                        {isDone && !isActive ? '✓' : idx + 1}
                      </span>
                      <span className="flex-1 truncate">{lecture.title}</span>
                      {isActive && <ChevronRightIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-800 px-5 py-3">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Online</p>
          </div>
        </div>
      </aside>
    </>
  );
}
