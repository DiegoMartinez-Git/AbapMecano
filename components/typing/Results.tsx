'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TestResult } from '@/types'

interface ResultsProps {
  result: TestResult
  onRetry: () => void
  personalBest: number | null
  isNewBest: boolean
}

function BigStat({ label, value, unit, accent }: {
  label: string
  value: string | number
  unit?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-widest text-[var(--color-text-dim)] font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'text-5xl font-mono font-bold tabular-nums',
            accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-main)]'
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-lg text-[var(--color-text-muted)] font-mono">{unit}</span>
        )}
      </div>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">{label}</span>
      <span className="text-lg font-mono font-semibold text-[var(--color-text-main)] tabular-nums">{value}</span>
    </div>
  )
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function getGrade(wpm: number): { label: string; color: string; dot: string } {
  if (wpm >= 100) return { label: 'Experto',       color: 'text-yellow-400',               dot: 'bg-yellow-400' }
  if (wpm >= 70)  return { label: 'Avanzado',      color: 'text-[var(--color-accent)]',     dot: 'bg-[var(--color-accent)]' }
  if (wpm >= 50)  return { label: 'Competente',    color: 'text-[var(--color-success)]',    dot: 'bg-[var(--color-success)]' }
  if (wpm >= 30)  return { label: 'En progreso',   color: 'text-blue-400',                  dot: 'bg-blue-400' }
  return              { label: 'Principiante',    color: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' }
}

export function Results({ result, onRetry, personalBest, isNewBest }: ResultsProps) {
  const grade = getGrade(result.wpm)

  useEffect(() => {
    if (!isNewBest) return
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 160,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#a78bfa', '#4ade80', '#f59e0b', '#60a5fa', '#f472b6', '#ffffff'],
        scalar: 1.1,
      })
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60,  spread: 50, origin: { x: 0, y: 0.6 }, colors: ['#a78bfa', '#f59e0b'] })
        confetti({ particleCount: 60, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors: ['#a78bfa', '#f59e0b'] })
      }, 300)
    })
  }, [isNewBest])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-[var(--color-border)]">
          {isNewBest ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold mb-2"
            >
              <IconStar />
              Nuevo récord personal
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className={cn('w-1.5 h-1.5 rounded-full', grade.dot)} />
              <span className={cn('text-sm font-semibold', grade.color)}>{grade.label}</span>
            </div>
          )}
          {personalBest !== null && !isNewBest && (
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
              Récord personal: <span className="font-mono text-[var(--color-text-muted)]">{personalBest} PPM</span>
            </p>
          )}
        </div>

        {/* Main stats */}
        <div className="flex items-center justify-center gap-16 px-8 py-8">
          <div className="relative">
            <BigStat label="PPM" value={result.wpm} accent />
            {isNewBest && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-1 -right-5 text-yellow-400"
              >
                <IconStar />
              </motion.span>
            )}
          </div>
          <div className="w-px h-16 bg-[var(--color-border)]" />
          <BigStat label="Precisión" value={result.accuracy.toFixed(1)} unit="%" />
        </div>

        {/* Secondary stats */}
        <div className="flex items-center justify-center gap-3 px-8 pb-8 flex-wrap">
          <SmallStat label="PPM Bruto"       value={result.rawWpm} />
          <SmallStat label="Errores"         value={result.errors} />
          <SmallStat label="Chars correctos" value={result.correctChars} />
          <SmallStat
            label="Tiempo"
            value={result.mode === 'timed' ? `${result.timeLimit}s` : `${result.duration}s`}
          />
        </div>

        {/* Actions */}
        <div className="border-t border-[var(--color-border)] px-8 py-5 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-dim)]">
            <kbd className="font-mono bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px]">
              Tab
            </kbd>
            {' '}para repetir
          </p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-white text-sm font-medium transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Intentar de nuevo
          </button>
        </div>
      </div>
    </motion.div>
  )
}
