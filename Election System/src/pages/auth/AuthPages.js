import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

function AuthCard({ icon, title, subtitle, children }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse at top, rgba(79,142,247,0.05) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
            <h1 style={{ fontSize: '22px' }}>{title}</h1>
            <p style={{ color: 'var(--text2)', marginTop: '6px', fontSize: '14px' }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Welcome back! 👋');
    navigate('/');
  };

  return (
    <AuthCard icon="🗳️" title="Sign In" subtitle="Welcome back to VoteSecure">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '20px' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--text2)' }}>Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthCard>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await signUp(form);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Account created! You can now log in. ✅');
    navigate('/login');
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthCard icon="✨" title="Create Account" subtitle="Join VoteSecure today">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-control" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-control" placeholder="+92 3xx xxxxxxx" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input className="form-control" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating...</> : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) { toast.error(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <AuthCard icon="🔑" title="Reset Password" subtitle="Enter your email for a reset link">
      {sent ? (
        <div className="alert alert-success" style={{ textAlign: 'center' }}>
          ✅ Reset link sent! Check your email inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text2)' }}>
        <Link to="/login">← Back to login</Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Password updated! Please sign in.');
    navigate('/login');
  };

  return (
    <AuthCard icon="🔒" title="New Password" subtitle="Set your new password">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input className="form-control" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password" />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
