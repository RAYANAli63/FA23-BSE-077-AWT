import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, getMyDoctorProfile, completeAppointment } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  payment_pending:  'bg-amber-500/20 text-amber-300',
  payment_uploaded: 'bg-blue-500/20 text-blue-300',
  confirmed:        'bg-teal-500/20 text-teal-300',
  completed:        'bg-green-500/20 text-green-300',
  cancelled:        'bg-red-500/20 text-red-300',
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, profileRes] = await Promise.all([
          getDoctorAppointments(),
          getMyDoctorProfile(),
        ]);
        setAppointments(apptRes.data.appointments || []);
        setProfile(profileRes.data.doctor);
      } catch {
        toast.error('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      await completeAppointment(id);
      toast.success('Appointment marked as completed!');
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setCompleting(null);
    }
  };

  const TABS = ['all', 'confirmed', 'completed', 'cancelled'];
  const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

  const today = new Date().toDateString();
  const stats = [
    { label: "Today's Appointments", value: appointments.filter(a => new Date(a.appointmentDate).toDateString() === today).length, icon: '📅', color: 'from-teal-500 to-cyan-500' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: '🏥', color: 'from-blue-500 to-indigo-500' },
    { label: 'Rating', value: profile?.rating ? `${profile.rating.toFixed(1)}★` : 'N/A', icon: '⭐', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-slate-400 mt-1">
              {profile ? (
                <>
                  <span className="text-teal-400">{profile.specialization}</span>
                  {' · '}<span className="capitalize">{profile.treatmentType}</span>
                  {!profile.isVerified && (
                    <span className="ml-2 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">⏳ Pending Verification</span>
                  )}
                </>
              ) : `Welcome, ${user?.name}`}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/doctor/profile" className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-600 transition-colors">
              ✏️ Edit Profile
            </Link>
            <Link to="/doctor/prescriptions" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              💊 Prescriptions
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="font-semibold text-white">Appointments</h2>
            <div className="flex gap-2 flex-wrap">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {tab} {tab !== 'all' && `(${appointments.filter(a => a.status === tab).length})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-slate-400 text-sm">No appointments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50">
                    <th className="text-left pb-3 font-medium">Patient</th>
                    <th className="text-left pb-3 font-medium">Date & Time</th>
                    <th className="text-left pb-3 font-medium hidden sm:table-cell">Symptoms</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map(appt => (
                    <tr key={appt._id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 text-white font-medium">{appt.patient?.name || '—'}</td>
                      <td className="py-3 text-slate-300">
                        <span>{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                        <br /><span className="text-slate-500 text-xs">{appt.timeSlot}</span>
                      </td>
                      <td className="py-3 text-slate-400 max-w-[140px] truncate hidden sm:table-cell">
                        {appt.symptoms || '—'}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[appt.status] || 'bg-slate-700 text-slate-300'}`}>
                          {appt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2 flex-wrap">
                          {appt.status === 'confirmed' && (
                            <>
                              <Link to={`/doctor/add-history/${appt._id}`}
                                className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 px-2.5 py-1 rounded-lg transition-colors border border-teal-500/30">
                                + Record
                              </Link>
                              <button onClick={() => handleComplete(appt._id)} disabled={completing === appt._id}
                                className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2.5 py-1 rounded-lg transition-colors border border-green-500/30 disabled:opacity-50">
                                {completing === appt._id ? '...' : '✓ Done'}
                              </button>
                            </>
                          )}
                          {appt.status === 'completed' && (
                            <Link to={`/doctor/add-history/${appt._id}`}
                              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-lg transition-colors">
                              View/Add
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Edit Profile', icon: '👤', to: '/doctor/profile' },
            { label: 'My Clinics', icon: '🏥', to: '/doctor/profile' },
            { label: 'Prescriptions', icon: '💊', to: '/doctor/prescriptions' },
            { label: 'Find Patients', icon: '🔍', to: '/doctor/dashboard' },
          ].map((link, i) => (
            <Link key={i} to={link.to}
              className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 text-center hover:border-teal-500/40 transition-all hover:-translate-y-0.5">
              <span className="text-3xl block mb-2">{link.icon}</span>
              <span className="text-slate-300 text-sm">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
