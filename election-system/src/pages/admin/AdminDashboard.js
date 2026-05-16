import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function Sidebar() {
  const location = useLocation();
  const links = [
    { to:'/admin', label:'📊 Dashboard', exact: true },
    { to:'/admin/requests', label:'📋 Creator Requests' },
    { to:'/admin/elections', label:'🗳️ Elections' },
    { to:'/admin/users', label:'👥 Users' },
    { to:'/admin/audit', label:'🔍 Audit Logs' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-section">Admin Panel</div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${(l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to)) ? 'active' : ''}`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export { Sidebar as AdminSidebar };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ elections:0, active:0, users:0, pending:0, votes:0 });

  useEffect(() => {
    async function load() {
      const [{ count: elCount }, { count: activeCount }, { count: userCount }, { count: pendingCount }] = await Promise.all([
        supabase.from('elections').select('*', { count:'exact', head:true }),
        supabase.from('elections').select('*', { count:'exact', head:true }).eq('status','active'),
        supabase.from('profiles').select('*', { count:'exact', head:true }),
        supabase.from('creator_requests').select('*', { count:'exact', head:true }).eq('status','pending'),
      ]);
      setStats({ elections: elCount||0, active: activeCount||0, users: userCount||0, pending: pendingCount||0 });
    }
    load();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>

        <div className="grid-4" style={{ marginBottom:'32px' }}>
          <div className="stat-card"><div className="stat-value">{stats.elections}</div><div className="stat-label">Total Elections</div></div>
          <div className="stat-card" style={{ borderColor:'rgba(255,71,87,0.2)' }}><div className="stat-value" style={{ color:'var(--danger)' }}>{stats.active}</div><div className="stat-label">Active Now</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color:'var(--accent2)' }}>{stats.users}</div><div className="stat-label">Registered Users</div></div>
          <div className="stat-card" style={{ borderColor:'rgba(255,179,0,0.2)' }}><div className="stat-value" style={{ color:'var(--warning)' }}>{stats.pending}</div><div className="stat-label">Pending Requests</div></div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom:'12px' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <Link to="/admin/requests" className="btn btn-outline" style={{ justifyContent:'space-between' }}>
                Review Creator Requests <span className="badge badge-pending">{stats.pending} pending</span>
              </Link>
              <Link to="/admin/elections" className="btn btn-outline" style={{ justifyContent:'space-between' }}>
                Manage Elections →
              </Link>
              <Link to="/admin/audit" className="btn btn-outline" style={{ justifyContent:'space-between' }}>
                View Audit Logs →
              </Link>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom:'12px' }}>System Status</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', fontSize:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'var(--text2)' }}>Database</span>
                <span className="badge badge-active">● Online</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'var(--text2)' }}>Auth Service</span>
                <span className="badge badge-active">● Online</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'var(--text2)' }}>RLS Policies</span>
                <span className="badge badge-active">● Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
