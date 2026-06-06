import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyAppointments, uploadPayment } from '../../services/api';
import toast from 'react-hot-toast';

const PaymentUploadPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ method: 'jazzcash', transactionId: '', screenshot: null });

  useEffect(() => {
    getMyAppointments()
      .then(res => {
        const appt = res.data.appointments?.find(a => a._id === appointmentId);
        if (!appt) toast.error('Appointment not found.');
        setAppointment(appt);
      })
      .catch(() => toast.error('Failed to load appointment.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('appointmentId', appointmentId);
      fd.append('method', form.method);
      fd.append('transactionId', form.transactionId);
      fd.append('amount', appointment?.fee || 0);
      if (form.screenshot) fd.append('screenshot', form.screenshot);

      await uploadPayment(fd);
      toast.success('Payment uploaded! Awaiting verification.');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Upload Payment</h1>
        {appointment && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 mb-6">
            <p className="text-slate-400 text-sm">Appointment with <span className="text-white">{appointment.doctor?.name}</span></p>
            <p className="text-slate-400 text-sm">Date: <span className="text-white">{new Date(appointment.appointmentDate).toLocaleDateString()}</span> · {appointment.timeSlot}</p>
            <p className="text-teal-400 font-semibold mt-2">Amount Due: Rs. {appointment.fee?.toLocaleString()}</p>
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-sm text-amber-300">
          💡 Send payment to doctor's JazzCash/EasyPaisa number, then upload screenshot here.
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={form.method}
                onChange={e => setForm(p => ({ ...p, method: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Transaction ID</label>
              <input
                type="text"
                value={form.transactionId}
                onChange={e => setForm(p => ({ ...p, transactionId: e.target.value }))}
                placeholder="e.g. TXN123456789"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setForm(p => ({ ...p, screenshot: e.target.files[0] }))}
                className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm cursor-pointer file:mr-3 file:bg-teal-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {submitting ? 'Uploading...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentUploadPage;
