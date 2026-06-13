import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAllUsers, createStaff, toggleUserStatus } from '../../services/api';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'doctor', phone: '', specialization: '', treatmentType: 'allopathic' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([getDashboardStats(), getAllUsers()]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createStaff(createForm);
      toast.success(`${createForm.role} created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'doctor', phone: '', specialization: '', treatmentType: 'allopathic' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: data.user.isActive } : u));
      toast.success(data.message);
    } catch {
      toast.error('Failed.');
    }
  };

  const ROLE_COLORS = {
    patient: 'bg-teal-500/20 text-teal-300',
    doctor: 'bg-blue-500/20 text-blue-300',
    assistant: 'bg-purple-500/20 text-purple-300',
    admin: 'bg-orange-500/20 text-orange-300',
    super_admin: 'bg-red-500/20 text-red-300',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Super Admin</h1>
            <p className="text-slate-400 mt-1">Full system control — Doctor Hub</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            + Create Staff
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'all_users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'from-teal-500 to-cyan-500', icon: '👥' },
              { label: 'Doctors', value: stats.totalDoctors, color: 'from-blue-500 to-indigo-500', icon: '👨‍⚕️' },
              { label: 'Patients', value: stats.totalPatients, color: 'from-green-500 to-emerald-500', icon: '🤒' },
              { label: 'Appointments', value: stats.totalAppointments, color: 'from-purple-500 to-violet-500', icon: '📅' },
              { label: 'Confirmed', value: stats.confirmedAppointments, color: 'from-teal-500 to-green-500', icon: '✅' },
              { label: 'Pending Appts', value: stats.pendingAppointments, color: 'from-amber-500 to-orange-500', icon: '⏳' },
              { label: 'Total Payments', value: stats.totalPayments, color: 'from-indigo-500 to-blue-500', icon: '💰' },
              { label: 'Pending Payments', value: stats.pendingPayments, color: 'from-red-500 to-rose-500', icon: '💳' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'all_users' && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-5">All System Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-left pb-3 font-medium">Role</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Joined</th>
                    <th className="text-left pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/50">
                      <td className="py-3 text-white">{u.name}</td>
                      <td className="py-3 text-slate-300 text-xs">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        {u.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggle(u.id)}
                            className={`text-xs px-3 py-1 rounded-lg transition-colors ${u.is_active ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-white text-lg mb-5">Create Staff Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              {['name', 'email', 'phone'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-slate-300 mb-1.5 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    required={field !== 'phone'}
                    value={createForm[field]}
                    onChange={e => setCreateForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Password</label>
                <input type="password" required value={createForm.password}
                  onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Role</label>
                <select value={createForm.role}
                  onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                  <option value="doctor">Doctor</option>
                  <option value="assistant">Assistant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {createForm.role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Specialization</label>
                    <input type="text" value={createForm.specialization}
                      onChange={e => setCreateForm(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Treatment Type</label>
                    <select value={createForm.treatmentType}
                      onChange={e => setCreateForm(prev => ({ ...prev, treatmentType: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                      <option value="allopathic">Allopathic</option>
                      <option value="homeopathic">Homeopathic</option>
                      <option value="herbal">Herbal</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
