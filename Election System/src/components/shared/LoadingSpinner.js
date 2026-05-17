import React from 'react';

export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading...</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );
}
