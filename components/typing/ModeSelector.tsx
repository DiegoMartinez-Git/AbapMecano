'use client'

import { cn } from '@/lib/utils'
import type { TestMode, TimeLimit, WordCount } from '@/types'
import { TIME_LIMITS, WORD_COUNTS } from '@/lib/texts'

interface ModeSelectorProps {
  mode: TestMode
  timeLimit: TimeLimit
  wordCount: WordCount
  disabled: boolean
  sapMode: boolean
  precisionMode: boolean
  numbersMode: boolean
  onModeChange: (m: TestMode) => void
  onTimeLimitChange: (t: TimeLimit) => void
  onWordCountChange: (w: WordCount) => void
  onSapModeChange: (v: boolean) => void
  onPrecisionModeChange: (v: boolean) => void
  onNumbersModeChange: (v: boolean) => void
  onCustomText: () => void
}

function formatTimeLabel(s: number): string {
  return s < 60 ? `${s}s` : `${s / 60}m`
}

function IconSap({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconTarget({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IconText({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function Toggle({
  icon, label, active, onClick, disabled,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      title={label}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
        active
          ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]/50 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export function ModeSelector({
  mode, timeLimit, wordCount, disabled,
  sapMode, precisionMode, numbersMode,
  onModeChange, onTimeLimitChange, onWordCountChange,
  onSapModeChange, onPrecisionModeChange, onNumbersModeChange,
  onCustomText,
}: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Row 1: mode + time/word options */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)]">
          {(['timed', 'words'] as TestMode[]).map((m) => (
            <button
              key={m}
              onClick={() => !disabled && onModeChange(m)}
              disabled={disabled}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                mode === m
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {m === 'timed' ? 'Tiempo' : 'Palabras'}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-[var(--color-border)]" />

        <div className="flex items-center gap-1">
          {mode === 'timed'
            ? TIME_LIMITS.map((t) => (
                <button
                  key={t}
                  onClick={() => !disabled && onTimeLimitChange(t as TimeLimit)}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-mono font-medium transition-all duration-150',
                    timeLimit === t
                      ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)]'
                      : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  {formatTimeLabel(t)}
                </button>
              ))
            : WORD_COUNTS.map((w) => (
                <button
                  key={w}
                  onClick={() => !disabled && onWordCountChange(w as WordCount)}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-mono font-medium transition-all duration-150',
                    wordCount === w
                      ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)]'
                      : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  {w}
                </button>
              ))}
        </div>
      </div>

      {/* Row 2: feature toggles */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Toggle
          icon={<IconSap />} label="SAP"
          active={sapMode} disabled={disabled}
          onClick={() => onSapModeChange(!sapMode)}
        />
        <Toggle
          icon={<IconTarget />} label="Precisión"
          active={precisionMode} disabled={false}
          onClick={() => onPrecisionModeChange(!precisionMode)}
        />
        <Toggle
          icon={<span className="font-mono text-[11px]">123</span>} label="Números"
          active={numbersMode} disabled={disabled}
          onClick={() => onNumbersModeChange(!numbersMode)}
        />
        <button
          onClick={() => !disabled && onCustomText()}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
            'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
          title="Pegar texto personalizado"
        >
          <IconText />
          <span className="hidden sm:inline">Texto propio</span>
        </button>
      </div>
    </div>
  )
}
