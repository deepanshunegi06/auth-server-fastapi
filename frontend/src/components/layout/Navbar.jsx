import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, LogOut, ChevronDown, LayoutDashboard, Code2, Settings } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import useAuthStore from '@/store/authStore'
import { useToast } from '@/App'
import { formatRole, cn } from '@/lib/utils'
import api, { clearAuthToken } from '@/lib/axios'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const showToast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch {}
    clearAuthToken()
    logout()
    showToast({ title: 'Logged out', description: 'See you next time!', variant: 'default' })
    navigate('/')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || '??'
  const roleInfo = formatRole(user?.role)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/demo',      label: 'API Demo',  icon: Code2 },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Settings }] : []),
  ]

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 inset-x-0 z-40 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield size={20} className="text-brand" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand animate-glow-pulse" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Auth<span className="text-brand">Core</span>
          </span>
        </Link>

        {/* Center nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-200',
                  location.pathname === to
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <Link to="/auth" className="btn-primary text-sm py-2">
              Login / Register
            </Link>
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 group">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold border-2',
                    user?.role === 'admin'     ? 'border-purple-500 bg-purple-500/20 text-purple-300' :
                    user?.role === 'moderator' ? 'border-amber-500 bg-amber-500/20 text-amber-300' :
                                                 'border-brand bg-brand/20 text-brand'
                  )}>
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-display font-semibold text-slate-200 leading-none">
                      {user?.username}
                    </span>
                    <span className={cn('text-[10px] font-mono leading-none mt-0.5', roleInfo.color)}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="glass border border-white/10 rounded-xl p-1.5 shadow-2xl w-44 z-50"
                  sideOffset={6}
                  align="end"
                >
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer outline-none transition-colors"
                    onSelect={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg cursor-pointer outline-none transition-colors"
                    onSelect={handleLogout}
                  >
                    <LogOut size={14} />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
