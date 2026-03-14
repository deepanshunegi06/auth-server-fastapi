import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToastProvider({ children }) {
  return (
    <Toast.Provider swipeDirection="right" duration={4000}>
      {children}
      <Toast.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]" />
    </Toast.Provider>
  )
}

export function ToastItem({ open, onOpenChange, title, description, variant = 'default' }) {
  const borderMap = {
    success: 'border-brand/50',
    error:   'border-accent-red/50',
    warning: 'border-accent-amber/50',
    default: 'border-white/10',
  }

  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'glass rounded-xl p-4 flex items-start gap-3 shadow-xl animate-slide-up',
        'border', borderMap[variant]
      )}
    >
      <div className="flex-1 min-w-0">
        <Toast.Title className="font-display font-semibold text-sm text-white">
          {title}
        </Toast.Title>
        {description && (
          <Toast.Description className="text-xs text-slate-400 mt-0.5">
            {description}
          </Toast.Description>
        )}
      </div>
      <Toast.Close className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5">
        <X size={14} />
      </Toast.Close>
    </Toast.Root>
  )
}
