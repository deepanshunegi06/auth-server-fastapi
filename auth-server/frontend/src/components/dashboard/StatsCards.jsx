import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, AlertTriangle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

// Animate a number from 0 to target
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 800
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{display}</span>
}

const CARDS = [
  {
    key: 'total_users',
    label: 'Total Users',
    icon: Users,
    color: 'text-brand',
    bg: 'bg-brand/10',
    border: 'border-brand/20',
  },
  {
    key: 'active_sessions',
    label: 'Active Sessions',
    icon: Activity,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    key: 'failed_logins_today',
    label: 'Failed Logins Today',
    icon: AlertTriangle,
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10',
    border: 'border-accent-amber/20',
  },
  {
    key: 'locked_accounts',
    label: 'Locked Accounts',
    icon: Lock,
    color: 'text-accent-red',
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/20',
  },
]

export default function StatsCards({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon
        const value = stats[card.key] ?? 0
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={cn(
              'card p-5 border cursor-default',
              card.border,
              'hover:shadow-lg transition-shadow duration-300'
            )}
          >
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', card.bg)}>
              <Icon size={18} className={card.color} />
            </div>
            <div className={cn('text-3xl font-display font-bold', card.color)}>
              <AnimatedNumber value={value} />
            </div>
            <div className="text-xs text-slate-500 mt-1 font-body">{card.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
