import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { useToast } from '@/App'

export default function TokenDisplay() {
  const { token, tokenExpiry, logout } = useAuthStore()
  const showToast = useToast()
  const [copied, setCopied]         = useState(false)
  const [remaining, setRemaining]   = useState(null)

  useEffect(() => {
    if (!tokenExpiry) return
    const tick = () => {
      const now = Date.now()
      const diff = tokenExpiry - now
      if (diff <= 0) {
        logout()
        showToast({ title: 'Session expired', description: 'Please login again', variant: 'warning' })
        return
      }
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tokenExpiry])

  const handleCopy = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (ms) => {
    if (!ms) return '--:--'
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const timerColor =
    !remaining            ? 'text-slate-400' :
    remaining > 600_000   ? 'text-brand' :
    remaining > 300_000   ? 'text-accent-amber' :
                            'text-accent-red'

  if (!token) return (
    <div className="rounded-xl border border-white/5 bg-surface-3 p-4 text-center">
      <p className="text-sm text-slate-500 font-body">No active token</p>
    </div>
  )

  return (
    <div className="rounded-xl border border-white/8 bg-surface-3 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-4/50">
        <div className={cn('flex items-center gap-1.5 text-xs font-mono font-semibold', timerColor)}>
          <Clock size={12} />
          <span>{formatTime(remaining)}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400
                     hover:text-brand transition-colors"
        >
          {copied ? <Check size={12} className="text-brand" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Token */}
      <div className="p-3 overflow-x-auto">
        <p className="font-mono text-[10px] text-slate-500 break-all leading-relaxed">
          {token}
        </p>
      </div>
    </div>
  )
}
