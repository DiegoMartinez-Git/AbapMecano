'use client'

import { cn } from '@/lib/utils'
import type { TestMode, TestStatus, TimeLimit } from '@/types'
import { LiveSparkline } from './LiveSparkline'

interface StatsBarProps {
  mode: TestMode
  wpm: number
  accuracy: number
  errors: number
  timeLeft: number
  timeLimit: TimeLimit
  status: TestStatus
  wordProgress?: number
  sparkData?: number[]
}

function StatItem({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[64px]">
      <span
        className={cn(
          'text-2xl font-mono font-bold tabular-nums leading-none',
          accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-main)]'
        )}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mt-1 font-medium">
        {label}
      </span>
    </div>
  )
}

export function StatsBar({
  mode, wpm, accuracy, errors, timeLeft, timeLimit, status,
  wordProgress = 0, sparkData = [],
}: StatsBarProps) {
  const isWarning = mode === 'timed' && timeLeft <= 10 && timeLeft > 0 && status === 'running'

  return (
    <div className="flex items-center gap-8 mt-6 mb-4 px-6 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <StatItem label="PPM" value={wpm} />
      <div className="w-px h-8 bg-[var(--color-border)]" />
      <StatItem label="Precisión" value={`${accuracy.toFixed(1)}%`} />
      <div className="w-px h-8 bg-[var(--color-border)]" />
      <StatItem label="Errores" value={errors} />

      {mode === 'timed' && (
        <>
          <div className="w-px h-8 bg-[var(--color-border)]" />
          <div className="flex flex-col items-center min-w-[64px]">
            <span
              className={cn(
                'text-2xl font-mono font-bold tabular-nums leading-none transition-colors',
                isWarning ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]'
              )}
            >
              {status === 'idle' || status === 'countdown' ? timeLimit : timeLeft}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mt-1 font-medium">
              seg
            </span>
          </div>
        </>
      )}

      {/* Live sparkline (shown while running) */}
      {status === 'running' && sparkData.length >= 2 && (
        <>
          <div className="w-px h-8 bg-[var(--color-border)]" />
          <LiveSparkline data={sparkData} />
        </>
      )}
    </div>
  )
}
