import React, { useState, useEffect } from 'react';
import { getMyDoctorProfile, updateDoctorProfile, addClinic } from '../../services/api';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    specialization: '', treatmentType: 'allopathic', experience: '',
    qualification: '', bio: '', consultationFee: '',
    availableDays: [], diseases: '',
  });
  const [clinicForm, setClinicForm] = useState({ name: '', address: '', city: '', timings: '', fee: '' });
  const [addingClinic, setAddingClinic] = useState(false);

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  useEffect(() => {
    getMyDoctorProfile()
      .then(res => {
        const d = res.data.doctor;
        setProfile(d);
        setForm({
          specialization: d.specialization || '',
          treatmentType: d.treatmentType || 'allopathic',
          experience: d.experience || '',
          qualification: d.qualification || '',
          bio: d.bio || '',
          consultationFee: d.consultationFee || '',
          availableDays: d.availableDays || [],
          diseases: (d.diseases || []).join(', '),
        });
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        diseases: form.diseases.split(',').map(d => d.trim()).filter(Boolean),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      };
      const res = await updateDoctorProfile(payload);
      setProfile(res.data.doctor);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    setAddingClinic(true);
    try {
      await addClinic({ ...clinicForm, fee: Number(clinicForm.fee) });
      toast.success('Clinic added!');
      setClinicForm({ name: '', address: '', city: '', timings: '', fee: '' });
      // Reload profile
      const res = await getMyDoctorProfile();
      setProfile(res.data.doctor);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add clinic.');
    } finally {
      setAddingClinic(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your doctor profile and clinic information</p>
          {!profile?.isVerified && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
              ⏳ Your profile is pending admin verification. Patients won't see you until verified.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile', 'clinics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {tab === 'clinics' ? '🏥 Clinics' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Specialization *</label>
                <input type="text" value={form.specialization}
                  onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} required
                  placeholder="e.g. General Physician"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Treatment Type *</label>
                <select value={form.treatmentType}
                  onChange={e => setForm(p => ({ ...p, treatmentType: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                  <option value="allopathic">Allopathic</option>
                  <option value="homeopathic">Homeopathic</option>
                  <option value="herbal">Herbal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Experience (years)</label>
                <input type="number" min="0" value={form.experience}
                  onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Consultation Fee (Rs.)</label>
                <input type="number" min="0" value={form.consultationFee}
                  onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-300 mb-1.5">Qualification</label>
                <input type="text" value={form.qualification}
                  onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
                  placeholder="e.g. MBBS, FCPS"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-300 mb-1.5">Diseases Treated (comma separated)</label>
                <input type="text" value={form.diseases}
                  onChange={e => setForm(p => ({ ...p, diseases: e.target.value }))}
                  placeholder="fever, diabetes, hypertension, skin problems"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-300 mb-1.5">Bio</label>
                <textarea value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={4} placeholder="Write a brief professional bio..."
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-slate-500" />
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.availableDays.includes(day) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {day.slice(0,3)}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* Clinics Tab */}
        {activeTab === 'clinics' && (
          <div className="space-y-4">
            {/* Existing clinics */}
            {profile?.clinics?.length > 0 && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4">Your Clinics ({profile.clinics.length})</h2>
                <div className="space-y-3">
                  {profile.clinics.map((clinic, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4 flex items-start gap-4">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏥</div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{clinic.name}</p>
                        <p className="text-slate-400 text-sm">{clinic.address}, {clinic.city}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{clinic.timings}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-teal-400 font-medium">Rs. {clinic.fee?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new clinic */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-5">Add New Clinic</h2>
              <form onSubmit={handleAddClinic} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Clinic Name *</label>
                    <input type="text" value={clinicForm.name} required
                      onChange={e => setClinicForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. City Medical Center"
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">City *</label>
                    <input type="text" value={clinicForm.city} required
                      onChange={e => setClinicForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Lahore"
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-300 mb-1.5">Address *</label>
                    <input type="text" value={clinicForm.address} required
                      onChange={e => setClinicForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Street address"
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Timings</label>
                    <input type="text" value={clinicForm.timings}
                      onChange={e => setClinicForm(p => ({ ...p, timings: e.target.value }))}
                      placeholder="e.g. Mon-Fri 9AM-5PM"
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Fee (Rs.)</label>
                    <input type="number" min="0" value={clinicForm.fee}
                      onChange={e => setClinicForm(p => ({ ...p, fee: e.target.value }))}
                      placeholder="1500"
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                  </div>
                </div>
                <button type="submit" disabled={addingClinic}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                  {addingClinic ? 'Adding...' : '+ Add Clinic'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
