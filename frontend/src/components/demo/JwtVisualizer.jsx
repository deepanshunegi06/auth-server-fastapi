import { motion } from 'framer-motion'
import { parseJwt, parseJwtHeader } from '@/lib/utils'

const PART_STYLES = [
  {
    label: 'Header',
    color: 'text-purple-300',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    dot: 'bg-purple-400',
  },
  {
    label: 'Payload',
    color: 'text-brand',
    border: 'border-brand/30',
    bg: 'bg-brand/5',
    dot: 'bg-brand',
  },
  {
    label: 'Signature',
    color: 'text-accent-amber',
    border: 'border-accent-amber/30',
    bg: 'bg-accent-amber/5',
    dot: 'bg-accent-amber',
  },
]

export default function JwtVisualizer({ token }) {
  if (!token) {
    return (
      <div className="rounded-xl border border-white/5 bg-surface-3 p-5 text-center">
        <p className="text-slate-500 text-sm font-body">Login to see your JWT token visualized here</p>
      </div>
    )
  }

  const parts = token.split('.')
  const header  = parseJwtHeader(token)
  const payload = parseJwt(token)

  const contents = [
    header,
    payload ? {
      ...payload,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : payload.exp,
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : payload.iat,
    } : null,
    null, // signature
  ]

  return (
    <div className="space-y-2">
      {/* Raw token display */}
      <div className="rounded-lg bg-surface-3 border border-white/5 p-3 overflow-x-auto">
        <p className="font-mono text-[10px] break-all leading-relaxed">
          <span className="text-purple-400">{parts[0]}</span>
          <span className="text-slate-600">.</span>
          <span className="text-brand">{parts[1]}</span>
          <span className="text-slate-600">.</span>
          <span className="text-accent-amber">{parts[2]}</span>
        </p>
      </div>

      {/* Decoded sections */}
      {PART_STYLES.map((style, i) => (
        <motion.div
          key={style.label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`rounded-xl border ${style.border} ${style.bg} p-3`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span className={`text-xs font-display font-semibold ${style.color}`}>{style.label}</span>
          </div>
          {contents[i] ? (
            <pre className={`text-[10px] font-mono ${style.color} leading-relaxed overflow-x-auto`}>
              {JSON.stringify(contents[i], null, 2)}
            </pre>
          ) : (
            <p className="text-xs font-mono text-slate-500">
              HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
