import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrescriptions, getDoctorAppointments } from '../../services/api';
import toast from 'react-hot-toast';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPatient, setSearchPatient] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [rxRes, apptRes] = await Promise.all([
          getPrescriptions(),
          getDoctorAppointments({ status: 'confirmed' }),
        ]);
        setPrescriptions(rxRes.data.prescriptions || []);
        setCompletedAppointments(apptRes.data.appointments || []);
      } catch {
        toast.error('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = searchPatient
    ? prescriptions.filter(rx => rx.patient?.name?.toLowerCase().includes(searchPatient.toLowerCase()))
    : prescriptions;

  const TREATMENT_COLORS = {
    allopathic: 'bg-blue-500/20 text-blue-300',
    homeopathic: 'bg-green-500/20 text-green-300',
    herbal: 'bg-amber-500/20 text-amber-300',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Prescriptions</h1>
            <p className="text-slate-400 mt-1">All prescriptions you have written</p>
          </div>
        </div>

        {/* Confirmed appointments ready for prescription */}
        {completedAppointments.length > 0 && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-5 mb-6">
            <h2 className="font-medium text-teal-300 mb-3 text-sm">📅 Confirmed Appointments — Ready to Add Records</h2>
            <div className="space-y-2">
              {completedAppointments.slice(0, 3).map(appt => (
                <div key={appt._id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-2.5">
                  <div>
                    <span className="text-white text-sm">{appt.patient?.name}</span>
                    <span className="text-slate-500 text-xs ml-2">
                      {new Date(appt.appointmentDate).toLocaleDateString()} · {appt.timeSlot}
                    </span>
                  </div>
                  <Link to={`/doctor/add-history/${appt._id}`}
                    className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                    Add Record
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <input type="text" placeholder="Search by patient name..."
            value={searchPatient} onChange={e => setSearchPatient(e.target.value)}
            className="w-full sm:w-80 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-700/50 rounded-2xl">
            <p className="text-5xl mb-4">💊</p>
            <p className="text-slate-400">No prescriptions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(rx => (
              <div key={rx._id} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {rx.patient?.name?.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-white">{rx.patient?.name}</h3>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 ml-10">
                      {new Date(rx.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${TREATMENT_COLORS[rx.treatmentType]}`}>
                      {rx.treatmentType}
                    </span>
                    {rx.followUpDate && (
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                        Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded-full">🔒 Immutable</span>
                  </div>
                </div>

                {/* Medicines table */}
                {rx.medicines?.length > 0 && (
                  <div className="bg-slate-800 rounded-xl overflow-hidden mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-700/50 text-slate-400">
                          <th className="text-left px-4 py-2 font-medium">Medicine</th>
                          <th className="text-left px-4 py-2 font-medium">Dosage</th>
                          <th className="text-left px-4 py-2 font-medium">Frequency</th>
                          <th className="text-left px-4 py-2 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {rx.medicines.map((med, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 text-white font-medium">{med.name}</td>
                            <td className="px-4 py-2.5 text-slate-300">{med.dosage || '—'}</td>
                            <td className="px-4 py-2.5 text-slate-300">{med.frequency || '—'}</td>
                            <td className="px-4 py-2.5 text-slate-300">{med.duration || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rx.advice && (
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
                    <p className="text-teal-400 text-xs font-medium mb-1">Advice</p>
                    <p className="text-slate-300 text-sm">{rx.advice}</p>
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

export default DoctorPrescriptions;
