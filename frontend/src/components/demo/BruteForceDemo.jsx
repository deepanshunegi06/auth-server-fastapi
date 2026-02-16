import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, AlertOctagon } from 'lucide-react'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

export default function BruteForceDemo() {
  const [email, setEmail]     = useState('user@demo.com')
  const [running, setRunning] = useState(false)
  const [log, setLog]         = useState([])
  const [done, setDone]       = useState(false)

  const addLog = (entry) => setLog((prev) => [...prev, entry])

  const simulate = async () => {
    setRunning(true)
    setDone(false)
    setLog([])

    for (let attempt = 1; attempt <= 6; attempt++) {
      await new Promise((r) => setTimeout(r, 400))
      const start = Date.now()

      try {
        await api.post('/login', { email, password: `WrongPass${attempt}!` })
        addLog({ attempt, status: 'success', ms: Date.now() - start, message: 'Login succeeded' })
      } catch (err) {
        const status = err.response?.status
        const detail = err.response?.data?.detail || 'Request failed'
        const ms = Date.now() - start

        if (status === 423) {
          addLog({ attempt, status: 'locked', ms, message: detail })
          setDone(true)
          setRunning(false)
          return
        }
        addLog({ attempt, status: 'failed', ms, message: detail })
      }
    }

    setRunning(false)
    setDone(true)
  }

  const reset = () => { setLog([]); setDone(false) }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-red/5 border border-accent-red/20">
        <AlertOctagon size={16} className="text-accent-red shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 font-body">
          This demo fires real requests with wrong passwords against the backend,
          triggering the brute-force lockout mechanism after 5 failed attempts.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Target email"
          className="input-field text-sm flex-1"
          disabled={running}
        />
        {!done ? (
          <button
            onClick={simulate}
            disabled={running || !email}
            className={cn(
              'btn-primary text-sm whitespace-nowrap flex items-center gap-2',
              running && 'opacity-60 cursor-not-allowed'
            )}
          >
            <Zap size={14} />
            {running ? 'Attacking...' : 'Simulate Attack'}
          </button>
        ) : (
          <button onClick={reset} className="btn-ghost text-sm whitespace-nowrap">
            Reset
          </button>
        )}
      </div>

      {/* Attack log */}
      {log.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-surface-3 overflow-hidden">
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Attack Log</span>
          </div>
          <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
            <AnimatePresence>
              {log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg text-xs font-mono',
                    entry.status === 'locked'  ? 'bg-accent-amber/10 text-accent-amber' :
                    entry.status === 'failed'  ? 'bg-accent-red/5 text-accent-red' :
                                                 'bg-brand/5 text-brand'
                  )}
                >
                  <span className="text-slate-500">#{entry.attempt}</span>
                  <span className="flex-1">{entry.message}</span>
                  <span className="text-slate-500">{entry.ms}ms</span>
                  {entry.status === 'locked' && <Shield size={12} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-brand/5 border border-brand/20"
        >
          <Shield size={16} className="text-brand shrink-0" />
          <p className="text-xs text-slate-300 font-body">
            <span className="text-brand font-semibold">Brute force protection activated.</span>{' '}
            Account is now locked after 5 failed attempts. Unlock via Admin panel.
          </p>
        </motion.div>
      )}
    </div>
  )
}
