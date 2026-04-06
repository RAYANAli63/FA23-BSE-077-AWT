'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Notification from '@/components/Notification';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20 min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        {error && <Notification message={error} type="error" />}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text" 
              className="w-full border px-3 py-2 rounded focus:outline-blue-500" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Role</label>
            <select className="w-full border px-3 py-2 rounded focus:outline-blue-500" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Client">Client</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
