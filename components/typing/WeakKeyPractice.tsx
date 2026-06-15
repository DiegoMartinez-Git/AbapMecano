'use client'

import { useMemo, useState } from 'react'
import { TypingTest } from './TypingTest'
import { generateWeakKeyText } from '@/lib/texts'

export function WeakKeyPractice({ weakKeys }: { weakKeys: string[] }) {
  const [seed, setSeed] = useState(0)
  const text = useMemo(() => generateWeakKeyText(weakKeys, 40), [weakKeys, seed])

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--color-text-muted)] mr-1">Reforzando:</span>
        {weakKeys.map((k) => (
          <kbd
            key={k}
            className="font-mono text-sm px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-accent)]/40 text-[var(--color-accent)] uppercase"
          >
            {k}
          </kbd>
        ))}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto text-xs px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors"
        >
          Nuevo texto
        </button>
      </div>

      <TypingTest key={seed} initialText={text} hideSelector initialMode="words" />
    </div>
  )
}
