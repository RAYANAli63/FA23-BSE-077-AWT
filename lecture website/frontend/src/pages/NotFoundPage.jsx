import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const { darkMode } = useOutletContext();
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-7xl mb-4">📚</div>
        <h1 className={`block text-5xl font-extrabold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>404</h1>
        <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Page Not Found</p>
        <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          The lecture or page you are looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm
                     bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
