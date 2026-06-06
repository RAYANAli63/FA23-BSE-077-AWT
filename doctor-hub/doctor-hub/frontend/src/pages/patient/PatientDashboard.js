import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments, getMedicalHistory } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:          'bg-slate-700 text-slate-300',
  payment_pending:  'bg-amber-500/20 text-amber-300',
  payment_uploaded: 'bg-blue-500/20 text-blue-300',
  confirmed:        'bg-teal-500/20 text-teal-300',
  completed:        'bg-green-500/20 text-green-300',
  cancelled:        'bg-red-500/20 text-red-300',
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, histRes] = await Promise.all([
          getMyAppointments(),
          getMedicalHistory(),
        ]);
        setAppointments(apptRes.data.appointments || []);
        setHistory(histRes.data.history || []);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: '📅', color: 'from-teal-500 to-cyan-500' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Payment', value: appointments.filter(a => a.status === 'payment_pending').length, icon: '💳', color: 'from-amber-500 to-orange-500' },
    { label: 'Medical Records', value: history.length, icon: '📋', color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Patient Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, <span className="text-teal-400">{user?.name}</span></p>
          </div>
          <Link to="/doctors" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            + Book Appointment
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Recent Appointments</h2>
              <Link to="/patient/appointments" className="text-teal-400 text-sm hover:text-teal-300">View all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-slate-400 text-sm">No appointments yet.</p>
                <Link to="/doctors" className="text-teal-400 text-sm mt-2 block hover:text-teal-300">Book your first →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map(appt => (
                  <div key={appt._id} className="flex items-center justify-between bg-slate-800 rounded-xl p-4">
                    <div>
                      <p className="text-white text-sm font-medium">{appt.doctor?.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(appt.appointmentDate).toLocaleDateString()} · {appt.timeSlot}
                      </p>
                      {appt.status === 'payment_pending' && (
                        <Link to={`/patient/pay/${appt._id}`} className="text-xs text-amber-400 hover:text-amber-300 mt-1 block">
                          ⚠️ Upload Payment →
                        </Link>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[appt.status]}`}>
                      {appt.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical History */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Medical History</h2>
              <Link to="/patient/history" className="text-teal-400 text-sm hover:text-teal-300">View all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}</div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-slate-400 text-sm">No medical records yet.</p>
                <p className="text-slate-500 text-xs mt-1">Records added by your doctor after consultation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map(record => (
                  <div key={record._id} className="bg-slate-800 rounded-xl p-4">
                    <p className="text-white text-sm font-medium">{record.diagnosis}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Dr. {record.doctor?.name} · {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'My Appointments', icon: '📅', to: '/patient/appointments' },
            { label: 'Medical History', icon: '📋', to: '/patient/history' },
            { label: 'Prescriptions', icon: '💊', to: '/patient/prescriptions' },
            { label: 'Find Doctors', icon: '🔍', to: '/doctors' },
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

export default PatientDashboard;
