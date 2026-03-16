import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, LogIn, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '@/lib/axios'
import useAuthStore from '@/store/authStore'
import { useToast } from '@/App'
import { cn } from '@/lib/utils'

const DEMO_CREDS = [
  { label: 'Admin',     email: 'admin@demo.com', password: 'Admin1234!', role: 'admin' },
  { label: 'Moderator', email: 'mod@demo.com',   password: 'Mod1234!',   role: 'moderator' },
  { label: 'User',      email: 'user@demo.com',  password: 'User1234!',  role: 'user' },
]

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuthStore()
  const showToast = useToast()
  const navigate  = useNavigate()

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/login', { email, password })
      const expiry = Date.now() + 30 * 60 * 1000 // 30 minutes
      setAuthToken(data.access_token)
      login(data.user, data.access_token, expiry)
      showToast({ title: 'Welcome back!', description: `Logged in as ${data.user.username}`, variant: 'success' })
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.detail || 'Login failed'
      setError(msg)
      triggerShake()

      if (status === 423) {
        showToast({ title: 'Account locked', description: msg, variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (cred) => {
    setEmail(cred.email)
    setPassword(cred.password)
    setError('')
  }

  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-4"
      role="form"
      aria-label="Login form"
    >
      {/* Demo credentials */}
      <div className="grid grid-cols-3 gap-2">
        {DEMO_CREDS.map((c) => (
          <button
            key={c.role}
            onClick={() => fillDemo(c)}
            className={cn(
              'flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-mono transition-all',
              c.role === 'admin'     ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' :
              c.role === 'moderator' ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' :
                                       'border-brand/30 text-brand hover:bg-brand/10'
            )}
          >
            <Zap size={10} />
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-xs text-slate-600 font-mono">or enter manually</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={cn('input-field', error && 'border-accent-red/50')}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn('input-field pr-10', error && 'border-accent-red/50')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
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
        disabled={loading || !email || !password}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </motion.div>
  )
}
