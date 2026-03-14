import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import ApiExplorer from '@/components/demo/ApiExplorer'
import JwtVisualizer from '@/components/demo/JwtVisualizer'
import BruteForceDemo from '@/components/demo/BruteForceDemo'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import * as Tabs from '@radix-ui/react-tabs'

const STATUS_COLOR = (s) =>
  !s         ? 'text-slate-500' :
  s < 300    ? 'text-brand' :
  s < 400    ? 'text-blue-400' :
  s < 500    ? 'text-accent-amber' :
               'text-accent-red'

const METHOD_COLOR = {
  GET:    'text-blue-400',
  POST:   'text-brand',
  DELETE: 'text-accent-red',
  PATCH:  'text-accent-amber',
}

export default function ApiDemoPage() {
  const { token } = useAuthStore()
  const [reqLog, setReqLog] = useState([])

  const handleRequest = (entry) => {
    setReqLog((prev) => [{ ...entry, time: new Date() }, ...prev.slice(0, 49)])
  }

  return (
    <div className="min-h-screen bg-[#050810]">
      <Navbar />

      <div className="pt-14 h-screen flex flex-col">
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
          <h1 className="font-display font-bold text-lg text-white">API Explorer</h1>
          <span className="text-xs font-mono text-slate-500">Interactive demo — fires real backend requests</span>
          {!token && (
            <span className="ml-auto text-xs font-mono text-accent-amber bg-accent-amber/10 border border-accent-amber/20 px-2 py-0.5 rounded-full">
              Login to test authenticated endpoints
            </span>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* LEFT: explorer */}
          <div className="border-r border-white/5 overflow-y-auto p-5">
            <ApiExplorer onRequest={handleRequest} />
          </div>

          {/* CENTER: visualizer + brute force */}
          <div className="border-r border-white/5 overflow-y-auto p-5">
            <Tabs.Root defaultValue="jwt">
              <Tabs.List className="flex gap-1 p-1 bg-surface-3 rounded-xl mb-5">
                {[
                  { value: 'jwt',    label: 'JWT Visualizer' },
                  { value: 'brute',  label: 'Brute Force Demo' },
                ].map((t) => (
                  <Tabs.Trigger
                    key={t.value}
                    value={t.value}
                    className="flex-1 py-1.5 text-xs font-display font-semibold rounded-lg transition-all
                               data-[state=active]:bg-brand data-[state=active]:text-surface
                               data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-200"
                  >
                    {t.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="jwt">
                <h2 className="font-display font-semibold text-white text-sm mb-3">JWT Token Decoded</h2>
                <JwtVisualizer token={token} />
              </Tabs.Content>

              <Tabs.Content value="brute">
                <h2 className="font-display font-semibold text-white text-sm mb-3">Brute Force Simulation</h2>
                <BruteForceDemo />
              </Tabs.Content>
            </Tabs.Root>
          </div>

          {/* RIGHT: request log */}
          <div className="overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-white text-sm">Live Request Log</h2>
              {reqLog.length > 0 && (
                <button
                  onClick={() => setReqLog([])}
                  className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {reqLog.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-sm font-body">
                Send a request to see it here
              </div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {reqLog.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-3 border border-white/5 text-xs"
                    >
                      <span className="font-mono text-slate-600 text-[10px] shrink-0">
                        {format(r.time, 'HH:mm:ss')}
                      </span>
                      <span className={cn('font-mono font-semibold shrink-0', METHOD_COLOR[r.method] || 'text-slate-400')}>
                        {r.method}
                      </span>
                      <span className="font-mono text-slate-400 flex-1 truncate text-[10px]">{r.path}</span>
                      <span className={cn('font-mono font-bold shrink-0', STATUS_COLOR(r.status))}>
                        {r.status}
                      </span>
                      <span className="font-mono text-slate-600 text-[10px] shrink-0">{r.ms}ms</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
