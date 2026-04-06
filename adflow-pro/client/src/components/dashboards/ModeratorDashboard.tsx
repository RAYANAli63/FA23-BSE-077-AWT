'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ModeratorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/moderator/queue');
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    let reject_reason = '';
    if (action === 'reject') {
      reject_reason = prompt('Reason for rejection:') || 'Violation of terms';
    }

    try {
      await api.put(`/moderator/${id}/review`, { action, reject_reason });
      alert(`Ad ${action}d successfully`);
      fetchQueue();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
       <h2 className="text-xl font-bold mb-4">Moderator Review Queue</h2>
       {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {queue.map((ad: any) => (
              <div key={ad._id} className="border p-4 rounded flex flex-col md:flex-row justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold">{ad.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{ad.description}</p>
                  <p className="text-xs text-gray-400 mt-1">By: {ad.user?.name} | Category: {ad.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReview(ad._id, 'approve')} className="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => handleReview(ad._id, 'reject')} className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700">Reject</button>
                </div>
              </div>
            ))}
            {queue.length === 0 && <p className="text-gray-500">No ads are currently under review.</p>}
          </div>
       )}
    </div>
  );
}
