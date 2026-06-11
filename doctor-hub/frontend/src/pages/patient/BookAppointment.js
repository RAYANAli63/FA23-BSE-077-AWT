import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, bookAppointment, uploadPayment } from '../../services/api';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Book, 2: Payment
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({ appointmentDate: '', timeSlot: '', symptoms: '', clinicIndex: 0 });
  const [paymentForm, setPaymentForm] = useState({ method: 'jazzcash', transactionId: '', screenshot: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDoctorById(doctorId)
      .then(res => setDoctor(res.data.doctor))
      .catch(() => toast.error('Doctor not found.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.timeSlot) return toast.error('Please fill all required fields.');
    setSubmitting(true);
    try {
      const { data } = await bookAppointment({ doctorId, ...form });
      setAppointment(data.appointment);
      setStep(2);
      toast.success('Appointment created! Now upload payment.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('appointmentId', appointment._id);
      fd.append('method', paymentForm.method);
      fd.append('transactionId', paymentForm.transactionId);
      fd.append('amount', doctor?.clinics?.[form.clinicIndex]?.fee || doctor?.consultationFee || 0);
      if (paymentForm.screenshot) fd.append('screenshot', paymentForm.screenshot);

      await uploadPayment(fd);
      toast.success('Payment uploaded! Waiting for assistant verification.');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Doctor not found.</div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Doctor info header */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {doctor.user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-white">{doctor.user?.name}</h2>
            <p className="text-teal-400 text-sm">{doctor.specialization}</p>
            <p className="text-slate-400 text-xs mt-0.5">{doctor.treatmentType} · {doctor.experience} yrs experience</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-white' : 'text-slate-400'}`}>
                {s === 1 ? 'Book Slot' : 'Upload Payment'}
              </span>
              {s < 2 && <div className="w-12 h-0.5 bg-slate-700 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Book */}
        {step === 1 && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-semibold text-white text-lg mb-5">Book Appointment</h2>
            <form onSubmit={handleBook} className="space-y-5">
              {/* Clinic selection */}
              {doctor.clinics?.length > 0 && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Select Clinic</label>
                  <div className="space-y-2">
                    {doctor.clinics.map((clinic, i) => (
                      <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.clinicIndex === i ? 'border-teal-500 bg-teal-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                        <input type="radio" name="clinic" value={i} checked={form.clinicIndex === i}
                          onChange={() => setForm(p => ({ ...p, clinicIndex: i }))} className="accent-teal-500" />
                        <div>
                          <p className="text-white text-sm font-medium">{clinic.name}</p>
                          <p className="text-slate-400 text-xs">{clinic.address}, {clinic.city} · Rs. {clinic.fee?.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">{clinic.timings}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Appointment Date *</label>
                <input
                  type="date"
                  value={form.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, appointmentDate: e.target.value }))}
                  required
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Time Slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, timeSlot: slot }))}
                      className={`text-xs py-2 rounded-lg border transition-colors ${form.timeSlot === slot ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Symptoms / Reason</label>
                <textarea
                  value={form.symptoms}
                  onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))}
                  placeholder="Describe your symptoms..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-slate-500"
                />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {submitting ? 'Booking...' : 'Book Appointment →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-semibold text-white text-lg mb-2">Upload Payment</h2>
            <p className="text-slate-400 text-sm mb-5">
              Pay <span className="text-teal-400 font-medium">Rs. {appointment?.fee?.toLocaleString()}</span> via JazzCash/EasyPaisa and upload screenshot.
            </p>
            <form onSubmit={handlePayment} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Payment Method</label>
                <select value={paymentForm.method}
                  onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Transaction ID</label>
                <input type="text" value={paymentForm.transactionId}
                  onChange={e => setPaymentForm(p => ({ ...p, transactionId: e.target.value }))}
                  placeholder="Enter transaction ID"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Payment Screenshot</label>
                <input type="file" accept="image/*"
                  onChange={e => setPaymentForm(p => ({ ...p, screenshot: e.target.files[0] }))}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 file:mr-3 file:bg-teal-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs cursor-pointer" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {submitting ? 'Uploading...' : 'Submit Payment ✓'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
