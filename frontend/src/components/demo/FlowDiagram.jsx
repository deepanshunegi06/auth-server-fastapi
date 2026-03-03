import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const STEPS = ['Client', 'CORS', 'Middleware', 'Auth', 'Role', 'DB', 'Response']

export default function FlowDiagram({ activeSteps = [] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STEPS.map((step, i) => {
        const active = activeSteps.includes(step)
        return (
          <div key={step} className="flex items-center gap-1">
            <motion.div
              layout
              animate={{
                backgroundColor: active ? 'rgba(0,245,196,0.15)' : 'rgba(255,255,255,0.03)',
                borderColor:     active ? 'rgba(0,245,196,0.5)' : 'rgba(255,255,255,0.08)',
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all duration-300',
                active ? 'text-brand shadow-sm shadow-brand/20' : 'text-slate-500'
              )}
            >
              {step}
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.span
                animate={{ color: activeSteps.includes(STEPS[i + 1]) ? '#00f5c4' : '#334155' }}
                className="text-xs font-mono"
              >
                →
              </motion.span>
            )}
          </div>
        )
      })}
    </div>
  )
}
