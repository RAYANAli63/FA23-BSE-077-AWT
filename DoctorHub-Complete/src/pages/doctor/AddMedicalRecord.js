import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorAppointments, addMedicalHistory, addPrescription } from '../../services/api';
import toast from 'react-hot-toast';

const AddMedicalRecord = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [submitting, setSubmitting] = useState(false);

  // History form
  const [historyForm, setHistoryForm] = useState({ diagnosis: '', symptoms: '', notes: '', reportFiles: [] });

  // Prescription form
  const [rxForm, setRxForm] = useState({
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    advice: '', followUpDate: '', treatmentType: 'allopathic',
  });

  useEffect(() => {
    getDoctorAppointments()
      .then(res => {
        const appt = res.data.appointments?.find(a => a.id === appointmentId);
        if (!appt) toast.error('Appointment not found.');
        setAppointment(appt);
      })
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const addMedicine = () => setRxForm(p => ({
    ...p, medicines: [...p.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  }));

  const removeMedicine = (idx) => setRxForm(p => ({
    ...p, medicines: p.medicines.filter((_, i) => i !== idx)
  }));

  const updateMedicine = (idx, field, val) => setRxForm(p => ({
    ...p, medicines: p.medicines.map((m, i) => i === idx ? { ...m, [field]: val } : m)
  }));

  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!appointment) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('patientId', appointment.patient_id);
      fd.append('appointmentId', appointmentId);
      fd.append('diagnosis', historyForm.diagnosis);
      fd.append('symptoms', historyForm.symptoms);
      fd.append('notes', historyForm.notes);
      historyForm.reportFiles.forEach(f => fd.append('reportFiles', f));

      await addMedicalHistory(fd);
      toast.success('Medical history record added! (Permanent)');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!appointment) return;
    setSubmitting(true);
    try {
      await addPrescription({
        patientId: appointment.patient_id,
        appointmentId,
        medicines: rxForm.medicines.filter(m => m.name),
        advice: rxForm.advice,
        followUpDate: rxForm.followUpDate || undefined,
        treatmentType: rxForm.treatmentType,
      });
      toast.success('Prescription added! (Immutable record)');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add prescription.');
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Add Medical Record</h1>
          {appointment && (
            <p className="text-slate-400 mt-2">
              Patient: <span className="text-white">{appointment.patient?.name}</span>
              {' · '}Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Immutability warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-red-400 text-lg">🔒</span>
          <p className="text-red-300 text-sm">
            Medical records and prescriptions are <strong>permanent and immutable</strong>. They cannot be edited or deleted after creation. Please verify all information before submitting.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['history', 'prescription'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {tab === 'history' ? '📋 Medical History' : '💊 Prescription'}
            </button>
          ))}
        </div>

        {/* History Form */}
        {activeTab === 'history' && (
          <form onSubmit={handleAddHistory} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Diagnosis *</label>
              <input type="text" value={historyForm.diagnosis} required
                onChange={e => setHistoryForm(p => ({ ...p, diagnosis: e.target.value }))}
                placeholder="e.g. Acute Pharyngitis"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Symptoms (comma separated)</label>
              <input type="text" value={historyForm.symptoms}
                onChange={e => setHistoryForm(p => ({ ...p, symptoms: e.target.value }))}
                placeholder="fever, sore throat, headache"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Doctor's Notes</label>
              <textarea value={historyForm.notes}
                onChange={e => setHistoryForm(p => ({ ...p, notes: e.target.value }))}
                rows={4} placeholder="Clinical observations, findings..."
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Upload Reports (optional)</label>
              <input type="file" multiple accept="image/*,.pdf"
                onChange={e => setHistoryForm(p => ({ ...p, reportFiles: Array.from(e.target.files) }))}
                className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm cursor-pointer file:mr-3 file:bg-teal-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {submitting ? 'Saving Record...' : '🔒 Save Medical History (Permanent)'}
            </button>
          </form>
        )}

        {/* Prescription Form */}
        {activeTab === 'prescription' && (
          <form onSubmit={handleAddPrescription} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Treatment Type</label>
                <select value={rxForm.treatmentType}
                  onChange={e => setRxForm(p => ({ ...p, treatmentType: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                  <option value="allopathic">Allopathic</option>
                  <option value="homeopathic">Homeopathic</option>
                  <option value="herbal">Herbal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Follow-up Date</label>
                <input type="date" value={rxForm.followUpDate}
                  onChange={e => setRxForm(p => ({ ...p, followUpDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
            </div>

            {/* Medicines */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-slate-300">Medicines</label>
                <button type="button" onClick={addMedicine}
                  className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-lg hover:bg-teal-500/30 transition-colors">
                  + Add Medicine
                </button>
              </div>
              <div className="space-y-3">
                {rxForm.medicines.map((med, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-4 relative">
                    {rxForm.medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(idx)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-xs">✕</button>
                    )}
                    <p className="text-slate-400 text-xs mb-3">Medicine #{idx + 1}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { field: 'name', placeholder: 'Medicine name *', required: true },
                        { field: 'dosage', placeholder: 'Dosage (e.g. 500mg)' },
                        { field: 'frequency', placeholder: 'Frequency (e.g. twice daily)' },
                        { field: 'duration', placeholder: 'Duration (e.g. 7 days)' },
                        { field: 'instructions', placeholder: 'Instructions (e.g. after meal)' },
                      ].map(({ field, placeholder, required }) => (
                        <input key={field} type="text" placeholder={placeholder} required={required}
                          value={med[field]} onChange={e => updateMedicine(idx, field, e.target.value)}
                          className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Doctor's Advice</label>
              <textarea value={rxForm.advice}
                onChange={e => setRxForm(p => ({ ...p, advice: e.target.value }))}
                rows={3} placeholder="Dietary advice, rest, precautions..."
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-slate-500" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {submitting ? 'Saving Prescription...' : '🔒 Save Prescription (Immutable)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMedicalRecord;
