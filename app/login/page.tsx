'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type View = 'login' | 'register' | 'forgot' | 'sent'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView]         = useState<View>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sentMsg, setSentMsg]   = useState('Enviamos un enlace de recuperación a')
  const supabase = createClient()

  function reset(next: View) {
    setErrorMsg('')
    setPassword('')
    setConfirm('')
    setView(next)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : error.message)
      setLoading(false)
      return
    }
    // Sesión creada en cliente: navegamos al inicio y refrescamos los
    // Server Components para que lean la nueva sesión (cookies).
    router.replace('/')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setErrorMsg('Las contraseñas no coinciden.'); return }
    if (password.length < 6)  { setErrorMsg('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true); setErrorMsg('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      // Confirmación de email desactivada: ya hay sesión, vamos al inicio.
      router.replace('/')
      router.refresh()
      return
    }
    // Confirmación de email activada: no hay sesión todavía, pedimos al
    // usuario que revise su correo en lugar de quedarnos cargando.
    setSentMsg('Enviamos un enlace de confirmación a')
    setLoading(false)
    setView('sent')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (error) setErrorMsg(error.message)
    else { setSentMsg('Enviamos un enlace de recuperación a'); setView('sent') }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-bg)]">
      {/* Wordmark */}
      <div className="mb-10">
        <span className="font-mono text-3xl font-bold tracking-tight">
          <span className="text-[var(--color-accent)]">ABAP</span>Mecano
        </span>
      </div>

      <div className="w-full max-w-sm rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] p-8">

        {/* ── Email sent ── */}
        {view === 'sent' && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-success)]">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text-main)]">Revisa tu email</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {sentMsg} <span className="text-[var(--color-accent)]">{email}</span>
              </p>
            </div>
            <button onClick={() => reset('login')} className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] underline">
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {/* ── Tabs login / register ── */}
        {(view === 'login' || view === 'register') && (
          <>
            <div className="flex rounded-md bg-[var(--color-surface-2)] p-1 mb-6">
              <button
                onClick={() => reset('login')}
                className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all', view === 'login' ? 'bg-[var(--color-bg)] text-[var(--color-text-main)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => reset('register')}
                className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all', view === 'register' ? 'bg-[var(--color-bg)] text-[var(--color-text-main)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--color-text-muted)] font-medium">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={cn('w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors', errorMsg ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--color-text-muted)] font-medium">Contraseña</label>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={cn('w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors', errorMsg ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]')}
                />
              </div>

              {view === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[var(--color-text-muted)] font-medium">Confirmar contraseña</label>
                  <input
                    type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    className={cn('w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors', errorMsg ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]')}
                  />
                </div>
              )}

              {errorMsg && <p className="text-xs text-[var(--color-error)]">{errorMsg}</p>}

              <button
                type="submit" disabled={loading}
                className={cn('w-full py-2.5 rounded-md text-sm font-semibold transition-all bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)]', loading && 'opacity-60 cursor-not-allowed')}
              >
                {loading ? '…' : view === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>

            {view === 'login' && (
              <button onClick={() => reset('forgot')} className="mt-4 w-full text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] text-center transition-colors">
                ¿Olvidaste la contraseña?
              </button>
            )}
          </>
        )}

        {/* ── Forgot password ── */}
        {view === 'forgot' && (
          <>
            <h1 className="text-lg font-semibold text-[var(--color-text-main)] mb-1">Recuperar contraseña</h1>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Te enviamos un enlace para crear una nueva contraseña.
            </p>
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--color-text-muted)] font-medium">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              {errorMsg && <p className="text-xs text-[var(--color-error)]">{errorMsg}</p>}
              <button
                type="submit" disabled={loading}
                className={cn('w-full py-2.5 rounded-md text-sm font-semibold transition-all bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)]', loading && 'opacity-60 cursor-not-allowed')}
              >
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
            <button onClick={() => reset('login')} className="mt-4 w-full text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] text-center">
              Volver al inicio de sesión
            </button>
          </>
        )}
      </div>
    </div>
  )
}
