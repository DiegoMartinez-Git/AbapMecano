'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomTextModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (text: string) => void
}

export function CustomTextModal({ isOpen, onClose, onConfirm }: CustomTextModalProps) {
  const [value, setValue] = useState('')
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  function handleConfirm() {
    const clean = value.trim().replace(/\s+/g, ' ')
    if (clean.length < 10) return
    onConfirm(clean)
    setValue('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-bold text-[var(--color-text-main)] mb-1">
                Texto personalizado
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Pega aquí el texto que quieres practicar. Mínimo 10 caracteres.
              </p>

              <textarea
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Pega tu texto aquí…"
                rows={6}
                className="w-full rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] p-3 resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--color-text-dim)] font-mono">
                  {value.length} chars · {wordCount} palabras
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={value.trim().length < 10}
                    className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Usar este texto
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
