import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

export const adminLinks = [
  { to: '/admin',          icon: '📊', label: 'Dashboard' },
  { to: '/admin/requests', icon: '📝', label: 'Creator Requests' },
  { to: '/admin/elections',icon: '🗳️', label: 'All Elections' },
  { to: '/admin/users',    icon: '👥', label: 'Users' },
  { to: '/admin/audit',    icon: '📋', label: 'Audit Logs' },
]

export const creatorLinks = [
  { to: '/creator',        icon: '📊', label: 'My Elections' },
  { to: '/creator/new',    icon: '➕', label: 'Create Election' },
]

export const voterLinks = [
  { to: '/voter',          icon: '🏠', label: 'Dashboard' },
  { to: '/',               icon: '🗳️', label: 'Browse Elections' },
]

export default function Sidebar({ links = [], title = '', open = false, onClose }) {
  const { pathname } = useLocation()

  const isActive = (to) => {
    if (to === '/admin' || to === '/creator' || to === '/voter') return pathname === to
    return pathname.startsWith(to)
  }

  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-800/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-600">{title}</p>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon text-surface-500 lg:hidden">
          <X size={16} />
        </button>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}
            onClick={onClose}>
            <span className="text-base w-5 text-center flex-shrink-0">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-800/60">
        <p className="text-[10px] text-surface-700 text-center">VoteSecure Pro v3.0</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-surface-950/80 border-r border-surface-800/60 sticky top-16 h-[calc(100vh-4rem)] backdrop-blur-xl">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-950 border-r border-surface-800 z-50 flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
