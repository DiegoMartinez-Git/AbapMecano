'use client'

import { useSettings, FONT_SCALES } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

export function TypingSettings() {
  const { fontScale, setFontScale, showKeyboard, setShowKeyboard } = useSettings()

  return (
    <div className="rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      {/* Tamaño de letra */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-main)]">Tamaño de la letra</span>
          <div className="flex rounded-md bg-[var(--color-surface-2)] p-1">
            {FONT_SCALES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFontScale(value)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-medium transition-all',
                  fontScale === value
                    ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista previa */}
        <div className="rounded-md bg-[var(--color-bg)] border border-[var(--color-border-subtle)] px-4 py-3 overflow-hidden">
          <span
            className="font-mono text-[var(--color-text-main)]"
            style={{ fontSize: `${1.5 * fontScale}rem` }}
          >
            the quick brown fox
          </span>
        </div>
      </div>

      <div className="h-px bg-[var(--color-border)] my-5" />

      {/* Teclado guía */}
      <label className="flex items-center justify-between cursor-pointer">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--color-text-main)]">Teclado con guía de dedos</span>
          <span className="text-xs text-[var(--color-text-dim)]">Muestra la próxima tecla y qué dedo usar bajo el test</span>
        </div>
        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors shrink-0',
            showKeyboard ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
          )}
          role="switch"
          aria-checked={showKeyboard}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full transition-all',
              showKeyboard ? 'left-[22px] bg-[var(--color-on-accent)]' : 'left-0.5 bg-[var(--color-text-dim)]'
            )}
          />
        </button>
      </label>
    </div>
  )
}
