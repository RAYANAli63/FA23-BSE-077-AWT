import React, { useState } from 'react'
import { Eye, EyeOff, Copy, Check, X, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

/* ─── SPINNER ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 'sm', className = '' }) {
  const s = { xs: 'w-3 h-3 border', sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2', xl: 'w-12 h-12 border-2' }
  return (
    <div className={clsx('rounded-full border-surface-700 border-t-brand-400 animate-spin', s[size], className)} />
  )
}

/* ─── LOADING PAGE ───────────────────────────────────────────────────────── */
export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-2xl shadow-glow animate-bounce-sm">
          🗳️
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-surface-400 text-sm">{message}</span>
      </div>
    </div>
  )
}

/* ─── SKELETON ───────────────────────────────────────────────────────────── */
export function Skeleton({ className = '', h = 'h-4' }) {
  return <div className={clsx('skeleton', h, className)} />
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <Skeleton h="h-4" className="w-2/3" />
      <Skeleton h="h-3" className="w-full" />
      <Skeleton h="h-3" className="w-4/5" />
      <div className="flex gap-2 mt-4">
        <Skeleton h="h-8" className="flex-1 rounded-lg" />
        <Skeleton h="h-8" className="w-16 rounded-lg" />
      </div>
    </div>
  )
}

/* ─── BADGE ──────────────────────────────────────────────────────────────── */
export function Badge({ variant = 'draft', children, className = '' }) {
  return <span className={clsx(`badge badge-${variant}`, className)}>{children}</span>
}

/* ─── INPUT ──────────────────────────────────────────────────────────────── */
export function Input({ label, hint, error, className = '', icon, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">{icon}</div>}
        <input
          className={clsx('input', icon && 'pl-10', error && 'border-danger-500/50 focus:border-danger-500/70', className)}
          {...props}
        />
      </div>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

/* ─── PASSWORD INPUT ─────────────────────────────────────────────────────── */
export function PasswordInput({ label, hint, error, className = '', ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={clsx('input pr-11', error && 'border-danger-500/50', className)}
          {...props}
        />
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

/* ─── TEXTAREA ───────────────────────────────────────────────────────────── */
export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className={clsx('textarea', error && 'border-danger-500/50', className)} {...props} />
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

/* ─── SELECT ─────────────────────────────────────────────────────────────── */
export function Select({ label, hint, error, options = [], className = '', ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select className={clsx('select pr-9', className)} {...props}>
          {options.map(o => (
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
      </div>
      {hint && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

/* ─── COPY BUTTON ────────────────────────────────────────────────────────── */
export function CopyButton({ value, className = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} className={clsx('btn btn-ghost btn-xs gap-1', className)}>
      {copied ? <><Check size={11} className="text-success-400" /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  )
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = '' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={clsx('modal', size)} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-display text-surface-50">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon text-surface-400 hover:text-surface-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, message, action, actionLabel, className = '' }) {
  return (
    <div className={clsx('card text-center py-16 px-8', className)}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-surface-200 mb-2">{title}</h3>
      {message && <p className="text-surface-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">{message}</p>}
      {action && <button onClick={action} className="btn btn-primary">{actionLabel}</button>}
    </div>
  )
}

/* ─── STAT CARD ──────────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, color = 'brand', trend, onClick }) {
  const colors = {
    brand:   'from-brand-500/20 to-brand-500/5 border-brand-500/20 text-brand-400',
    success: 'from-success-500/20 to-success-500/5 border-success-500/20 text-success-400',
    danger:  'from-danger-500/20 to-danger-500/5 border-danger-500/20 text-danger-400',
    warning: 'from-warning-500/20 to-warning-500/5 border-warning-500/20 text-warning-400',
    violet:  'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400',
    cyan:    'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  }
  return (
    <div
      className={clsx('stat-card', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className={clsx('inline-flex w-11 h-11 items-center justify-center rounded-xl bg-gradient-to-br border mb-4 text-xl', colors[color])}>
        {icon}
      </div>
      <p className="text-3xl font-bold font-display text-surface-50 tabular-nums">{value}</p>
      <p className="text-surface-500 text-xs font-semibold uppercase tracking-widest mt-1.5">{label}</p>
      {trend && (
        <p className="text-xs text-success-400 mt-2">{trend}</p>
      )}
    </div>
  )
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action, actionLabel, actionIcon }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action} className="btn btn-primary btn-sm gap-2">
          {actionIcon}{actionLabel}
        </button>
      )}
    </div>
  )
}

/* ─── ALERT ──────────────────────────────────────────────────────────────── */
export function Alert({ type = 'info', children, className = '' }) {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '❌' }
  return (
    <div className={clsx(`alert alert-${type}`, className)}>
      <span className="text-base flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

/* ─── SESSION ID BADGE ───────────────────────────────────────────────────── */
export function SessionIdBadge({ sessionId, size = 'sm', showCopy = true }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={clsx('session-id', size === 'lg' && 'text-base px-4 py-2')}>{sessionId}</span>
      {showCopy && <CopyButton value={sessionId} />}
    </div>
  )
}

/* ─── COUNTDOWN TIMER ────────────────────────────────────────────────────── */
export function Countdown({ target, label, className = '' }) {
  const [t, setT] = React.useState({ d: 0, h: 0, m: 0, s: 0 })
  React.useEffect(() => {
    const calc = () => {
      const diff = new Date(target) - new Date()
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 })
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      })
    }
    calc()
    const i = setInterval(calc, 1000)
    return () => clearInterval(i)
  }, [target])

  return (
    <div className={clsx(className)}>
      {label && <p className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-2">{label}</p>}
      <div className="flex gap-2">
        {[['d','Days'],['h','Hrs'],['m','Min'],['s','Sec']].map(([k, lbl]) => (
          <div key={k} className="countdown-unit">
            <div className="countdown-num">{String(t[k]).padStart(2,'0')}</div>
            <div className="countdown-lbl">{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── PROGRESS BAR ───────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color = 'blue', showLabel = false, className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-surface-400 mb-1.5">
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
          <span className="font-semibold">{pct}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-fill progress-${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ─── QR SHARE ───────────────────────────────────────────────────────────── */
export function QRShare({ url, title }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <button onClick={() => setShow(p => !p)} className="btn btn-secondary btn-sm">
        {show ? '❌ Hide QR' : '📲 Share QR'}
      </button>
      {show && (
        <div className="mt-3 card-sm inline-block text-center animate-fade-in">
          {/* QRCodeSVG from qrcode.react */}
          <div className="bg-white rounded-xl p-3">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`}
              alt="QR Code" className="w-[140px] h-[140px]" />
          </div>
          {title && <p className="text-xs text-surface-500 mt-2">{title}</p>}
        </div>
      )}
    </div>
  )
}
