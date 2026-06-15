'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState('')
  const [ready, setReady]         = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase puts the session in the URL hash after clicking the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-bg)]">
      <div className="mb-10">
        <span className="font-mono text-3xl font-bold tracking-tight">
          <span className="text-[var(--color-accent)]">ABAP</span>Mecano
        </span>
      </div>

      <div className="w-full max-w-sm rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        {!ready ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Verificando enlace…</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-[var(--color-text-main)] mb-1">Nueva contraseña</h1>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Elige una contraseña segura para tu cuenta.</p>

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--color-text-muted)] font-medium">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--color-text-muted)] font-medium">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className={cn(
                    'w-full px-3 py-2.5 rounded-md text-sm bg-[var(--color-surface-2)] border text-[var(--color-text-main)]',
                    'placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-accent)] transition-colors',
                    errorMsg ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  )}
                />
              </div>

              {errorMsg && <p className="text-xs text-[var(--color-error)]">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-2.5 rounded-md text-sm font-semibold transition-all',
                  'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)]',
                  loading && 'opacity-60 cursor-not-allowed'
                )}
              >
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
