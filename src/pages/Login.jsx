import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Lock, Mail } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/dreamland-logo.png"
            alt="Dreamland"
            className="w-20 object-contain mb-3"
          />
          <h1 className="font-serif text-brand-gold text-2xl font-bold">Dreamland</h1>
          <p className="text-brand-muted text-xs tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-brand-text text-lg font-semibold">Sign in</h2>
            <p className="text-brand-muted text-sm mt-0.5">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@dreamland.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-9 w-full"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-9 w-full"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-brand-error text-sm bg-brand-error/10 border border-brand-error/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-gold text-brand-bg rounded-xl text-sm font-semibold hover:bg-brand-gold-light disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-muted text-xs mt-6">
          © 2026 Dreamland Hotels · Premium Hospitality
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}
