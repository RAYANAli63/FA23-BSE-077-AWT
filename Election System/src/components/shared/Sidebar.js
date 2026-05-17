import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const adminLinks = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/requests', icon: '📝', label: 'Creator Requests' },
  { to: '/admin/elections', icon: '🗳️', label: 'Elections' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/audit', icon: '📋', label: 'Audit Logs' },
];

export const creatorLinks = [
  { to: '/creator', icon: '📊', label: 'My Elections' },
  { to: '/creator/new', icon: '➕', label: 'Create Election' },
];

export function Sidebar({ links, title, mobileOpen, onClose }) {
  const { pathname } = useLocation();
  return (
    <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', fontWeight: 600 }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '6px 0' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`sidebar-link${pathname === l.to ? ' active' : ''}`}
            onClick={onClose}>
            <span className="icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
