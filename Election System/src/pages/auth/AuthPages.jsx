import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Shield, Zap, Users, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Input, PasswordInput, Spinner } from '../../components/ui/index.jsx'

function AuthShell({ children, title, subtitle, sideFeatures }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - features panel (desktop only) */}
      {sideFeatures && (
        <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-12 border-r border-surface-800/60 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-sm">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xl shadow-glow">🗳️</div>
              <span className="font-display font-bold text-xl">VoteSecure <span className="gradient-text-blue">Pro</span></span>
            </div>
            <h2 className="font-display font-bold text-3xl text-surface-100 mb-4 leading-tight">
              Enterprise-Grade<br />Election Platform
            </h2>
            <p className="text-surface-400 text-sm mb-10 leading-relaxed">
              Trusted by organizations for secure, transparent, and anonymous online elections.
            </p>
            <div className="space-y-4">
              {[
                { icon: <Shield size={16} />, text: 'Bank-grade security & encryption' },
                { icon: <Zap size={16} />, text: 'Real-time vote counting & results' },
                { icon: <Users size={16} />, text: 'Smart voter management system' },
                { icon: <CheckCircle size={16} />, text: 'Complete audit trail & transparency' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">{f.icon}</div>
                  <span className="text-surface-300 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right side - form */}
      <div className="flex flex-col justify-center flex-1 px-4 sm:px-8 md:px-16 py-12 max-w-lg lg:max-w-xl mx-auto w-full">
        <div className="animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-base">🗳️</div>
            <span className="font-display font-bold text-base">VoteSecure Pro</span>
          </div>
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-surface-50 mb-2">{title}</h1>
            <p className="text-surface-400 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── LOGIN ──────────────────────────────────────────────────────────────── */
export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { signIn, sessionId } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await signIn(form)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    const sid = data?.user ? `VS-${data.user.id.slice(0,8).toUpperCase()}` : null
    toast.success(`Welcome back! 👋 Session ID: ${sid}`, { duration: 6000 })
    navigate('/')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your VoteSecure account" sideFeatures>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Email Address" type="email" placeholder="you@example.com"
          value={form.email} onChange={set('email')} required
          icon={<span className="text-xs">✉️</span>} />
        <div>
          <PasswordInput label="Password" placeholder="Your password"
            value={form.password} onChange={set('password')} required />
          <div className="flex justify-end mt-2">
            <Link to="/forgot-password" className="text-xs text-surface-500 hover:text-brand-400 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="bg-brand-500/8 border border-brand-500/15 rounded-xl p-3">
          <p className="text-xs text-surface-400">🔑 After login, a unique <span className="text-brand-400 font-semibold">Session ID</span> is generated and displayed in your profile menu.</p>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><Spinner size="sm" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-surface-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-300">Create one free</Link>
        </p>
      </div>
    </AuthShell>
  )
}

/* ─── REGISTER ───────────────────────────────────────────────────────────── */
export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await signUp(form)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Account created! Please check your email and sign in. ✅', { duration: 7000 })
    navigate('/login')
  }

  return (
    <AuthShell title="Create your account" subtitle="Join VoteSecure and start participating in democracy" sideFeatures>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Input label="Full Name *" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input label="Phone Number" placeholder="+92 3xx xxxxxxx" value={form.phone} onChange={set('phone')} />
          </div>
        </div>
        <Input label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <div className="grid grid-cols-2 gap-4">
          <PasswordInput label="Password *" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
          <PasswordInput label="Confirm Password *" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
        </div>

        <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-4">
          <p className="text-xs text-surface-400 leading-relaxed">
            🔐 By registering, each time you sign in you'll receive a unique <strong className="text-surface-200">Session User ID</strong> (e.g. VS-A1B2C3D4). This is used to identify your votes while keeping your personal information private.
          </p>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><Spinner size="sm" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </form>
      <p className="text-center text-surface-500 text-sm mt-6">
        Already have an account? <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300">Sign in</Link>
      </p>
    </AuthShell>
  )
}

/* ─── FORGOT PASSWORD ────────────────────────────────────────────────────── */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter your email to receive a reset link">
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-success-500/15 border border-success-500/20 flex items-center justify-center text-3xl mx-auto mb-4">📬</div>
          <h3 className="font-bold text-lg mb-2">Check your email</h3>
          <p className="text-surface-400 text-sm mb-6">We sent a reset link to <strong className="text-surface-200">{email}</strong></p>
          <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Sending...</> : 'Send Reset Link →'}
          </button>
          <p className="text-center">
            <Link to="/login" className="text-surface-500 text-sm hover:text-brand-400">← Back to login</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}

/* ─── RESET PASSWORD ─────────────────────────────────────────────────────── */
export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Password updated! Please sign in.')
    navigate('/login')
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput label="New Password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        <PasswordInput label="Confirm New Password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password →'}
        </button>
      </form>
    </AuthShell>
  )
}
