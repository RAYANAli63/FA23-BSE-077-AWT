import { useEffect, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { fetchLectures, fetchLectureBySlug } from '../redux/slices/lectureSlice';

const PROGRESS_KEY = 'lms_progress';

function markComplete(lectureId) {
  const progress = {};
  try { Object.assign(progress, JSON.parse(localStorage.getItem(PROGRESS_KEY))); } catch {}
  progress[lectureId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function isCompleted(lectureId) {
  try { return !!(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {})[lectureId]; }
  catch { return false; }
}

export default function LecturePage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { darkMode } = useOutletContext();
  const { currentLecture, lectures, lectureLoading, error } = useSelector((s) => s.lectures);

  useEffect(() => {
    dispatch(fetchLectureBySlug(slug));
    if (!lectures.length) dispatch(fetchLectures());
  }, [dispatch, slug]);

  const currentIndex = lectures.findIndex((l) => l.slug === slug);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

  const handleMarkComplete = useCallback(() => {
    if (currentLecture?._id) {
      markComplete(currentLecture._id);
      dispatch({ type: '@@NOOP' });
    }
  }, [currentLecture, dispatch]);

  const done = currentLecture ? isCompleted(currentLecture._id) : false;

  if (lectureLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-8 rounded-lg animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
               style={{ width: `${85 - i * 12}%` }} />
        ))}
      </div>
    );
  }

  if (error || !currentLecture) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <BookOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-30 text-indigo-500" />
          <h2 className={`text-2xl font-bold mb-2 block ${darkMode ? 'text-white' : 'text-slate-800'}`}>Lecture Not Found</h2>
          <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {error || 'The requested lecture could not be loaded.'}
          </p>
          <Link to="/" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ fontFamily: "var(--font-sans)" }}>

      {/* Lecture hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tags */}
            {currentLecture.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentLecture.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-white/15 border border-white/20 text-white px-2.5 py-1 rounded-full font-semibold">
                    <TagIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="block text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              {currentLecture.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-indigo-100 text-sm">
              {currentLecture.duration && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
                  <ClockIcon className="w-4 h-4" />
                  {currentLecture.duration}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
                <BookOpenIcon className="w-4 h-4" />
                Module {currentIndex + 1} of {lectures.length}
              </span>
              {done && (
                <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-md">
                  <CheckCircleIcon className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section TOC */}
      {currentLecture.sections?.length > 0 && (
        <div className={`sticky top-14 z-10 border-b backdrop-blur-md ${darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className={`text-xs font-bold uppercase tracking-wider flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Sections
            </span>
            <div className={`h-4 w-px flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
            {currentLecture.sections.map((sec) => (
              <a
                key={sec._id}
                href={`#${sec.heading.replace(/\s+/g, '-').toLowerCase()}`}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-md font-semibold transition-colors
                            ${darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
              >
                {sec.heading}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`lecture-prose rounded-xl p-6 sm:p-10 border
                      ${darkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                      }`}
        >
          {currentLecture.content ? (
            <div dangerouslySetInnerHTML={{ __html: currentLecture.content }} />
          ) : (
            <p className="text-center py-8 opacity-50">No introductory content available.</p>
          )}

          {currentLecture.sections?.map((section, i) => (
            <section
              key={section._id || i}
              id={section.heading.replace(/\s+/g, '-').toLowerCase()}
              className="mt-10 scroll-mt-28"
            >
              <h2 className={`block text-xl font-bold mb-4 pb-2 border-b leading-tight
                              ${darkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>
                {section.heading}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </section>
          ))}
        </motion.article>

        {/* Mark Complete */}
        {!done && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm
                         bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Mark as Complete
            </motion.button>
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {prevLecture ? (
            <Link to={`/lecture/${prevLecture.slug}`} className="flex-1 sm:flex-none">
              <div className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-colors border
                              ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{prevLecture.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextLecture ? (
            <Link to={`/lecture/${nextLecture.slug}`} className="flex-1 sm:flex-none">
              <div className="flex items-center justify-end gap-2 px-5 py-3 rounded-lg font-bold text-sm
                              bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                <span className="truncate">{nextLecture.title}</span>
                <ArrowRightIcon className="w-4 h-4 flex-shrink-0" />
              </div>
            </Link>
          ) : (
            <Link to="/">
              <div className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm
                              bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                🎉 Dashboard
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
