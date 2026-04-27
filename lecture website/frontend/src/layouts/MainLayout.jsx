import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DARK_KEY = 'lms_dark_mode';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(DARK_KEY) === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(DARK_KEY, darkMode);
  }, [darkMode]);

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}
         style={{ fontFamily: "var(--font-sans)" }}>

      {/* ─── Sidebar: w-72 on lg, hidden mobile ─── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ─── Main column: flex-1 + min-w-0 prevents blowout ─── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
        />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <Outlet context={{ darkMode }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
