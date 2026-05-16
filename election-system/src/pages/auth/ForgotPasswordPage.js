import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

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
    toast.success('Password reset email sent!');
  };

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>
        <div className="card">
          <div style={{ textAlign:'center', marginBottom:'24px' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔑</div>
            <h1 style={{ fontSize:'22px' }}>Reset Password</h1>
            <p style={{ color:'var(--text2)', marginTop:'6px', fontSize:'14px' }}>Enter your email to receive a reset link</p>
          </div>
          {sent ? (
            <div className="alert alert-success" style={{ textAlign:'center' }}>
              ✅ Check your email for the reset link!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p style={{ textAlign:'center', marginTop:'16px', fontSize:'14px', color:'var(--text2)' }}>
            <Link to="/login">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
