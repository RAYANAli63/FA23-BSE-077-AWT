import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await signUp({ email:form.email, password:form.password, fullName:form.fullName, phone:form.phone });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Account created! Please check your email to verify. 📧');
    navigate('/login');
  };

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div className="card">
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>✨</div>
            <h1 style={{ fontSize:'24px' }}>Create Account</h1>
            <p style={{ color:'var(--text2)', marginTop:'6px', fontSize:'14px' }}>Join VoteSecure and participate in elections</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" type="tel" placeholder="+92 3xx xxxxxxx" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text2)' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
