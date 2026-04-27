import { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpenIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { fetchLectures } from '../redux/slices/lectureSlice';

const PROGRESS_KEY = 'lms_progress';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

/* ─── Lecture Card ─── */
function LectureCard({ lecture, index, darkMode }) {
  const isDone = !!getProgress()[lecture._id];

  return (
    <motion.div
      layoutId={`card-${lecture._id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className={`group flex flex-col rounded-xl overflow-hidden border transition-shadow
                  hover:shadow-lg
                  ${darkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
    >
      {/* Accent bar */}
      <div className={`h-1 w-full ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`} />

      <div className="p-5 flex flex-col flex-1 min-h-[220px]">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                          ${isDone
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                          }`}>
            {isDone ? '✓' : index + 1}
          </div>
          {isDone && (
            <span className="ml-auto text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Completed
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold leading-snug mb-3 block
                        ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          {lecture.title}
        </h3>

        {/* Tags / meta */}
        <div className={`flex flex-wrap gap-1.5 text-xs font-medium mb-4
                        ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {lecture.duration && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
              {lecture.duration}
            </span>
          )}
          {lecture.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <TagIcon className="w-3.5 h-3.5 flex-shrink-0" />
              {tag}
            </span>
          ))}
        </div>

        {/* CTA pinned to bottom */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={`/lecture/${lecture.slug}`}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                       ${isDone
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20'
                       }`}
          >
            {isDone ? 'Review' : 'Start Learning'}
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Home Page / Dashboard ─── */
export default function HomePage() {
  const dispatch = useDispatch();
  const { darkMode } = useOutletContext();
  const { lectures, loading, error } = useSelector((s) => s.lectures);
  const progress = getProgress();
  const completedCount = Object.values(progress).filter(Boolean).length;

  useEffect(() => { dispatch(fetchLectures()); }, [dispatch]);

  const stats = [
    { icon: BookOpenIcon, label: 'Total Lectures', value: lectures.length, accent: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { icon: AcademicCapIcon, label: 'Completed', value: completedCount, accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: SparklesIcon, label: 'Remaining', value: Math.max(0, lectures.length - completedCount), accent: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="min-h-full" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        {/* Decorative blobs — position: absolute is fine here (decorative only, not structural) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center space-y-6">
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 text-sm font-semibold
                       bg-white/10 border border-white/20 rounded-full px-4 py-1.5"
          >
            <SparklesIcon className="w-4 h-4 text-indigo-200" />
            Premium Learning Experience
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="block text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto"
          >
            Advanced Web Technologies
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="block text-base md:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed"
          >
            Master the MERN stack and modern web development through interactive, hands-on architectural deep dives.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            {lectures[0] && (
              <Link to={`/lecture/${lectures[0].slug}`}>
                <button className="w-full sm:w-auto px-7 py-3 bg-white text-indigo-700 rounded-lg font-bold text-sm
                                   hover:bg-indigo-50 transition-colors shadow-sm">
                  Get Started →
                </button>
              </Link>
            )}
            <a href="#lectures">
              <button className="w-full sm:w-auto px-7 py-3 bg-white/10 border border-white/25 text-white rounded-lg
                                 font-semibold text-sm hover:bg-white/20 transition-colors">
                Browse Lectures
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`rounded-xl p-5 flex items-center gap-4 border shadow-sm
                          ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.accent}`} />
              </div>
              <div>
                <p className={`text-2xl font-extrabold tracking-tight leading-none block ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs font-semibold uppercase tracking-wider mt-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── LECTURES GRID ─── */}
      <section id="lectures" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="space-y-1">
          <h2 className={`block text-2xl font-extrabold tracking-tight leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Available Modules
          </h2>
          <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-56 rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
            ))}
          </div>
        ) : error ? (
          <div className={`text-center py-16 rounded-xl border-2 border-dashed
                           ${darkMode ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'}`}>
            <svg className="w-10 h-10 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Failed to load lectures</p>
            <p className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error || 'Unable to connect to API. Please check your backend configuration.'}
            </p>
            <p className={`text-xs mt-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Set <code className="bg-slate-900/30 px-2 py-1 rounded text-xs">VITE_API_URL</code> environment variable in Vercel
            </p>
          </div>
        ) : lectures.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border-2 border-dashed
                           ${darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-slate-50'}`}>
            <BookOpenIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No modules available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lec, i) => (
              <LectureCard key={lec._id} lecture={lec} index={i} darkMode={darkMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
