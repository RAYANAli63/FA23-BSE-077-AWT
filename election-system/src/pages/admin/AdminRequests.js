import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { AdminSidebar } from './AdminDashboard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejReason, setRejReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const { data } = await supabase
      .from('creator_requests')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  async function handleAction(req, action) {
    setProcessing(true);
    try {
      await supabase.from('creator_requests').update({
        status: action,
        rejection_reason: action === 'rejected' ? rejReason : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      }).eq('id', req.id);

      if (action === 'approved') {
        await supabase.from('profiles').update({ role: 'election_creator' }).eq('id', req.user_id);
      }

      await supabase.from('audit_logs').insert({
        actor_id: user.id, action: `request_${action}`,
        entity_type: 'creator_request', entity_id: req.id,
        details: { user_id: req.user_id, action }
      });

      toast.success(`Request ${action} successfully`);
      setSelected(null);
      setRejReason('');
      loadRequests();
    } catch (err) {
      toast.error(err.message);
    }
    setProcessing(false);
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Creator Requests</h1>
          <p>Review and approve election creator applications</p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Organization</th>
                    <th>Purpose</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight:500 }}>{r.profiles?.full_name}</div>
                        <div style={{ fontSize:'12px', color:'var(--text2)' }}>{r.email}</div>
                      </td>
                      <td>{r.organization}</td>
                      <td style={{ maxWidth:'200px' }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'13px', color:'var(--text2)' }}>
                          {r.purpose}
                        </div>
                      </td>
                      <td style={{ fontSize:'12px', color:'var(--text2)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'pending' ? (
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleAction(r, 'approved')} disabled={processing}>
                              ✓ Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setSelected(r)} disabled={processing}>
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize:'12px', color:'var(--text2)' }}>
                            {r.status === 'approved' ? '✅' : '❌'} {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text2)', padding:'32px' }}>No requests yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {selected && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'16px' }}>
            <div className="card" style={{ width:'100%', maxWidth:'440px' }}>
              <h3 style={{ marginBottom:'16px' }}>Reject Request</h3>
              <p style={{ color:'var(--text2)', marginBottom:'16px', fontSize:'14px' }}>
                Rejecting request from <strong>{selected.profiles?.full_name}</strong>. Please provide a reason:
              </p>
              <textarea className="form-control" rows={4} value={rejReason}
                onChange={e => setRejReason(e.target.value)} placeholder="Reason for rejection..." />
              <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
                <button onClick={() => { setSelected(null); setRejReason(''); }} className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
                <button onClick={() => handleAction(selected, 'rejected')} className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} disabled={processing || !rejReason}>
                  {processing ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
