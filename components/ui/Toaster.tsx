'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore, type Toast } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const DURATION = 4000

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const t = setTimeout(() => remove(toast.id), DURATION)
    return () => clearTimeout(t)
  }, [toast.id, remove])

  const styles: Record<string, string> = {
    achievement: 'border-yellow-400/40 bg-yellow-400/5',
    levelup:     'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5',
    success:     'border-[var(--color-success)]/40 bg-[var(--color-success)]/5',
    error:       'border-[var(--color-error)]/40 bg-[var(--color-error)]/5',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 rounded-md border',
        'bg-[var(--color-surface)] shadow-sm min-w-[260px] max-w-[320px] cursor-pointer',
        styles[toast.type]
      )}
      onClick={() => remove(toast.id)}
    >
      {toast.icon && (
        <span className="text-xl leading-none mt-0.5 shrink-0">{toast.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-main)] leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">
            {toast.description}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-[var(--color-accent)]/50"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
