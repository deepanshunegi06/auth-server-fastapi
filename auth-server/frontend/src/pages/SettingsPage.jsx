import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Lock, Shield, Zap, Mail, Database } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import { useToast } from '@/App'
import { cn } from '@/lib/utils'

const SETTINGS_SECTIONS = [
  {
    id: 'auth',
    title: 'Authentication',
    icon: Shield,
    items: [
      { key: 'access_token_expiry', label: 'Access Token Expiry (minutes)', value: '30', type: 'number' },
      { key: 'refresh_token_expiry', label: 'Refresh Token Expiry (days)', value: '7', type: 'number' },
      { key: 'bcrypt_cost', label: 'bcrypt Cost Factor', value: '12', type: 'number', readonly: true },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Lock,
    items: [
      { key: 'max_failed_attempts', label: 'Max Failed Login Attempts', value: '5', type: 'number' },
      { key: 'lockout_duration', label: 'Account Lockout Duration (minutes)', value: '30', type: 'number' },
      { key: 'token_blacklist_cleanup', label: 'Token Blacklist Cleanup (hours)', value: '24', type: 'number' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Mail,
    items: [
      { key: 'email_on_login', label: 'Email Alerts on Login', value: 'off', type: 'toggle' },
      { key: 'email_on_failed_login', label: 'Email Alerts on Failed Login', value: 'off', type: 'toggle' },
      { key: 'email_on_lockout', label: 'Email Alerts on Account Lockout', value: 'on', type: 'toggle' },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: Database,
    items: [
      { key: 'audit_log_retention', label: 'Audit Log Retention (days)', value: '90', type: 'number' },
      { key: 'session_timeout', label: 'Session Timeout (minutes)', value: '60', type: 'number' },
      { key: 'enable_api_logs', label: 'Enable API Request Logging', value: 'on', type: 'toggle' },
    ],
  },
]

export default function SettingsPage() {
  const showToast = useToast()
  const [settings, setSettings] = useState(
    SETTINGS_SECTIONS.reduce((acc, section) => {
      section.items.forEach((item) => {
        acc[item.key] = item.value
      })
      return acc
    }, {})
  )

  const [dirty, setDirty] = useState(false)

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleSave = async () => {
    // Mock save — in real app, POST to backend
    console.log('Saving settings:', settings)
    showToast({ title: 'Settings saved successfully', variant: 'success' })
    setDirty(false)
  }

  const handleReset = () => {
    setSettings(
      SETTINGS_SECTIONS.reduce((acc, section) => {
        section.items.forEach((item) => {
          acc[item.key] = item.value
        })
        return acc
      }, {})
    )
    setDirty(false)
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 h-[calc(100vh-56px)]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display font-bold text-3xl text-white mb-1">Settings</h1>
            <p className="text-sm text-slate-400">Configure authentication, security, and system parameters</p>
          </motion.div>

          {/* Settings Grid */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mb-8">
            {SETTINGS_SECTIONS.map((section, i) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card border border-white/10 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/25 flex items-center justify-center">
                      <Icon size={18} className="text-brand" />
                    </div>
                    <h2 className="font-display font-semibold text-lg text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0">
                        <label className="text-sm text-slate-300 font-body">{item.label}</label>
                        {item.type === 'toggle' ? (
                          <button
                            onClick={() => handleChange(item.key, settings[item.key] === 'on' ? 'off' : 'on')}
                            className={cn(
                              'relative w-12 h-6 rounded-full transition-all duration-200',
                              settings[item.key] === 'on' ? 'bg-brand' : 'bg-slate-700'
                            )}
                          >
                            <motion.div
                              animate={{ x: settings[item.key] === 'on' ? 24 : 4 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full"
                            />
                          </button>
                        ) : (
                          <input
                            type={item.type}
                            value={settings[item.key]}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            readOnly={item.readonly}
                            disabled={item.readonly}
                            className={cn(
                              'w-24 px-3 py-1.5 rounded-lg border text-xs font-mono text-right',
                              item.readonly
                                ? 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-surface-3 border-white/10 text-slate-200 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-brand'
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 sticky bottom-6"
          >
            {dirty && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                className="px-4 py-2 text-sm font-display font-semibold rounded-lg
                           border border-slate-500 text-slate-300 hover:text-slate-100
                           hover:border-slate-400 transition-all duration-200"
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              animate={{ scale: dirty ? 1 : 0.95, opacity: dirty ? 1 : 0.7 }}
              onClick={handleSave}
              disabled={!dirty}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 text-sm font-display font-semibold rounded-lg',
                'transition-all duration-200',
                dirty
                  ? 'bg-brand text-surface hover:bg-brand/90 cursor-pointer'
                  : 'bg-brand/40 text-surface/60 cursor-not-allowed'
              )}
            >
              <Save size={14} />
              Save Settings
            </motion.button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl border border-slate-600/30 bg-slate-900/20 px-5 py-4 max-w-2xl"
          >
            <div className="flex items-start gap-3">
              <Zap size={14} className="text-slate-400 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <p className="font-mono font-semibold text-slate-300 mb-1">Configuration Guide</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>bcrypt Cost Factor: Higher = slower but more secure. Standard is 12 (4096 rounds).</li>
                  <li>Token Expiry: Shorter = more secure, longer = better UX. Balance: 30 min access + 7 day refresh.</li>
                  <li>Lockout Duration: Time an account is locked after max failed attempts.</li>
                  <li>Changes take effect immediately. Existing tokens are NOT invalidated.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
