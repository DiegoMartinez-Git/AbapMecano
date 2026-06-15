'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { signOut } from '@/lib/actions'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/',             label: 'Mecanografía' },
  { href: '/curso',        label: 'Curso' },
  { href: '/practica',     label: 'Práctica' },
  { href: '/aventura',     label: 'Aventura' },
  { href: '/ranking',      label: 'Ranking' },
  { href: '/estadisticas', label: 'Estadísticas' },
]

function XpBar({ xp, level }: { xp: number; level: number }) {
  const xpForCurrentLevel = (level - 1) ** 2 * 100
  const xpForNextLevel    = level ** 2 * 100
  const progress = Math.min(((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-[var(--color-accent)]">Nv.{level}</span>
      <div className="w-16 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-[var(--color-text-dim)] font-mono">{xp} XP</span>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile, loading } = useUser()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <Link href="/" className="shrink-0">
          <span className="font-mono font-bold text-lg tracking-tight">
            <span className="text-[var(--color-accent)]">ABAP</span>Mecano
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-text-main)] bg-[var(--color-surface-2)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="w-24 h-4 rounded-full bg-[var(--color-surface)] animate-pulse" />
          ) : user ? (
            <>
              {profile && <XpBar xp={profile.xp} level={profile.level} />}

              {(profile?.coins ?? 0) > 0 && (
                <Link href="/aventura" className="flex items-center gap-1 text-xs font-mono font-semibold text-[#fbbf24] hover:opacity-80 transition-opacity" title="Monedas de aventura">
                  <svg width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /></svg>
                  {profile?.coins}
                </Link>
              )}

              {(profile?.streak_days ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-warning)] font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2C9 6 5 9 5 14a7 7 0 0 0 14 0c0-5-3-8-7-12zm0 18a5 5 0 0 1-5-5c0-3 2-6 5-9 3 3 5 6 5 9a5 5 0 0 1-5 5z"/>
                  </svg>
                  {profile?.streak_days}
                </span>
              )}

              <Link
                href="/perfil"
                className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-xs font-semibold text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                title={profile?.username ?? user.email ?? ''}
              >
                {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
              </Link>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {signingOut ? '...' : 'Salir'}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)] font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
