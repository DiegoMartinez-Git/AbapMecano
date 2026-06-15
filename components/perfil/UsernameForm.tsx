'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUsername } from '@/lib/actions'

interface UsernameFormProps {
  currentUsername: string
}

export function UsernameForm({ currentUsername }: UsernameFormProps) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(currentUsername)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    if (value.trim() === currentUsername) { setEditing(false); return }
    setLoading(true)
    setError(null)
    const result = await updateUsername(value.trim())
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEditing(false)
      router.refresh()
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors mt-1 group"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>Editar nombre</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') { setValue(currentUsername); setEditing(false) }
        }}
        maxLength={30}
        className="px-2 py-1 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-accent)]/50 text-sm text-[var(--color-text-main)] focus:outline-none font-medium w-40"
      />
      <button
        onClick={handleSave}
        disabled={loading || value.trim().length < 2}
        className="text-xs px-3 py-1 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)] font-medium transition-colors disabled:opacity-40"
      >
        {loading ? '...' : 'Guardar'}
      </button>
      <button
        onClick={() => { setValue(currentUsername); setEditing(false); setError(null) }}
        className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
    </div>
  )
}
