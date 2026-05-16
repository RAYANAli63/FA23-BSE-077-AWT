import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
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
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div className="card">
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🗳️</div>
            <h1 style={{ fontSize:'24px' }}>Welcome Back</h1>
            <p style={{ color:'var(--text2)', marginTop:'6px', fontSize:'14px' }}>Sign in to your VoteSecure account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
            </div>
            <div style={{ textAlign:'right', marginTop:'-12px', marginBottom:'20px' }}>
              <Link to="/forgot-password" style={{ fontSize:'13px', color:'var(--text2)' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text2)' }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
