'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import ModeratorDashboard from '@/components/dashboards/ModeratorDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // In a real app we'd verify this with /api/auth/me to avoid simple localstorage tampering
    setRole(localStorage.getItem('role'));
  }, []);

  const normalizedRole = role ? role.toLowerCase() : '';

  return (
    <ProtectedRoute>
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar role={normalizedRole} />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">
            {normalizedRole === 'client' ? 'Client Area' : normalizedRole === 'moderator' ? 'Moderation Hub' : 'Admin Operations'}
          </h1>
          
          {normalizedRole === 'client' && <ClientDashboard />}
          {normalizedRole === 'moderator' && <ModeratorDashboard />}
          {normalizedRole === 'admin' && <AdminDashboard />}
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
