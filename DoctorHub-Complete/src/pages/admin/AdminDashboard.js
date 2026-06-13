import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAllUsers, toggleUserStatus, getUnverifiedDoctors, verifyDoctor } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, doctorsRes] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getUnverifiedDoctors(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setUnverifiedDoctors(doctorsRes.data.doctors || []);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: data.user.is_active } : u));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update user.');
    }
  };

  const handleVerifyDoctor = async (doctorId, isVerified) => {
    try {
      await verifyDoctor(doctorId, { isVerified });
      toast.success(`Doctor ${isVerified ? 'verified' : 'unverified'}.`);
      setUnverifiedDoctors(prev => prev.filter(d => d.doctor_id !== doctorId));
    } catch {
      toast.error('Failed to update doctor.');
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-teal-500 to-cyan-500' },
    { label: 'Doctors', value: stats.totalDoctors, icon: '👨‍⚕️', color: 'from-blue-500 to-indigo-500' },
    { label: 'Patients', value: stats.totalPatients, icon: '🤒', color: 'from-green-500 to-emerald-500' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: '📅', color: 'from-purple-500 to-violet-500' },
    { label: 'Pending Appointments', value: stats.pendingAppointments, icon: '⏳', color: 'from-amber-500 to-orange-500' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: '💳', color: 'from-red-500 to-rose-500' },
  ] : [];

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;

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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">System overview and user management</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'users', 'verify_doctors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {tab === 'verify_doctors' ? 'Verify Doctors' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'verify_doctors' && unverifiedDoctors.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{unverifiedDoctors.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse" />)
            ) : statCards.map((s, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-4`}>
                  {s.icon}
                </div>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="font-semibold text-white">All Users ({filteredUsers.length})</h2>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="assistant">Assistant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-left pb-3 font-medium">Name</th>
                      <th className="text-left pb-3 font-medium">Email</th>
                      <th className="text-left pb-3 font-medium">Role</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 text-white">{u.name}</td>
                        <td className="py-3 text-slate-300">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          {u.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleUser(u.id)}
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
            )}
          </div>
        )}

        {/* Verify Doctors Tab */}
        {activeTab === 'verify_doctors' && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-5">Doctors Pending Verification</h2>
            {unverifiedDoctors.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">✅</p>
                <p className="text-slate-400">All doctors are verified!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unverifiedDoctors.map(doc => (
                  <div key={doc.doctor_id} className="bg-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{doc.user?.name}</p>
                      <p className="text-teal-400 text-sm">{doc.specialization} · {doc.treatmentType}</p>
                      <p className="text-slate-400 text-xs mt-1">{doc.qualification} · {doc.experience} yrs</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyDoctor(doc.doctor_id, true)}
                        className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
