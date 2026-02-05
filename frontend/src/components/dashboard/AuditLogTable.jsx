import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ACTION_COLORS = {
  LOGIN:        'text-brand bg-brand/10 border-brand/20',
  REGISTER:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
  LOGOUT:       'text-slate-400 bg-slate-400/10 border-slate-400/20',
  FAILED_LOGIN: 'text-accent-red bg-accent-red/10 border-accent-red/20',
  LOCKED:       'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
}

const STATUS_COLORS = {
  SUCCESS: 'text-brand',
  FAILED:  'text-accent-red',
}

const ROW_TINTS = {
  SUCCESS: 'hover:bg-brand/3',
  FAILED:  'hover:bg-accent-red/3',
}

export default function AuditLogTable({ logs = [], showPagination = true, pageSize = 10 }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(logs.length / pageSize)
  const visible = showPagination ? logs.slice(page * pageSize, (page + 1) * pageSize) : logs

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-surface-3">
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">Time</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">Email</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">Action</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">IP</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500 font-body text-sm">
                  No audit logs yet
                </td>
              </tr>
            ) : (
              visible.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'border-b border-white/3 transition-colors cursor-default',
                    ROW_TINTS[log.status] || 'hover:bg-white/2'
                  )}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 font-body text-xs max-w-[180px] truncate">
                    {log.email}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      'text-[11px] font-mono px-2 py-0.5 rounded-full border',
                      ACTION_COLORS[log.action] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn('text-xs font-mono font-semibold', STATUS_COLORS[log.status])}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{log.ip_address}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500 font-body">
            Page {page + 1} of {totalPages} · {logs.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-brand hover:border-brand/30 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-brand hover:border-brand/30 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
