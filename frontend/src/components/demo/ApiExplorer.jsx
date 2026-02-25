import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import useAuthStore from '@/store/authStore'
import FlowDiagram from './FlowDiagram'
import { cn } from '@/lib/utils'

const METHOD_COLORS = {
  GET:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  POST:   'bg-brand/15 text-brand border-brand/30',
  DELETE: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  PATCH:  'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
}

const ENDPOINTS = [
  {
    group: 'AUTH',
    items: [
      { method: 'POST', path: '/register',      auth: false, body: '{\n  "username": "newuser",\n  "email": "new@demo.com",\n  "password": "NewPass1!",\n  "role": "user"\n}',                    flow: ['Client','CORS','Middleware','DB'] },
      { method: 'POST', path: '/login',          auth: false, body: '{\n  "email": "user@demo.com",\n  "password": "User1234!"\n}',                                                                   flow: ['Client','CORS','Middleware','DB','Response'] },
      { method: 'POST', path: '/logout',         auth: true,  body: null,                                                                                                                              flow: ['Client','CORS','Middleware','Auth','DB','Response'] },
      { method: 'POST', path: '/refresh-token',  auth: false, body: '{\n  "refresh_token": "<paste_refresh_token>"\n}',                                                                               flow: ['Client','CORS','Middleware','Auth','Response'] },
    ],
  },
  {
    group: 'PROTECTED',
    items: [
      { method: 'GET',  path: '/profile',         auth: true,  body: null,                  flow: ['Client','CORS','Middleware','Auth','DB','Response'] },
    ],
  },
  {
    group: 'ADMIN',
    items: [
      { method: 'GET',    path: '/admin/users',      auth: true,  role: 'admin', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
      { method: 'DELETE', path: '/admin/user/2',     auth: true,  role: 'admin', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
      { method: 'PATCH',  path: '/admin/unlock/2',   auth: true,  role: 'admin', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
      { method: 'GET',    path: '/admin/stats',      auth: true,  role: 'admin', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
    ],
  },
  {
    group: 'MODERATOR',
    items: [
      { method: 'GET', path: '/moderator/logs',       auth: true, role: 'mod+', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
      { method: 'GET', path: '/moderator/logs/stats', auth: true, role: 'mod+', body: null, flow: ['Client','CORS','Middleware','Auth','Role','DB','Response'] },
    ],
  },
]

export default function ApiExplorer({ onRequest }) {
  const [selected, setSelected] = useState(ENDPOINTS[0].items[1]) // default: login
  const [body, setBody]         = useState(ENDPOINTS[0].items[1].body || '')
  const [loading, setLoading]   = useState(false)
  const [response, setResponse] = useState(null)
  const [statusCode, setStatus] = useState(null)
  const [elapsed, setElapsed]   = useState(null)
  const { token } = useAuthStore()

  const select = (ep) => {
    setSelected(ep)
    setBody(ep.body || '')
    setResponse(null)
    setStatus(null)
    setElapsed(null)
  }

  const send = async () => {
    setLoading(true)
    setResponse(null)
    const t0 = Date.now()
    try {
      let parsedBody
      if (body.trim()) {
        try { parsedBody = JSON.parse(body) } catch { parsedBody = body }
      }

      const config = {
        method:  selected.method.toLowerCase(),
        url:     selected.path,
        ...(parsedBody ? { data: parsedBody } : {}),
      }

      const res = await api.request(config)
      setStatus(res.status)
      setResponse(res.data)
      onRequest?.({ method: selected.method, path: selected.path, status: res.status, ms: Date.now() - t0 })
    } catch (err) {
      const status = err.response?.status || 0
      setStatus(status)
      setResponse(err.response?.data || { error: err.message })
      onRequest?.({ method: selected.method, path: selected.path, status, ms: Date.now() - t0 })
    } finally {
      setElapsed(Date.now() - t0)
      setLoading(false)
    }
  }

  const isSuccess = statusCode && statusCode < 400

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Endpoint selector + flow */}
      <div className="card p-4 space-y-3">
        {/* Method + path + meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs font-mono px-2 py-1 rounded border', METHOD_COLORS[selected.method])}>
            {selected.method}
          </span>
          <span className="font-mono text-sm text-slate-200">{selected.path}</span>
          {selected.auth && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-500">🔒 Auth</span>
          )}
          {selected.role && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-accent-amber">{selected.role}</span>
          )}
          {statusCode && (
            <span className={cn('ml-auto text-xs font-mono px-2 py-0.5 rounded border',
              isSuccess ? 'text-brand border-brand/30 bg-brand/10' : 'text-accent-red border-accent-red/30 bg-accent-red/10'
            )}>
              {statusCode}
            </span>
          )}
          {elapsed && (
            <span className="text-xs font-mono text-slate-500">{elapsed}ms</span>
          )}
        </div>

        <FlowDiagram activeSteps={selected.flow} />
      </div>

      {/* Request body */}
      {selected.body !== null && (
        <div>
          <label className="text-xs font-mono text-slate-500 mb-1.5 block">Request Body (JSON)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="input-field font-mono text-xs resize-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* Send button */}
      <button
        onClick={send}
        disabled={loading}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        {loading ? 'Sending...' : 'Send Request →'}
      </button>

      {/* Response */}
      <AnimatePresence>
        {response !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-xl border bg-surface-3 overflow-hidden',
              isSuccess ? 'border-brand/25' : 'border-accent-red/25'
            )}
          >
            <div className={cn(
              'px-4 py-2 border-b text-xs font-mono',
              isSuccess ? 'border-brand/15 text-brand' : 'border-accent-red/15 text-accent-red'
            )}>
              Response
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-52">
              {JSON.stringify(response, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Endpoint list */}
      <div className="space-y-4 mt-auto">
        {ENDPOINTS.map(({ group, items }) => (
          <div key={group}>
            <p className="text-[10px] font-mono text-slate-600 mb-1.5 tracking-widest">{group}</p>
            <div className="space-y-1">
              {items.map((ep) => (
                <button
                  key={ep.method + ep.path}
                  onClick={() => select(ep)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all',
                    selected === ep ? 'bg-brand/10 border border-brand/20' : 'hover:bg-white/3 border border-transparent'
                  )}
                >
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0', METHOD_COLORS[ep.method])}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-slate-300">{ep.path}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
