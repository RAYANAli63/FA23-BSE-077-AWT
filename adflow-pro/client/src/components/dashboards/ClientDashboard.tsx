'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Notification from '@/components/Notification';

type Ad = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  package_type?: string;
  status: string;
  reject_reason?: string;
  created_at?: string;
};

export default function ClientDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAds = async () => {
    try {
      const { data } = await api.get('/ads/me');
      setAds(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load your ads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const submitToReview = async (id: string) => {
    try {
      await api.put(`/ads/${id}/submit`);
      setError('');
      fetchAds();
    } catch (err) {
      console.error(err);
      setError('Failed to submit ad for review.');
    }
  };

  const simulatePayment = async (id: string) => {
    try {
      await api.put(`/ads/${id}/pay`);
      setError('');
      fetchAds();
    } catch (err) {
      console.error(err);
      setError('Payment action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold">My Ads</h2>
          <p className="text-sm text-gray-500">Create, review and manage your ad drafts.</p>
        </div>
        <Link href="/dashboard/client/create-ad" className="inline-flex items-center justify-center rounded bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Create Ad
        </Link>
      </div>

      {error && <Notification message={error} type="error" />}

      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        {loading ? (
          <p>Loading your ads...</p>
        ) : ads.length === 0 ? (
          <p className="text-gray-500">You haven't created any ads yet. Use the Create Ad button to get started.</p>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{ad.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{ad.description}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Category: <span className="font-medium text-gray-800">{ad.category}</span> | City: <span className="font-medium text-gray-800">{ad.city}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Package: <span className="font-medium text-gray-800">{ad.package_type || 'Basic'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-blue-600">{ad.status?.toUpperCase()}</p>
                  </div>
                </div>
                {ad.reject_reason && (
                  <p className="mt-3 text-sm text-red-600">Rejected reason: {ad.reject_reason}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {['draft', 'rejected'].includes(ad.status.toLowerCase()) && (
                    <button onClick={() => submitToReview(ad.id)} className="rounded bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600">
                      Submit to Review
                    </button>
                  )}
                  {ad.status.toLowerCase() === 'payment_pending' && (
                    <button onClick={() => simulatePayment(ad.id)} className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                      Simulate Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
