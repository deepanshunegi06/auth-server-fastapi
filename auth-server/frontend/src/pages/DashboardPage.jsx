import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Clock, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import StatsCards from '@/components/dashboard/StatsCards'
import AuditLogTable from '@/components/dashboard/AuditLogTable'
import UsersTable from '@/components/dashboard/UsersTable'
import ActivityChart from '@/components/dashboard/ActivityChart'
import useAuthStore from '@/store/authStore'
import { FEATURES } from '@/config/features'
import { useToast } from '@/App'
import { formatRole, cn } from '@/lib/utils'
import api from '@/lib/axios'

function TokenCountdown() {
  const { tokenExpiry } = useAuthStore()
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!tokenExpiry) return
    const tick = () => setRemaining(Math.max(0, tokenExpiry - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tokenExpiry])

  const ms = remaining
  const s  = Math.floor((ms || 0) / 1000)
  const m  = Math.floor(s / 60)
  const color = !ms ? 'text-slate-400' : ms > 600000 ? 'text-brand' : ms > 300000 ? 'text-accent-amber' : 'text-accent-red'

  return (
    <div className={cn('flex items-center gap-1.5 text-xs font-mono', color)}>
      <Clock size={12} />
      <span>
        {String(m).padStart(2,'0')}:{String(s % 60).padStart(2,'0')} remaining
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const showToast = useToast()
  const navigate  = useNavigate()
  const isAdmin   = user?.role === 'admin'
  const isMod     = user?.role === 'admin' || user?.role === 'moderator'
  const roleInfo  = formatRole(user?.role)

  const [stats, setStats]   = useState(null)
  const [logs, setLogs]     = useState([])
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin && (FEATURES.DASHBOARD_STATS || FEATURES.DASHBOARD_USERS_TABLE)) {
          const promises = []
          if (FEATURES.DASHBOARD_STATS) promises.push(api.get('/admin/stats'))
          if (FEATURES.DASHBOARD_USERS_TABLE) promises.push(api.get('/admin/users'))
          
          const results = await Promise.all(promises)
          if (FEATURES.DASHBOARD_STATS && results[0]) setStats(results[0].data)
          if (FEATURES.DASHBOARD_USERS_TABLE && results[FEATURES.DASHBOARD_STATS ? 1 : 0]) {
            setUsers(results[FEATURES.DASHBOARD_STATS ? 1 : 0].data)
          }
        }
        if (isMod && (FEATURES.DASHBOARD_AUDIT_LOGS || FEATURES.DASHBOARD_ACTIVITY_CHART)) {
          const logsRes = await api.get('/moderator/logs')
          setLogs(logsRes.data)
        }
      } catch (err) {
        showToast({ title: 'Failed to load data', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/user/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      showToast({ title: 'User deleted', variant: 'success' })
    } catch (err) {
      showToast({ title: err.response?.data?.detail || 'Delete failed', variant: 'error' })
    }
  }

  const handleUnlock = async (id) => {
    try {
      const { data } = await api.patch(`/admin/unlock/${id}`)
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)))
      showToast({ title: 'Account unlocked', variant: 'success' })
    } catch {
      showToast({ title: 'Unlock failed', variant: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 h-[calc(100vh-56px)]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                Welcome back, <span className="text-brand">{user?.username}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={roleInfo.color}>{roleInfo.label}</span>
                <TokenCountdown />
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          {FEATURES.DASHBOARD_STATS && isAdmin && stats && <StatsCards stats={stats} />}

          {/* Charts + recent logs */}
          {FEATURES.DASHBOARD_AUDIT_LOGS && isMod && (
            <div className="grid lg:grid-cols-2 gap-6">
              {FEATURES.DASHBOARD_ACTIVITY_CHART && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-5"
                >
                  <h2 className="font-display font-semibold text-white mb-4 text-sm">Login Activity — Last 7 Days</h2>
                  <ActivityChart logs={logs} />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-5"
              >
                <h2 className="font-display font-semibold text-white mb-4 text-sm">Recent Audit Logs</h2>
                <AuditLogTable logs={logs.slice(0, 10)} showPagination={false} />
              </motion.div>
            </div>
          )}

          {/* Non-privileged users see profile summary */}
          {!isMod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 max-w-md"
            >
              <h2 className="font-display font-semibold text-white mb-4">Your Profile</h2>
              <div className="space-y-3 text-sm font-body">
                {[
                  ['Username', user?.username],
                  ['Email',    user?.email],
                  ['Role',     user?.role],
                  ['Account',  user?.is_locked ? 'Locked' : 'Active'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}</span>
                    <span className="text-slate-200 font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Admin: users table */}
          {FEATURES.DASHBOARD_USERS_TABLE && isAdmin && users.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-5"
            >
              <h2 className="font-display font-semibold text-white mb-4 text-sm">All Users</h2>
              <UsersTable users={users} onDelete={handleDelete} onUnlock={handleUnlock} />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
