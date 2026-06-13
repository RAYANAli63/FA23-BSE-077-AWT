import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingPayments, verifyPayment } from '../../services/api';
import toast from 'react-hot-toast';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data } = await getPendingPayments();
      setPayments(data.payments || []);
    } catch {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    setProcessing(id);
    try {
      await verifyPayment(id, { action: 'verify' });
      toast.success('Payment verified! Appointment confirmed.');
      setPayments(prev => prev.filter(p => p._id !== id));
    } catch {
      toast.error('Verification failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setProcessing(showRejectModal);
    try {
      await verifyPayment(showRejectModal, { action: 'reject', rejectionReason: rejectReason });
      toast.success('Payment rejected.');
      setPayments(prev => prev.filter(p => p._id !== showRejectModal));
      setShowRejectModal(null);
      setRejectReason('');
    } catch {
      toast.error('Failed to reject.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Assistant Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome, <span className="text-teal-400">{user?.name}</span> · Verify payments to confirm appointments</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-2xl font-bold text-amber-400">{loading ? '—' : payments.length}</p>
            <p className="text-slate-400 text-xs mt-1">Pending Verifications</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-2xl font-bold text-teal-400">—</p>
            <p className="text-slate-400 text-xs mt-1">Verified Today</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-2xl font-bold text-red-400">—</p>
            <p className="text-slate-400 text-xs mt-1">Rejected Today</p>
          </div>
        </div>

        {/* Payments list */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Pending Payment Verifications</h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-slate-400">No pending payments. All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment._id} className="bg-slate-800 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold text-sm">
                          {payment.patient?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{payment.patient?.name}</p>
                          <p className="text-slate-400 text-xs">{payment.patient?.phone}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                        <div>
                          <p className="text-slate-500">Amount</p>
                          <p className="text-white font-medium">Rs. {payment.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Method</p>
                          <p className="text-white font-medium capitalize">{payment.method}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Transaction ID</p>
                          <p className="text-white font-medium">{payment.transactionId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Submitted</p>
                          <p className="text-white font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {payment.screenshot && (
                        <a
                          href={`http://localhost:5000/${payment.screenshot}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-teal-400 hover:text-teal-300 text-xs"
                        >
                          📎 View Screenshot
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleVerify(payment._id)}
                        disabled={processing === payment._id}
                        className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        {processing === payment._id ? '...' : '✓ Verify'}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(payment._id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-white mb-4">Reject Payment</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleReject} disabled={processing} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm">
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantDashboard;
