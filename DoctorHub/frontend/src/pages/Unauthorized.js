import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
    <div className="text-center">
      <p className="text-7xl mb-4">🚫</p>
      <h1 className="font-display text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-slate-400 mb-8">You don't have permission to access this page.</p>
      <Link to="/" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl transition-colors">
        Go Home
      </Link>
    </div>
  </div>
);

export default Unauthorized;
