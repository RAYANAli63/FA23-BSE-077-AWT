'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [publishQueue, setPublishQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      const [resPay, resPub] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/publish-queue')
      ]);
      setPayments(resPay.data);
      setPublishQueue(resPub.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleVerify = async (id: string, action: 'verify' | 'reject') => {
    try {
      await api.put(`/admin/payments/${id}/verify`, { action });
      alert(`Payment ${action}d successfully`);
      fetchQueues();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handlePublish = async (id: string) => {
    // Admin can choose to input a date or just submit empty to publish right now.
    const dateInput = prompt('Enter a future date to schedule (YYYY-MM-DD HH:MM), or leave blank to publish immediately:');
    let publish_at = null;
    
    if (dateInput) {
      const parsed = new Date(dateInput);
      if (isNaN(parsed.getTime())) {
        alert('Invalid date format');
        return;
      }
      publish_at = parsed.toISOString();
    }

    try {
      await api.put(`/admin/publish/${id}`, { publish_at });
      alert(publish_at ? 'Ad scheduled successfully' : 'Ad published immediately');
      fetchQueues();
    } catch (err) {
      alert('Publish failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Verification Queue */}
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Payment Verifications</h2>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {payments.map((p: any) => (
              <div key={p._id} className="border p-4 rounded text-sm">
                <p><strong>Ad:</strong> {p.ad?.title}</p>
                <p><strong>User:</strong> {p.user?.name} ({p.user?.email})</p>
                <p><strong>Amount:</strong> ${p.amount}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleVerify(p._id, 'verify')} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Verify</button>
                  <button onClick={() => handleVerify(p._id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-gray-500">No pending payments.</p>}
          </div>
        )}
      </div>

      {/* Publishing Queue */}
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Publishing Queue</h2>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {publishQueue.map((ad: any) => (
              <div key={ad._id} className="border p-4 rounded text-sm flex justify-between items-center">
                <div>
                  <p className="font-bold">{ad.title}</p>
                  <p className="text-gray-500">Package: {ad.package}</p>
                </div>
                <button onClick={() => handlePublish(ad._id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Publish / Schedule
                </button>
              </div>
            ))}
            {publishQueue.length === 0 && <p className="text-gray-500">No ads ready to publish.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
