'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Notification from '@/components/Notification';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const role = res.data.role ? `${res.data.role.charAt(0).toUpperCase()}${res.data.role.slice(1).toLowerCase()}` : '';
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', role);
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20 min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to AdFlow Pro</h1>
        {error && <Notification message={error} type="error" />}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border px-3 py-2 rounded focus:outline-blue-500" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border px-3 py-2 rounded focus:outline-blue-500" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
