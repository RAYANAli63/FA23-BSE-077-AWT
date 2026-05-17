import React from 'react';

export default function LoadingSpinner({ fullPage, message = 'Loading...' }) {
  if (fullPage) return (
    <div className="loading-fullpage">
      <div className="loading-spinner-lg" />
      <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{message}</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div className="loading-spinner-lg" />
    </div>
  );
}
