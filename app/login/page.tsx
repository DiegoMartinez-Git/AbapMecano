'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [status, setStatus]     = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-bg)]">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="13" rx="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">
          Dev<span className="text-[var(--color-accent)]">Type</span>
        </span>
        <p className="text-sm text-[var(--color-text-muted)] text-center max-w-xs">
          Plataforma de mecanografía para desarrolladores. Mejora tu velocidad mientras aprendes SAP y ABAP.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-success)]">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text-main)]">Revisa tu email</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Enviamos un enlace de acceso a <span className="text-[var(--color-accent)]">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] underline"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-[var(--color-text-main)] mb-1">Acceder</h1>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Introduce tu email y te enviamos un enlace mágico.
            </p>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs text-[var(--color-text-muted)] font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--color-surface-2)] border text-[var(--color-text-main)]',
                    'placeholder:text-[var(--color-text-dim)] outline-none',
                    'focus:border-[var(--color-accent)] transition-colors',
                    status === 'error' ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  )}
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-[var(--color-error)]">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-white',
                  status === 'loading' && 'opacity-60 cursor-not-allowed'
                )}
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>

            <p className="text-xs text-[var(--color-text-dim)] text-center mt-6">
              Sin contraseña · Sin tracking · Solo para mejorar
            </p>
          </>
        )}
      </div>
    </div>
  )
}
