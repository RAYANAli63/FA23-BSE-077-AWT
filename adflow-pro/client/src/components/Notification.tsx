import React from 'react';

export default function Notification({ message, type = 'info' }: { message: string, type?: 'info' | 'success' | 'error' }) {
  const bgColors = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700'
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColors[type]}`} role="alert">
      <p>{message}</p>
    </div>
  );
}
