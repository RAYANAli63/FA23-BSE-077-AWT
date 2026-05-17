import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

function AuthCard({ icon, title, subtitle, children, wide }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse at top, rgba(79,142,247,0.07) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: wide ? '500px' : '420px' }}>
        <div className="card fade-in" style={{ boxShadow: 'var(--shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 14px', boxShadow: 'var(--shadow2)' }}>{icon}</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{title}</h1>
            <p style={{ color: 'var(--text2)', marginTop: '6px', fontSize: '14px' }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-control" {...props} />
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signIn(form);
    if (error) { toast.error(error.message); setLoading(false); return; }
    // Generate session user ID
    const sessionId = data?.user ? `VS-${data.user.id.slice(0, 8).toUpperCase()}` : null;
    toast.success(`Welcome back! 👋${sessionId ? ` Your Session ID: ${sessionId}` : ''}`, { autoClose: 5000 });
    navigate('/');
  };

  return (
    <AuthCard icon="🗳️" title="Sign In to VoteSecure" subtitle="Secure elections, trusted results">
      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required style={{ paddingRight: '44px' }} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '16px' }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '20px' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--text2)' }}>Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
        </button>
      </form>
      <div className="divider" />
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)' }}>
        New here? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
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
    toast.success('Account created! Please sign in. ✅');
    navigate('/login');
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthCard icon="✨" title="Create Account" subtitle="Join VoteSecure today" wide>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: '16px' }}>
          <Input label="Full Name *" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
          <Input label="Phone Number" placeholder="+92 3xx xxxxxxx" value={form.phone} onChange={set('phone')} />
        </div>
        <Input label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <div className="grid-2" style={{ gap: '16px' }}>
          <Input label="Password *" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
          <Input label="Confirm Password *" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
        </div>
        <div className="alert alert-info" style={{ fontSize: '13px', marginBottom: '20px' }}>
          🔑 After registration, each login session generates a unique <strong>User ID</strong> shown in your profile menu.
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
        </button>
      </form>
      <div className="divider" />
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
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
    <AuthCard icon="🔑" title="Reset Password" subtitle="Enter your email to receive a reset link">
      {sent ? (
        <div className="alert alert-success" style={{ textAlign: 'center', justifyContent: 'center', padding: '20px' }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
            <p style={{ fontWeight: 600 }}>Reset link sent!</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Check your email inbox and click the link.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link →'}
          </button>
        </form>
      )}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
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
    <AuthCard icon="🔒" title="Set New Password" subtitle="Choose a strong password">
      <form onSubmit={handleSubmit}>
        <Input label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" />
        <Input label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password" />
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password →'}
        </button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
