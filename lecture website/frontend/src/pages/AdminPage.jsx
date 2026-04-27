import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { loginAdmin, logout } from '../redux/slices/authSlice';
import {
  fetchLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} from '../redux/slices/lectureSlice';
import toast from 'react-hot-toast';

/* ── Login Form ── */
function LoginForm({ darkMode }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginAdmin(form));
    if (loginAdmin.fulfilled.match(result)) toast.success('Welcome back, Admin!');
    else toast.error(result.payload || 'Login failed');
  };

  const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                    ${darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400'}`;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`w-full max-w-md rounded-xl overflow-hidden border shadow-sm
                              ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-8 text-white text-center">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="block text-xl font-bold leading-tight">Admin Panel</h1>
          <p className="text-indigo-200 text-sm mt-1">Sign in to manage lectures</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" className={inputCls} />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className={inputCls} />
          </div>
          <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Lecture Modal ── */
function LectureModal({ lecture, onClose, darkMode }) {
  const dispatch = useDispatch();
  const isEdit = !!lecture?._id;
  const [form, setForm] = useState({
    title: lecture?.title || '', content: lecture?.content || '',
    duration: lecture?.duration || '~10 min read', tags: lecture?.tags?.join(', ') || '', order: lecture?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), order: Number(form.order) };
    try {
      if (isEdit) { await dispatch(updateLecture({ id: lecture._id, ...payload })); toast.success('Updated!'); }
      else { await dispatch(createLecture(payload)); toast.success('Created!'); }
      dispatch(fetchLectures());
      onClose();
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                    ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400'}`;
  const labelCls = `block text-sm font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                  className={`w-full max-w-2xl rounded-xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <h2 className={`text-base font-bold block ${darkMode ? 'text-white' : 'text-slate-800'}`}>{isEdit ? '✏️ Edit Lecture' : '✨ New Lecture'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 max-h-[65vh] overflow-y-auto">
          <div><label className={labelCls}>Title *</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Order</label><input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Tags (comma-separated)</label><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} /></div>
          <div><label className={labelCls}>Content (HTML)</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className={`${inputCls} font-mono text-xs resize-y`} /></div>
        </form>
        <div className={`flex justify-end gap-2 px-5 py-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1.5">
            <CheckIcon className="w-4 h-4" />{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Admin Dashboard ── */
export default function AdminPage() {
  const dispatch = useDispatch();
  const { darkMode } = useOutletContext();
  const { admin, token } = useSelector((s) => s.auth);
  const { lectures, loading } = useSelector((s) => s.lectures);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { if (token) dispatch(fetchLectures()); }, [dispatch, token]);

  if (!token && !admin) return <LoginForm darkMode={darkMode} />;

  const handleDelete = async (id) => {
    await dispatch(deleteLecture(id));
    toast.success('Deleted');
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`block text-2xl font-extrabold tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h1>
          <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your lectures</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('create')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <PlusIcon className="w-4 h-4" />New Lecture
          </button>
          <button onClick={() => dispatch(logout())}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                              ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <ArrowRightOnRectangleIcon className="w-4 h-4" />Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className={`text-2xl font-extrabold leading-none block ${darkMode ? 'text-white' : 'text-slate-900'}`}>{lectures.length}</p>
          <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Lectures</p>
        </div>
        <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-2xl font-extrabold text-emerald-500 leading-none block">{lectures.filter((l) => l.isPublished !== false).length}</p>
          <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Published</p>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-5 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <h2 className={`text-sm font-bold block ${darkMode ? 'text-white' : 'text-slate-800'}`}>All Lectures</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className={`h-10 rounded-lg animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />)}</div>
        ) : lectures.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpenIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No lectures yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}>
                  <th className="text-left px-5 py-2.5 font-semibold text-xs uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-2.5 font-semibold text-xs uppercase tracking-wider">Title</th>
                  <th className="hidden sm:table-cell text-left px-5 py-2.5 font-semibold text-xs uppercase tracking-wider">Slug</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {lectures.map((lec, i) => (
                  <tr key={lec._id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className={`px-5 py-3 font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{lec.order || i + 1}</td>
                    <td className={`px-5 py-3 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{lec.title}</td>
                    <td className={`hidden sm:table-cell px-5 py-3 font-mono text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{lec.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setModal(lec)} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-indigo-400 hover:bg-indigo-400/10' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(lec._id)} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'}`}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && <LectureModal lecture={modal === 'create' ? null : modal} onClose={() => setModal(null)} darkMode={darkMode} />}
      </AnimatePresence>
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        className={`w-full max-w-sm rounded-xl p-6 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🗑️</div>
                <h3 className={`block text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Delete Lecture?</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
