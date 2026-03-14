import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import api from '@/lib/axios'
import { useToast } from '@/App'
import { cn, passwordStrength } from '@/lib/utils'

const STRENGTH_CONFIG = [
  { label: 'Weak',   color: 'bg-accent-red',   textColor: 'text-accent-red' },
  { label: 'Fair',   color: 'bg-accent-amber',  textColor: 'text-accent-amber' },
  { label: 'Good',   color: 'bg-blue-400',      textColor: 'text-blue-400' },
  { label: 'Strong', color: 'bg-brand',         textColor: 'text-brand' },
]

export default function RegisterForm({ onSuccess }) {
  const [form, setForm]       = useState({ username: '', email: '', password: '', role: 'user' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const showToast = useToast()

  const strength = form.password ? passwordStrength(form.password) : -1
  const strengthInfo = strength >= 0 ? STRENGTH_CONFIG[strength] : null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) return
    setLoading(true)
    setError('')
    try {
      await api.post('/register', form)
      showToast({
        title: 'Account created!',
        description: 'You can now log in with your credentials.',
        variant: 'success',
      })
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Username */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Username</label>
        <input
          value={form.username}
          onChange={set('username')}
          placeholder="johndoe"
          className="input-field"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            placeholder="Min. 8 characters"
            className="input-field pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Strength bar */}
        {form.password && strengthInfo && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {STRENGTH_CONFIG.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i <= strength ? s.color : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <p className={cn('text-xs font-mono', strengthInfo.textColor)}>
              {strengthInfo.label} password
            </p>
          </div>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Role</label>
        <select
          value={form.role}
          onChange={set('role')}
          className="input-field"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-accent-red font-body"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={handleSubmit}
        disabled={loading || !form.username || !form.email || !form.password}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </div>
  )
}
