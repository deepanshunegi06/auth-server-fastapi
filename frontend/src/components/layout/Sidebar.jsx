import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Activity, Users, Shield, LogOut, ChevronLeft, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { useToast } from '@/App'
import api from '@/lib/axios'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/demo', label: 'API Demo', icon: Code2 },
  { to: '/admin', label: 'Admin', icon: Users, adminOnly: true },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const showToast = useToast()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    showToast({ title: 'Logged out', variant: 'default' })
    navigate('/')
  }

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  )

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-surface-2 border-r border-white/5 shrink-0 overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-3 border border-white/10
                   flex items-center justify-center text-slate-400 hover:text-brand z-10 transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
          <ChevronLeft size={12} />
        </motion.div>
      </button>

      {/* Logo area */}
      <div className="px-4 py-5 flex items-center gap-2 border-b border-white/5">
        <Shield size={18} className="text-brand shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-display font-bold text-sm text-white whitespace-nowrap overflow-hidden"
            >
              Auth<span className="text-brand">Core</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {visibleItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand rounded-full" />
              )}
              <Icon size={16} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-body whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400
                     hover:text-accent-red hover:bg-accent-red/5 transition-all duration-200"
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-body whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
