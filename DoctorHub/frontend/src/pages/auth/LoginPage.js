import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_DASHBOARD = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/superadmin/dashboard',
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await login(form.email, form.password);
      toast.success(`Welcome back, ${profile?.name}!`);
      navigate(ROLE_DASHBOARD[profile?.role] || '/');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      patient:     { email: 'patient@doctorhub.com',     password: 'password123' },
      doctor:      { email: 'dr.ahmad@doctorhub.com',    password: 'password123' },
      assistant:   { email: 'assistant@doctorhub.com',   password: 'password123' },
      admin:       { email: 'admin@doctorhub.com',       password: 'password123' },
      super_admin: { email: 'superadmin@doctorhub.com',  password: 'password123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">DH</span>
            </div>
            <span className="font-display font-bold text-white text-xl">Doctor Hub</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8">
          <div className="mb-6">
            <p className="text-slate-500 text-xs mb-2 text-center">Quick Demo Login</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['patient', 'doctor', 'assistant', 'admin', 'super_admin'].map(role => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition-colors border border-slate-600">
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
