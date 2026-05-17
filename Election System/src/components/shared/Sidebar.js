import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ links, title }) {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-section">{title}</div>
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className={`sidebar-link ${(l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to) && l.to !== '/') ? 'active' : ''}`}
        >
          <span className="icon">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/requests', label: 'Creator Requests', icon: '📋' },
  { to: '/admin/elections', label: 'All Elections', icon: '🗳️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/audit', label: 'Audit Logs', icon: '🔍' },
];

export const creatorLinks = [
  { to: '/creator', label: 'My Elections', icon: '📊', exact: true },
  { to: '/creator/new', label: 'New Election', icon: '➕' },
];
