import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments, cancelAppointment } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: { cls: 'bg-slate-700 text-slate-300', label: 'Pending' },
  payment_pending: { cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', label: 'Payment Pending' },
  payment_uploaded: { cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', label: 'Payment Uploaded' },
  confirmed: { cls: 'bg-teal-500/20 text-teal-300 border border-teal-500/30', label: 'Confirmed' },
  completed: { cls: 'bg-green-500/20 text-green-300 border border-green-500/30', label: 'Completed' },
  cancelled: { cls: 'bg-red-500/20 text-red-300 border border-red-500/30', label: 'Cancelled' },
};

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getMyAppointments();
      setAppointments(data.appointments || []);
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled.');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Appointments</h1>
            <p className="text-slate-400 mt-1">Track all your appointment history</p>
          </div>
          <Link to="/doctors" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            + New Appointment
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'payment_pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-4 py-2 rounded-lg transition-colors capitalize ${filter === s ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {s.replace(/_/g, ' ')}
              {s !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  ({appointments.filter(a => a.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-700/50 rounded-2xl">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-slate-400 mb-4">No appointments found.</p>
            <Link to="/doctors" className="text-teal-400 hover:text-teal-300 text-sm">Browse doctors →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(appt => (
              <div key={appt.id} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {appt.doctor?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{appt.doctor?.name}</h3>
                      <p className="text-teal-400 text-sm">{appt.doctorProfile?.specialization}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>📅 {new Date(appt.appointmentDate).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>🕐 {appt.timeSlot}</span>
                        {appt.clinic?.name && <span>🏥 {appt.clinic.name}, {appt.clinic.city}</span>}
                        <span>💰 Rs. {appt.fee?.toLocaleString()}</span>
                      </div>
                      {appt.symptoms && (
                        <p className="text-slate-500 text-xs mt-2">Symptoms: {appt.symptoms}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[appt.status]?.cls}`}>
                      {STATUS_STYLES[appt.status]?.label}
                    </span>
                    <div className="flex gap-2">
                      {appt.status === 'payment_pending' && (
                        <Link
                          to={`/patient/pay/${appt.id}`}
                          className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Upload Payment
                        </Link>
                      )}
                      {['pending', 'payment_pending', 'payment_uploaded'].includes(appt.status) && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelling === appt.id}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancelling === appt.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {appt.status === 'confirmed' && (
                  <div className="mt-4 bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-teal-400">✅</span>
                    <p className="text-teal-300 text-xs">Appointment confirmed! Please arrive on time.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
