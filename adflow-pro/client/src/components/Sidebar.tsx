import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ role }: { role: string | null }) {
  const pathname = usePathname();
  const normalizedRole = role ? role.toLowerCase() : '';

  const links = [
    { name: 'Dashboard Home', href: '/dashboard', roles: ['client', 'moderator', 'admin'] },
    { name: 'Create Ad', href: '/dashboard/client/create-ad', roles: ['client'] },
    { name: 'My Profile', href: '/dashboard/profile', roles: ['client', 'moderator', 'admin'] },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:flex flex-col shadow-sm">
      <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-6">Menu</h2>
      <nav className="flex-1 space-y-2">
        {links.filter(link => !normalizedRole || link.roles.includes(normalizedRole)).map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`block py-2 px-4 rounded font-medium transition-colors ${
              pathname === link.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
