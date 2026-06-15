'use client'

import { useState, useTransition } from 'react'
import { buyItem, equipItem } from '@/lib/actions'
import { SHOP_ITEMS, SLOT_LABELS, DEFAULT_SKIN } from '@/lib/shop'
import type { AdventureState, ItemSlot, ShopItem } from '@/types'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

interface Props {
  state: AdventureState
  onUpdate: (patch: Partial<AdventureState>) => void
}

const SLOTS: ItemSlot[] = ['skin', 'hat', 'pet', 'trail']

export function Shop({ state, onUpdate }: Props) {
  const pushToast = useToastStore((s) => s.push)
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  function handleBuy(item: ShopItem) {
    setBusyId(item.id)
    startTransition(async () => {
      const res = await buyItem(item.id)
      setBusyId(null)
      if (res.error) {
        pushToast({ type: 'error', icon: '⚠️', title: 'No se pudo comprar', description: res.error })
        return
      }
      onUpdate({ coins: res.coins, owned: res.owned, equipped: res.equipped, perks: res.perks })
      pushToast({ type: 'success', icon: '🛍️', title: '¡Comprado!', description: item.name })
    })
  }

  function handleEquip(item: ShopItem) {
    setBusyId(item.id)
    startTransition(async () => {
      const res = await equipItem(item.id)
      setBusyId(null)
      if (res.error) {
        pushToast({ type: 'error', icon: '⚠️', title: 'Error', description: res.error })
        return
      }
      onUpdate({ coins: res.coins, owned: res.owned, equipped: res.equipped, perks: res.perks })
    })
  }

  const perks = SHOP_ITEMS.filter((i) => i.type === 'perk')

  return (
    <div className="w-full">
      {/* Saldo */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--color-text-muted)]">Gasta tus monedas en mejoras y estilo.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
          <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /></svg>
          <span className="font-mono font-bold text-[#fbbf24]">{state.coins}</span>
        </div>
      </div>

      {/* Cosméticos por slot */}
      {SLOTS.map((slot) => {
        const items = SHOP_ITEMS.filter((i) => i.type === slot)
        return (
          <section key={slot} className="mb-8">
            <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-dim)] font-semibold mb-3">{SLOT_LABELS[slot]}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => {
                const owned    = state.owned.includes(item.id) || item.id === DEFAULT_SKIN
                const equipped = state.equipped[slot] === item.id
                return (
                  <Card
                    key={item.id}
                    item={item}
                    owned={owned}
                    equipped={equipped}
                    coins={state.coins}
                    busy={pending && busyId === item.id}
                    onBuy={() => handleBuy(item)}
                    onEquip={() => handleEquip(item)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Mejoras */}
      <section className="mb-4">
        <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-dim)] font-semibold mb-3">Mejoras jugables</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {perks.map((item) => {
            const owned = state.owned.includes(item.id)
            return (
              <Card
                key={item.id}
                item={item}
                owned={owned}
                equipped={owned}
                coins={state.coins}
                busy={pending && busyId === item.id}
                onBuy={() => handleBuy(item)}
                onEquip={() => {}}
                isPerk
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Preview({ item }: { item: ShopItem }) {
  if (item.type === 'skin') {
    return (
      <svg width="40" height="44" viewBox="0 0 56 60">
        <rect x="18" y="26" width="20" height="24" rx="10" fill={item.color} />
        <circle cx="28" cy="16" r="11" fill={item.color} />
        <circle cx="32" cy="15" r="1.8" fill="#0a0a0f" />
      </svg>
    )
  }
  if (item.type === 'trail') {
    return (
      <div className="flex items-center gap-1">
        {[6, 5, 4, 3].map((s, i) => (
          <span key={i} className="rounded-full" style={{ width: s, height: s, background: item.trailColor, opacity: 1 - i * 0.22 }} />
        ))}
      </div>
    )
  }
  return <span className="text-3xl">{item.glyph}</span>
}

function Card({
  item, owned, equipped, coins, busy, onBuy, onEquip, isPerk,
}: {
  item: ShopItem
  owned: boolean
  equipped: boolean
  coins: number
  busy: boolean
  onBuy: () => void
  onEquip: () => void
  isPerk?: boolean
}) {
  const affordable = coins >= item.price
  return (
    <div className={cn(
      'rounded-md border p-4 flex flex-col items-center text-center transition-colors',
      equipped ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
    )}>
      <div className="h-12 flex items-center justify-center mb-2"><Preview item={item} /></div>
      <div className="font-medium text-sm text-[var(--color-text-main)]">{item.name}</div>
      <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 mb-3 leading-snug min-h-[28px]">{item.description}</div>

      {owned ? (
        isPerk ? (
          <span className="w-full py-1.5 rounded-md text-xs font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)]">Activa</span>
        ) : equipped ? (
          <span className="w-full py-1.5 rounded-md text-xs font-semibold bg-[var(--color-accent)]/15 text-[var(--color-accent)]">Equipado</span>
        ) : (
          <button
            onClick={onEquip}
            disabled={busy}
            className="w-full py-1.5 rounded-md text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50"
          >
            {busy ? '…' : 'Equipar'}
          </button>
        )
      ) : (
        <button
          onClick={onBuy}
          disabled={busy || !affordable}
          className={cn(
            'w-full py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors',
            affordable ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-dim)] cursor-not-allowed'
          )}
        >
          {busy ? '…' : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /></svg>
              {item.price}
            </>
          )}
        </button>
      )}
    </div>
  )
}
