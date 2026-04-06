'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      router.push('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      router.push('/explore'); // Or unauthorized page
      return;
    }

    setIsAuthorized(true);
  }, [allowedRoles, router]);

  if (!isAuthorized) {
    return <div className="py-20 text-center">Checking authorization...</div>;
  }

  return <>{children}</>;
}
