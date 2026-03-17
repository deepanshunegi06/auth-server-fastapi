import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import Navbar from '@/components/layout/Navbar'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { useToast } from '@/App'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const showToast = useToast()

  const handleRegisterSuccess = () => {
    setTab('login')
    showToast({
      title: 'Account created!',
      description: 'You can now log in.',
      variant: 'success',
    })
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb-1 absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-brand/4 blur-3xl" />
        <div className="orb-2 absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/4 blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card */}
          <div className="card border border-white/8 p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Shield size={18} className="text-brand" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white leading-none">
                  Auth<span className="text-brand">Core</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Authentication Server</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={setTab}>
              <Tabs.List className="flex gap-1 p-1 bg-surface-3 rounded-xl mb-6">
                {['login', 'register'].map((t) => (
                  <Tabs.Trigger
                    key={t}
                    value={t}
                    className="flex-1 py-2 text-sm font-display font-semibold rounded-lg transition-all duration-200
                               data-[state=active]:bg-brand data-[state=active]:text-surface
                               data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-200"
                  >
                    {t === 'login' ? 'Login' : 'Register'}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 'login' ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tabs.Content value="login" forceMount={tab === 'login' ? true : undefined}>
                    {tab === 'login' && <LoginForm />}
                  </Tabs.Content>
                  <Tabs.Content value="register" forceMount={tab === 'register' ? true : undefined}>
                    {tab === 'register' && <RegisterForm onSuccess={handleRegisterSuccess} />}
                  </Tabs.Content>
                </motion.div>
              </AnimatePresence>
            </Tabs.Root>
          </div>

          <p className="text-center text-xs text-slate-600 font-mono mt-4">
            Tokens stored in memory only · Never persisted
          </p>
        </motion.div>
      </div>
    </div>
  )
}
