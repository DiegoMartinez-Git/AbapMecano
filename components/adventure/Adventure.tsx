'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AdventureState } from '@/types'
import { AdventureGame } from './AdventureGame'
import { Shop } from './Shop'

export function Adventure({ initial }: { initial: AdventureState }) {
  const [adv, setAdv] = useState<AdventureState>(initial)
  const [tab, setTab] = useState<'play' | 'shop'>('play')

  function patch(p: Partial<AdventureState>) {
    setAdv((prev) => ({ ...prev, ...p }))
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)]">Aventura</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Corre, recoge monedas y aplasta bugs escribiendo · récord: <span className="font-mono text-[var(--color-accent)]">{adv.best}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /></svg>
          <span className="font-mono font-bold text-[#fbbf24]">{adv.coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-md bg-[var(--color-surface-2)] p-1 mb-6 w-fit">
        {(['play', 'shop'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 rounded-md text-sm font-medium transition-all',
              tab === t ? 'bg-[var(--color-bg)] text-[var(--color-text-main)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            )}
          >
            {t === 'play' ? '🎮 Jugar' : '🛍️ Tienda'}
          </button>
        ))}
      </div>

      {tab === 'play' ? (
        <AdventureGame
          key={JSON.stringify(adv.equipped) + adv.perks.join()}
          state={adv}
          onCoinsChange={(coins, best) => patch({ coins, best })}
        />
      ) : (
        <Shop state={adv} onUpdate={patch} />
      )}
    </div>
  )
}
