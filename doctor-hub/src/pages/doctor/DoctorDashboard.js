import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, getMyDoctorProfile } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  confirmed: 'bg-teal-500/20 text-teal-300',
  completed: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
  payment_uploaded: 'bg-blue-500/20 text-blue-300',
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

  const stats = [
    { label: "Today's Appointments", value: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length, icon: '📅', color: 'from-teal-500 to-cyan-500' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: '🏥', color: 'from-blue-500 to-indigo-500' },
    { label: 'Rating', value: profile?.rating?.toFixed(1) || '—', icon: '⭐', color: 'from-amber-500 to-orange-500' },
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
                <span>
                  <span className="text-teal-400">{profile.specialization}</span>
                  {' · '}{profile.treatmentType}
                  {!profile.isVerified && <span className="text-amber-400 ml-2 text-xs">(Pending Verification)</span>}
                </span>
              ) : `Welcome, ${user?.name}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/doctor/profile" className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-600 transition-colors">
              Edit Profile
            </Link>
            <Link to="/doctor/prescriptions" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              + Add Prescription
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="font-semibold text-white">Appointments</h2>
            <div className="flex gap-2">
              {['all', 'confirmed', 'completed', 'cancelled'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
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
                    <th className="text-left pb-3 font-medium">Symptoms</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map(appt => (
                    <tr key={appt._id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 text-white">{appt.patient?.name}</td>
                      <td className="py-3 text-slate-300">
                        {new Date(appt.appointmentDate).toLocaleDateString()}<br />
                        <span className="text-slate-500 text-xs">{appt.timeSlot}</span>
                      </td>
                      <td className="py-3 text-slate-400 max-w-[150px] truncate">{appt.symptoms || '—'}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[appt.status] || 'bg-slate-700 text-slate-300'}`}>
                          {appt.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        {appt.status === 'confirmed' && (
                          <Link to={`/doctor/add-history/${appt._id}`} className="text-teal-400 hover:text-teal-300 text-xs">
                            Add Record
                          </Link>
                        )}
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
            { label: 'Manage Schedule', icon: '🗓️', to: '/doctor/schedule' },
            { label: 'My Clinics', icon: '🏥', to: '/doctor/clinics' },
            { label: 'Prescriptions', icon: '💊', to: '/doctor/prescriptions' },
            { label: 'Edit Profile', icon: '👤', to: '/doctor/profile' },
          ].map((link, i) => (
            <Link key={i} to={link.to} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 text-center hover:border-teal-500/40 transition-all hover:-translate-y-0.5">
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
