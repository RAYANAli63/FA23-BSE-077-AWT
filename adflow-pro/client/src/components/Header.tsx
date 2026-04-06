'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLogged(true);
      setRole(localStorage.getItem('role'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-400">
          AdFlow Pro
        </Link>
        <nav className="space-x-6 flex items-center">
          <Link href="/explore" className="hover:text-blue-300 transition-colors">Explore</Link>
          
          {isLogged ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">
                Dashboard ({role})
              </Link>
              <button onClick={handleLogout} className="hover:text-red-400 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-300 transition-colors">Login</Link>
              <Link href="/register" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
