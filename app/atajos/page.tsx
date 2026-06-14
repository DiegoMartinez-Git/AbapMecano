'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { PracticeMode } from '@/components/shortcuts/PracticeMode'
import { SHORTCUTS, CATEGORIES, type ShortcutCategory } from '@/lib/shortcuts'
import { cn } from '@/lib/utils'

function KeyBadge({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 rounded-md font-mono text-xs font-semibold bg-[var(--color-surface-2)] border border-b-2 border-[var(--color-border)] text-[var(--color-text-main)] min-w-[1.75rem]">
      {k}
    </kbd>
  )
}

const TABS = ['Guía', 'Práctica'] as const
type Tab = typeof TABS[number]

export default function AtajosPage() {
  const [tab, setTab]           = useState<Tab>('Guía')
  const [activeCategory, setActiveCategory] = useState<ShortcutCategory>('windows')
  const [filter, setFilter]     = useState('')

  const categoryShortcuts = SHORTCUTS.filter((s) => s.category === activeCategory)
  const filtered = filter
    ? categoryShortcuts.filter(
        (s) =>
          s.action.toLowerCase().includes(filter.toLowerCase()) ||
          s.description.toLowerCase().includes(filter.toLowerCase()) ||
          s.keys.some((k) => k.toLowerCase().includes(filter.toLowerCase()))
      )
    : categoryShortcuts

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Atajos de Teclado</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Aprende los atajos más importantes · Practica hasta dominarlos
          </p>
        </div>

        {/* Tabs Guía / Práctica */}
        <div className="flex items-center bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)] w-fit mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Selector de categoría */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(Object.entries(CATEGORIES) as [ShortcutCategory, typeof CATEGORIES[ShortcutCategory]][]).map(
            ([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border',
                  activeCategory === key
                    ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)]/50 text-[var(--color-text-main)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border)]'
                )}
              >
                <span>{icon}</span>
                {label}
                <span className="text-[10px] font-mono bg-[var(--color-border)] px-1.5 py-0.5 rounded-full">
                  {SHORTCUTS.filter((s) => s.category === key).length}
                </span>
              </button>
            )
          )}
        </div>

        {/* ── GUÍA ──────────────────────────────────────────────────── */}
        {tab === 'Guía' && (
          <>
            {/* Buscador */}
            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar atajo o acción…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {/* Lista de atajos */}
            <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
              {filtered.length === 0 ? (
                <p className="text-center py-10 text-sm text-[var(--color-text-dim)]">
                  No se encontraron atajos para &quot;{filter}&quot;
                </p>
              ) : (
                filtered.map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 gap-4',
                      i < filtered.length - 1 && 'border-b border-[var(--color-border-subtle)]'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-main)]">{s.action}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.keys.map((k, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <KeyBadge k={k} />
                          {ki < s.keys.length - 1 && (
                            <span className="text-[var(--color-text-dim)] text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-[var(--color-text-dim)] text-center mt-5">
              {SHORTCUTS.filter((s) => s.category === activeCategory).length} atajos en esta categoría · Cambia a <strong className="text-[var(--color-text-muted)]">Práctica</strong> para entrenarlos interactivamente
            </p>
          </>
        )}

        {/* ── PRÁCTICA ──────────────────────────────────────────────── */}
        {tab === 'Práctica' && (
          <PracticeMode
            shortcuts={categoryShortcuts}
            category={activeCategory}
          />
        )}
      </main>
    </>
  )
}
