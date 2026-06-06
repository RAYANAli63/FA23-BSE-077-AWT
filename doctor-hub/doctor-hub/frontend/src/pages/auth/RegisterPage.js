import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_DASHBOARD = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/superadmin/dashboard',
};

const ROLES = [
  { value: 'patient',     label: '🤒 Patient',     desc: 'Book appointments & manage health records' },
  { value: 'doctor',      label: '👨‍⚕️ Doctor',      desc: 'Manage appointments & write prescriptions' },
  { value: 'assistant',   label: '🧑‍💼 Assistant',   desc: 'Verify payments & confirm bookings' },
  { value: 'admin',       label: '🛡️ Admin',        desc: 'Manage doctors, users & system' },
  { value: 'super_admin', label: '👑 Super Admin',  desc: 'Full system control' },
];

const ROLE_COLORS = {
  patient:     'border-teal-500 bg-teal-500/10 text-teal-300',
  doctor:      'border-blue-500 bg-blue-500/10 text-blue-300',
  assistant:   'border-purple-500 bg-purple-500/10 text-purple-300',
  admin:       'border-orange-500 bg-orange-500/10 text-orange-300',
  super_admin: 'border-red-500 bg-red-500/10 text-red-300',
};

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', treatmentType: 'allopathic',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: selectedRole,
        ...(selectedRole === 'doctor' && {
          specialization: form.specialization || 'General',
          treatmentType: form.treatmentType,
        }),
      };
      const { data } = await registerUser(payload);
      login(data.token, data.user);
      toast.success(`✅ ${data.user.role.replace('_',' ')} account created!`);
      navigate(ROLE_DASHBOARD[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">DH</span>
            </div>
            <span className="font-display font-bold text-white text-xl">Doctor Hub</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2 text-sm">Choose your role and register</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-slate-400 text-xs text-center mb-3 uppercase tracking-widest">Select Your Role</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  selectedRole === r.value
                    ? ROLE_COLORS[r.value]
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="block text-sm font-semibold">{r.label}</span>
                <span className="block text-xs opacity-70 mt-0.5 leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">

          {/* Selected role badge */}
          <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border mb-5 ${ROLE_COLORS[selectedRole]}`}>
            <span>Registering as:</span>
            <span className="font-bold capitalize">{selectedRole.replace('_', ' ')}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Basic Fields */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} required
                placeholder="Your full name"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email *</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Phone</label>
              <input
                type="tel" name="phone" value={form.phone}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password *</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} required
                placeholder="Min. 6 characters"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
              />
            </div>

            {/* Doctor-specific fields */}
            {selectedRole === 'doctor' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Doctor Details</p>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Specialization</label>
                  <input
                    type="text" name="specialization" value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. General Physician, Cardiologist"
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Treatment Type</label>
                  <select
                    name="treatmentType" value={form.treatmentType}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="allopathic">Allopathic (Modern Medicine)</option>
                    <option value="homeopathic">Homeopathic</option>
                    <option value="herbal">Herbal / Traditional</option>
                  </select>
                </div>
                <p className="text-slate-500 text-xs">
                  ⚠️ Doctor accounts need admin verification before appearing in listings.
                </p>
              </div>
            )}

            {/* Info notices per role */}
            {selectedRole === 'assistant' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-purple-300 text-xs">
                ℹ️ As an assistant, you will verify patient payments and confirm appointments.
              </div>
            )}
            {selectedRole === 'admin' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-orange-300 text-xs">
                ℹ️ Admin can manage users, verify doctors, and view system analytics.
              </div>
            )}
            {selectedRole === 'super_admin' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs">
                ⚠️ Super Admin has full system access. Use responsibly.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all mt-2"
            >
              {loading ? 'Creating Account...' : `Create ${selectedRole.replace('_',' ')} Account`}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
