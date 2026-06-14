'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { signOut } from '@/lib/actions'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/',             label: 'Mecanografía' },
  { href: '/reto',         label: 'Reto diario' },
  { href: '/atajos',       label: 'Atajos' },
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
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-[var(--color-accent)] group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight">
            Dev<span className="text-[var(--color-accent)]">Type</span>
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
              className="px-4 py-1.5 text-sm rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-white font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
