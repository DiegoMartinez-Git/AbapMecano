'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CountdownProps {
  count: number | null
}

export function Countdown({ count }: CountdownProps) {
  return (
    <AnimatePresence>
      {count !== null && (
        <motion.div
          key="countdown-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-bg)]/70 backdrop-blur-sm rounded-xl"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="text-8xl font-mono font-bold text-[var(--color-accent)] tabular-nums select-none"
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
