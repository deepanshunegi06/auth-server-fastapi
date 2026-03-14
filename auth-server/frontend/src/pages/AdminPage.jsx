import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import UsersTable from '@/components/dashboard/UsersTable'
import AuditLogTable from '@/components/dashboard/AuditLogTable'
import { useToast } from '@/App'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

export default function AdminPage() {
  const showToast = useToast()
  const [users, setUsers]       = useState([])
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('all')
  const [statusFilter, setStatus] = useState('all')
  const [actionFilter, setAction] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const [u, l] = await Promise.all([
          api.get('/admin/users'),
          api.get('/moderator/logs'),
        ])
        setUsers(u.data)
        setLogs(l.data)
      } catch {
        showToast({ title: 'Failed to load admin data', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/user/${id}`)
      setUsers((p) => p.filter((u) => u.id !== id))
      showToast({ title: 'User deleted', variant: 'success' })
    } catch (err) {
      showToast({ title: err.response?.data?.detail || 'Delete failed', variant: 'error' })
    }
  }

  const handleUnlock = async (id) => {
    try {
      const { data } = await api.patch(`/admin/unlock/${id}`)
      setUsers((p) => p.map((u) => (u.id === id ? data : u)))
      showToast({ title: 'Account unlocked', variant: 'success' })
    } catch {
      showToast({ title: 'Unlock failed', variant: 'error' })
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all'   || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || (statusFilter === 'locked' ? u.is_locked : !u.is_locked)
    return matchSearch && matchRole && matchStatus
  })

  const filteredLogs = logs.filter((l) => {
    return actionFilter === 'all' || l.action === actionFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-2xl text-white">Admin Panel</h1>
            <p className="text-sm text-slate-500 font-body mt-1">Manage users and view audit logs</p>
          </motion.div>

          {/* Users section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-display font-semibold text-white">Users ({filteredUsers.length})</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="input-field pl-8 py-2 text-sm w-48"
                  />
                </div>
                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field py-2 text-sm w-36"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field py-2 text-sm w-36"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
            <div className="card">
              <UsersTable users={filteredUsers} onDelete={handleDelete} onUnlock={handleUnlock} />
            </div>
          </motion.section>

          {/* Audit logs section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-display font-semibold text-white">Audit Logs ({filteredLogs.length})</h2>
              <select
                value={actionFilter}
                onChange={(e) => setAction(e.target.value)}
                className="input-field py-2 text-sm w-44"
              >
                <option value="all">All actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="FAILED_LOGIN">FAILED_LOGIN</option>
                <option value="REGISTER">REGISTER</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
            <div className="card p-4">
              <AuditLogTable logs={filteredLogs} showPagination pageSize={10} />
            </div>
          </motion.section>

        </main>
      </div>
    </div>
  )
}
