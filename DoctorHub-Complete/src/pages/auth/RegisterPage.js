import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_DASHBOARD = {
  patient: '/patient/dashboard', doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard', admin: '/admin/dashboard', super_admin: '/superadmin/dashboard',
};

const ROLES = [
  { value: 'patient',     label: '🤒 Patient',     desc: 'Book appointments & manage health' },
  { value: 'doctor',      label: '👨‍⚕️ Doctor',      desc: 'Manage appointments & prescriptions' },
  { value: 'assistant',   label: '🧑‍💼 Assistant',   desc: 'Verify payments & bookings' },
  { value: 'admin',       label: '🛡️ Admin',        desc: 'Manage users & system' },
  { value: 'super_admin', label: '👑 Super Admin',  desc: 'Full system control' },
];

const ROLE_COLORS = {
  patient:'border-teal-500 bg-teal-500/10 text-teal-300',
  doctor:'border-blue-500 bg-blue-500/10 text-blue-300',
  assistant:'border-purple-500 bg-purple-500/10 text-purple-300',
  admin:'border-orange-500 bg-orange-500/10 text-orange-300',
  super_admin:'border-red-500 bg-red-500/10 text-red-300',
};

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', specialization:'', treatmentType:'allopathic' });
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate(ROLE_DASHBOARD[user.role] || '/'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password min 6 characters.');
    setLoading(true);
    try {
      await register({ ...form, role: selectedRole });
      toast.success('Account created! Check email to confirm if required.');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
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
              <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${selectedRole===r.value ? ROLE_COLORS[r.value] : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'}`}>
                <span className="block text-sm font-semibold">{r.label}</span>
                <span className="block text-xs opacity-70 mt-0.5 leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border mb-5 ${ROLE_COLORS[selectedRole]}`}>
            <span>Registering as:</span>
            <span className="font-bold capitalize">{selectedRole.replace('_',' ')}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field:'name', label:'Full Name', type:'text', placeholder:'Your full name', required:true },
              { field:'email', label:'Email', type:'email', placeholder:'you@example.com', required:true },
              { field:'phone', label:'Phone', type:'tel', placeholder:'03XX-XXXXXXX', required:false },
              { field:'password', label:'Password', type:'password', placeholder:'Min. 6 characters', required:true },
            ].map(({ field, label, type, placeholder, required }) => (
              <div key={field}>
                <label className="block text-sm text-slate-300 mb-1.5">{label}{required && ' *'}</label>
                <input type={type} value={form[field]} required={required} placeholder={placeholder}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"/>
              </div>
            ))}

            {selectedRole === 'doctor' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Doctor Details</p>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Specialization</label>
                  <input type="text" value={form.specialization} placeholder="e.g. General Physician"
                    onChange={e => setForm(p=>({...p,specialization:e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"/>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Treatment Type</label>
                  <select value={form.treatmentType} onChange={e => setForm(p=>({...p,treatmentType:e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="allopathic">Allopathic</option>
                    <option value="homeopathic">Homeopathic</option>
                    <option value="herbal">Herbal</option>
                  </select>
                </div>
                <p className="text-slate-500 text-xs">⚠️ Doctor accounts need admin verification before appearing in listings.</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all mt-2">
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
