import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { UsernameForm } from '@/components/perfil/UsernameForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: results }, { data: bests }] = await Promise.all([
    supabase.from('users_profile').select('*').eq('id', user.id).single(),
    supabase.from('typing_results').select('wpm, accuracy, mode, time_limit, word_count, completed_at')
      .eq('user_id', user.id).order('completed_at', { ascending: false }).limit(10),
    supabase.from('typing_results').select('wpm, accuracy, mode, time_limit, word_count')
      .eq('user_id', user.id).order('wpm', { ascending: false }).limit(5),
  ])

  const xpForLevel = (lvl: number) => lvl ** 2 * 100
  const level      = profile?.level ?? 1
  const xp         = profile?.xp ?? 0
  const xpProgress = ((xp - xpForLevel(level - 1)) / (xpForLevel(level) - xpForLevel(level - 1))) * 100
  const totalTests = results?.length ?? 0
  const avgWpm     = results?.length
    ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length)
    : 0
  const bestWpm    = bests?.[0]?.wpm ?? 0
  const displayName = profile?.username ?? user.email ?? '?'

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">

        {/* Profile header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-2xl font-bold text-[var(--color-accent)]">
            {displayName[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">
              {displayName}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
            <UsernameForm currentUsername={profile?.username ?? ''} />

            {/* XP Bar */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-mono font-semibold text-[var(--color-accent)]">Nv. {level}</span>
              <div className="flex-1 max-w-48 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
              <span className="text-xs text-[var(--color-text-dim)] font-mono">
                {xp} / {xpForLevel(level)} XP
              </span>
            </div>
          </div>

          {profile?.streak_days ? (
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-warning)" stroke="none">
                <path d="M12 2C9 6 5 9 5 14a7 7 0 0 0 14 0c0-5-3-8-7-12zm0 18a5 5 0 0 1-5-5c0-3 2-6 5-9 3 3 5 6 5 9a5 5 0 0 1-5 5z"/>
              </svg>
              <span className="text-sm font-bold text-[var(--color-warning)]">{profile.streak_days}</span>
              <span className="text-[10px] text-[var(--color-text-dim)]">días</span>
            </div>
          ) : null}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Tests realizados', value: totalTests },
            { label: 'PPM promedio',     value: avgWpm },
            { label: 'Mejor marca',      value: `${bestWpm} PPM` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">{label}</span>
              <span className="text-3xl font-mono font-bold text-[var(--color-text-main)]">{value}</span>
            </div>
          ))}
        </div>

        {/* Recent history */}
        {results && results.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-widest">
              Últimos resultados
            </h2>
            <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['PPM', 'Precisión', 'Modo', 'Fecha'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={i < results.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''}>
                      <td className="px-5 py-3 font-mono font-bold text-[var(--color-accent)]">{r.wpm}</td>
                      <td className="px-5 py-3 font-mono text-[var(--color-text-main)]">{r.accuracy}%</td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">
                        {r.mode === 'timed' ? `⏱ ${r.time_limit}s` : `# ${r.word_count}p`}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-text-dim)] text-xs">
                        {new Date(r.completed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {results?.length === 0 && (
          <div className="text-center py-16 text-[var(--color-text-dim)]">
            <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01" />
            </svg>
            <p className="text-sm">Completa tu primer test para ver tu historial aquí.</p>
          </div>
        )}
      </main>
    </>
  )
}
