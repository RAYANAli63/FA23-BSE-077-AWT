import React, { useState, useEffect } from 'react';
import { getMedicalHistory, getPrescriptions } from '../../services/api';
import toast from 'react-hot-toast';

const MedicalHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    const load = async () => {
      try {
        const [histRes, presRes] = await Promise.all([getMedicalHistory(), getPrescriptions()]);
        setHistory(histRes.data.history || []);
        setPrescriptions(presRes.data.prescriptions || []);
      } catch {
        toast.error('Failed to load records.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Medical Records</h1>
          <p className="text-slate-400 mt-1">Your complete medical history — immutable and secure</p>
        </div>

        {/* Important notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-400 text-lg flex-shrink-0">🔒</span>
          <p className="text-amber-300 text-sm">Medical records are permanent and cannot be deleted or modified. This ensures complete healthcare transparency.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['history', 'prescriptions'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 text-xs opacity-75">({tab === 'history' ? history.length : prescriptions.length})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse" />)}</div>
        ) : activeTab === 'history' ? (
          history.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-slate-400">No medical records yet. Records are added by your doctor after consultation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(record => (
                <div key={record._id} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white text-base">{record.diagnosis}</h3>
                      <p className="text-slate-400 text-sm mt-0.5">
                        Dr. {record.doctor?.name} · {new Date(record.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">Permanent Record</span>
                  </div>

                  {record.symptoms?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-slate-500 text-xs mb-1.5">Symptoms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {record.symptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.notes && (
                    <div className="bg-slate-800 rounded-xl p-3 mt-3">
                      <p className="text-slate-500 text-xs mb-1">Doctor's Notes</p>
                      <p className="text-slate-300 text-sm">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          prescriptions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">💊</p>
              <p className="text-slate-400">No prescriptions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map(rx => (
                <div key={rx._id} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">
                        Dr. {rx.doctor?.name} · {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${rx.treatmentType === 'allopathic' ? 'bg-blue-500/20 text-blue-300' : rx.treatmentType === 'homeopathic' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {rx.treatmentType}
                      </span>
                    </div>
                    {rx.followUpDate && (
                      <div className="text-right">
                        <p className="text-slate-500 text-xs">Follow-up</p>
                        <p className="text-teal-400 text-sm">{new Date(rx.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Medicines table */}
                  <div className="bg-slate-800 rounded-xl overflow-hidden mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-700/50 text-slate-400">
                          <th className="text-left px-4 py-2">Medicine</th>
                          <th className="text-left px-4 py-2">Dosage</th>
                          <th className="text-left px-4 py-2">Frequency</th>
                          <th className="text-left px-4 py-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {rx.medicines?.map((med, i) => (
                          <tr key={i} className="hover:bg-slate-700/30">
                            <td className="px-4 py-2 text-white font-medium">{med.name}</td>
                            <td className="px-4 py-2 text-slate-300">{med.dosage || '—'}</td>
                            <td className="px-4 py-2 text-slate-300">{med.frequency || '—'}</td>
                            <td className="px-4 py-2 text-slate-300">{med.duration || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.advice && (
                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
                      <p className="text-teal-400 text-xs font-medium mb-1">Doctor's Advice</p>
                      <p className="text-slate-300 text-sm">{rx.advice}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryPage;
