import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Shield, Key, Lock, ArrowRight, Copy, Check, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

// Animated counter
function Counter({ target, suffix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef()
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = Date.now()
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target])

  return <span ref={ref}>{value}{suffix}</span>
}

// Copy-to-clipboard button
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={handle} className="text-slate-500 hover:text-brand transition-colors p-1">
      {copied ? <Check size={12} className="text-brand" /> : <Copy size={12} />}
    </button>
  )
}

const FEATURES = [
  {
    icon: Shield,
    title: 'bcrypt Hashing',
    subtitle: 'Password Security',
    body: 'Passwords are hashed with bcrypt at cost factor 12 — over 4,000 rounds of key derivation. One-way transformation means even database compromise cannot reveal plaintext passwords.',
    accent: 'text-brand',
    bg: 'bg-brand/5',
    border: 'border-brand/20',
  },
  {
    icon: Key,
    title: 'Signed Tokens',
    subtitle: 'JWT Authentication',
    body: 'Tokens carry a 3-part structure (header.payload.signature) signed with HMAC-SHA256. Stateless verification — no DB lookup required. 30-minute access tokens with 7-day refresh.',
    accent: 'text-purple-400',
    bg: 'bg-purple-400/5',
    border: 'border-purple-400/20',
  },
  {
    icon: Lock,
    title: 'RBAC',
    subtitle: 'Role-Based Access',
    body: 'Three roles: admin, moderator, user — each embedded in the JWT payload. Route-level enforcement rejects requests with insufficient privileges with a clear 403 response.',
    accent: 'text-accent-amber',
    bg: 'bg-accent-amber/5',
    border: 'border-accent-amber/20',
  },
]

const FLOW_STEPS = [
  { label: 'User',             desc: 'Enters credentials' },
  { label: 'Register/Login',   desc: 'POST /login' },
  { label: 'bcrypt',           desc: 'Verify hash' },
  { label: 'JWT Issued',       desc: 'Sign token' },
  { label: 'Request',          desc: 'Bearer header' },
  { label: 'Verify Sig',       desc: 'HMAC check' },
  { label: 'Check Role',       desc: 'RBAC guard' },
  { label: 'Response',         desc: '200 / 401 / 403' },
]

const DEMO_USERS = [
  { role: 'admin',     email: 'admin@demo.com', password: 'Admin1234!',
    color: 'border-purple-500/30 bg-purple-500/5', badge: 'badge-admin', label: 'Admin' },
  { role: 'moderator', email: 'mod@demo.com',   password: 'Mod1234!',
    color: 'border-amber-500/30 bg-amber-500/5', badge: 'badge-moderator', label: 'Moderator' },
  { role: 'user',      email: 'user@demo.com',  password: 'User1234!',
    color: 'border-brand/30 bg-brand/5', badge: 'badge-user', label: 'User' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-slate-200">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-1 absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand/5 blur-3xl" />
          <div className="orb-2 absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="orb-3 absolute top-2/3 left-1/2 w-48 h-48 rounded-full bg-accent-amber/4 blur-3xl" />
          <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono text-brand">University Deeptech Project</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-7xl md:text-8xl text-white mb-4 leading-none tracking-tight"
          >
            Auth<span className="text-gradient">Core</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-24 h-1 rounded-full bg-brand mx-auto mb-8 origin-left"
            style={{ boxShadow: '0 0 20px rgba(0,245,196,0.6)' }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 font-body max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A production-grade authentication server with JWT, bcrypt, RBAC, and token blacklisting — built end-to-end with FastAPI and React.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-16"
          >
            <Link to="/demo" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              View Demo <ArrowRight size={16} />
            </Link>
            <Link to="/auth" className="btn-ghost flex items-center gap-2 text-base px-6 py-3">
              Login / Register <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-10 flex-wrap"
          >
            {[
              { val: 3, label: 'Demo Users', suffix: '' },
              { val: 11, label: 'API Endpoints', suffix: '' },
              { val: 12, label: 'bcrypt Rounds', suffix: '' },
            ].map(({ val, label, suffix }) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-3xl text-brand">
                  <Counter target={val} suffix={suffix} />
                </div>
                <div className="text-xs text-slate-500 font-body mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-6 bg-mesh">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-brand mb-3">SECURITY ARCHITECTURE</p>
            <h2 className="section-title">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`rounded-2xl border ${f.border} ${f.bg} p-6 cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={f.accent} />
                  </div>
                  <p className={`text-xs font-mono ${f.accent} mb-1`}>{f.subtitle}</p>
                  <h3 className="font-display font-bold text-xl text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-400 font-body leading-relaxed">{f.body}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE FLOW ────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-brand mb-3">REQUEST LIFECYCLE</p>
            <h2 className="section-title">Authentication Flow</h2>
          </motion.div>

          <div className="card border border-white/5 p-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FLOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="px-3 py-2 rounded-lg bg-brand/10 border border-brand/25 text-brand text-xs font-mono font-semibold">
                      {step.label}
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">{step.desc}</span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <span className="text-brand/40 font-mono mb-4">→</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO CREDENTIALS ─────────────────────────── */}
      <section className="py-24 px-6 bg-mesh">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-mono text-brand mb-3">QUICK START</p>
            <h2 className="section-title">Demo Credentials</h2>
            <p className="text-slate-500 text-sm mt-3 font-body">Three seeded accounts with different permission levels</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {DEMO_USERS.map((u, i) => (
              <motion.div
                key={u.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border ${u.color} p-5 space-y-3`}
              >
                <span className={u.badge}>{u.label}</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">email</span>
                    <CopyBtn text={u.email} />
                  </div>
                  <p className="font-mono text-xs text-slate-300 break-all">{u.email}</p>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">password</span>
                    <CopyBtn text={u.password} />
                  </div>
                  <p className="font-mono text-xs text-slate-300">{u.password}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/auth" className="btn-primary inline-flex items-center gap-2">
              Get Started <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-slate-600 font-mono">
          AuthCore · University Deeptech · FastAPI + React · MIT License
        </p>
      </footer>
    </div>
  )
}
