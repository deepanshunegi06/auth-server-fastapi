import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Unlock, AlertTriangle } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatDate, formatRole, cn } from '@/lib/utils'

export default function UsersTable({ users = [], onDelete, onUnlock }) {
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-surface-3">
              {['ID', 'User', 'Role', 'Status', 'Attempts', 'Created', 'Last Login', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const roleInfo = formatRole(user.role)
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold border',
                        user.role === 'admin'     ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' :
                        user.role === 'moderator' ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' :
                                                    'border-brand/50 bg-brand/10 text-brand'
                      )}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-slate-200 font-body text-sm font-medium">{user.username}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[11px] font-mono px-2 py-0.5 rounded-full border', roleInfo.color)}>
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_locked ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border text-accent-red bg-accent-red/10 border-accent-red/20">
                        LOCKED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border text-brand bg-brand/10 border-brand/20">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{user.failed_attempts}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{formatDate(user.last_login)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {user.is_locked && (
                        <button
                          onClick={() => onUnlock(user.id)}
                          className="p-1.5 rounded-lg text-accent-amber hover:bg-accent-amber/10 transition-colors"
                          title="Unlock account"
                        >
                          <Unlock size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                                      card border border-accent-red/20 p-6 w-[380px] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-accent-red" />
              </div>
              <Dialog.Title className="font-display font-bold text-white">Delete User</Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-slate-400 font-body mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">{deleteTarget?.username}</span>?
              This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close className="btn-ghost text-sm py-2">Cancel</Dialog.Close>
              <button
                onClick={handleConfirmDelete}
                className="bg-accent-red/80 hover:bg-accent-red text-white font-display font-semibold
                           px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
