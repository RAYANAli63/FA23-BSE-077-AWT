import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorById } from '../services/api';
import toast from 'react-hot-toast';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorById(id)
      .then(res => setDoctor(res.data.doctor))
      .catch(() => toast.error('Doctor not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-5xl mb-4">👨‍⚕️</p>
        <p className="text-slate-400">Doctor not found.</p>
        <Link to="/doctors" className="text-teal-400 mt-4 block">← Back to Doctors</Link>
      </div>
    </div>
  );

  const treatmentColor = {
    allopathic: 'from-blue-500 to-cyan-500',
    homeopathic: 'from-green-500 to-teal-500',
    herbal: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Doctor Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 text-center">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${treatmentColor[doctor.treatmentType]} flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4`}>
                {doctor.user?.name?.charAt(0)}
              </div>
              <h1 className="font-display text-xl font-bold">{doctor.user?.name}</h1>
              <p className="text-teal-400 text-sm mt-1">{doctor.specialization}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-amber-400">★</span>
                <span className="text-white font-medium">{doctor.rating?.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">({doctor.totalReviews} reviews)</span>
              </div>
              <div className="mt-3">
                <span className={`inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r ${treatmentColor[doctor.treatmentType]} text-white font-medium`}>
                  {doctor.treatmentType}
                </span>
              </div>
              {doctor.isVerified && (
                <div className="flex items-center justify-center gap-1 mt-3 text-teal-400 text-xs">
                  <span>✓</span><span>Verified Doctor</span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              {[
                { icon: '🎓', label: 'Qualification', value: doctor.qualification || 'N/A' },
                { icon: '⏱️', label: 'Experience', value: `${doctor.experience} years` },
                { icon: '💰', label: 'Consultation Fee', value: `Rs. ${doctor.consultationFee?.toLocaleString() || 0}` },
                { icon: '📞', label: 'Phone', value: doctor.user?.phone || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-slate-500 text-xs">{item.label}</p>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Available Days */}
            {doctor.availableDays?.length > 0 && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-white font-medium mb-3 text-sm">Available Days</h3>
                <div className="flex flex-wrap gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                    const full = { Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday' }[day];
                    const active = doctor.availableDays.includes(full);
                    return (
                      <span key={day} className={`text-xs px-2.5 py-1 rounded-lg ${active ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-600'}`}>
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              to={`/book/${doctor.doctor_id}`}
              className="block w-full text-center bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              Book Appointment
            </Link>
          </div>

          {/* Right – Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bio */}
            {doctor.bio && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-3">About</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Diseases Treated */}
            {doctor.diseases?.length > 0 && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4">Diseases Treated</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.diseases.map((d, i) => (
                    <span key={i} className="text-sm bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1.5 rounded-xl capitalize">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinics */}
            {doctor.clinics?.length > 0 && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4">Clinic Locations</h2>
                <div className="space-y-3">
                  {doctor.clinics.map((clinic, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4 flex items-start gap-4">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 flex-shrink-0">
                        🏥
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{clinic.name}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{clinic.address}, {clinic.city}</p>
                        <p className="text-slate-500 text-xs mt-1">{clinic.timings}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-teal-400 font-medium">Rs. {clinic.fee?.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">per visit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assistants */}
            {doctor.assistants?.length > 0 && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4">Staff Assistants</h2>
                <div className="space-y-2">
                  {doctor.assistants.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 text-sm font-bold">
                        {a.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm">{a.name}</p>
                        <p className="text-slate-400 text-xs">{a.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
