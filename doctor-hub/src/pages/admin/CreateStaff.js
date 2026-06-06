import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStaff } from '../../services/api';
import toast from 'react-hot-toast';

const CreateStaff = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'doctor',
    phone: '', specialization: '', treatmentType: 'allopathic',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStaff(form);
      toast.success(`${form.role} account created!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Create Staff Account</h1>
        <p className="text-slate-400 mb-8">Add a new doctor or assistant to the system</p>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { field: 'name', label: 'Full Name', type: 'text', required: true },
              { field: 'email', label: 'Email', type: 'email', required: true },
              { field: 'phone', label: 'Phone', type: 'tel', required: false },
              { field: 'password', label: 'Password', type: 'password', required: true },
            ].map(({ field, label, type, required }) => (
              <div key={field}>
                <label className="block text-sm text-slate-300 mb-1.5">{label}{required && ' *'}</label>
                <input type={type} value={form[field]} required={required}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
            ))}

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                <option value="doctor">Doctor</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>

            {form.role === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Specialization</label>
                  <input type="text" value={form.specialization}
                    onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                    placeholder="e.g. General Physician"
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Treatment Type</label>
                  <select value={form.treatmentType}
                    onChange={e => setForm(p => ({ ...p, treatmentType: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                    <option value="allopathic">Allopathic</option>
                    <option value="homeopathic">Homeopathic</option>
                    <option value="herbal">Herbal</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;
