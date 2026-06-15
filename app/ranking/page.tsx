import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'

type RankingRow = {
  rank: number
  user_id: string
  username: string
  level: number
  wpm: number
  accuracy: number
  completed_at: string
}

const TABS = [
  { label: '60s',       mode: 'timed', time_limit: 60,  word_count: null },
  { label: '30s',       mode: 'timed', time_limit: 30,  word_count: null },
  { label: '120s',      mode: 'timed', time_limit: 120, word_count: null },
  { label: '50 palabras', mode: 'words', time_limit: null, word_count: 50 },
  { label: '100 palabras', mode: 'words', time_limit: null, word_count: 100 },
] as const

function getMedal(rank: number) {
  if (rank === 1) return { bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', text: 'text-yellow-400', badge: '1' }
  if (rank === 2) return { bg: 'bg-slate-400/10',  border: 'border-slate-400/40',  text: 'text-slate-400',  badge: '2' }
  if (rank === 3) return { bg: 'bg-amber-700/10',  border: 'border-amber-700/40',  text: 'text-amber-600',  badge: '3' }
  return null
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const tabIdx = Math.min(Math.max(parseInt(params.tab ?? '0', 10) || 0, 0), TABS.length - 1)
  const activeTab = TABS[tabIdx]

  const { data: rows, error } = await supabase.rpc('get_ranking', {
    p_mode:        activeTab.mode,
    p_time_limit:  activeTab.time_limit ?? 60,
    p_word_count:  activeTab.word_count,
    p_limit:       50,
  })

  const ranking: RankingRow[] = (rows ?? []) as RankingRow[]
  const myRank = ranking.find((r) => r.user_id === user.id)

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Ranking Global</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Top 50 jugadores · mejor marca personal por categoría
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-md p-1 border border-[var(--color-border)] w-fit mb-8 flex-wrap">
          {TABS.map((tab, i) => (
            <a
              key={i}
              href={`/ranking?tab=${i}`}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                i === tabIdx
                  ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Your position (if not in top 50) */}
        {myRank && myRank.rank > 10 && (
          <div className="mb-4 px-5 py-3 rounded-md bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">
              Tu posición actual
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-[var(--color-accent)]">
                #{myRank.rank}
              </span>
              <span className="text-sm font-mono text-[var(--color-text-main)]">
                {myRank.wpm} PPM
              </span>
            </div>
          </div>
        )}

        {/* Table */}
        {error ? (
          <p className="text-sm text-[var(--color-error)] text-center py-12">
            Error al cargar el ranking.
          </p>
        ) : ranking.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-dim)]">
            <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <p className="text-sm">Todavía nadie ha completado un test en esta categoría.</p>
            <p className="text-xs mt-1 text-[var(--color-text-dim)]">¡Sé el primero!</p>
          </div>
        ) : (
          <div className="rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['#', 'Jugador', 'Nivel', 'PPM', 'Precisión', 'Fecha'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, i) => {
                  const medal   = getMedal(row.rank)
                  const isMe    = row.user_id === user.id
                  return (
                    <tr
                      key={row.user_id}
                      className={cn(
                        'transition-colors',
                        i < ranking.length - 1 && 'border-b border-[var(--color-border-subtle)]',
                        isMe && 'bg-[var(--color-accent)]/5',
                        !isMe && 'hover:bg-[var(--color-surface-2)]/40'
                      )}
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5 w-12">
                        {medal ? (
                          <span className={cn(
                            'inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold',
                            medal.bg, medal.border, medal.text
                          )}>
                            {medal.badge}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-dim)] font-mono text-xs">
                            {row.rank}
                          </span>
                        )}
                      </td>

                      {/* Username */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)] shrink-0">
                            {row.username[0].toUpperCase()}
                          </div>
                          <span className={cn(
                            'font-medium',
                            isMe ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-main)]'
                          )}>
                            {row.username}
                            {isMe && (
                              <span className="ml-1.5 text-[10px] font-normal text-[var(--color-text-dim)]">
                                (tú)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-semibold text-[var(--color-accent)]/70">
                          Nv.{row.level}
                        </span>
                      </td>

                      {/* WPM */}
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'font-mono font-bold tabular-nums text-base',
                          row.rank === 1 ? 'text-yellow-400' : 'text-[var(--color-accent)]'
                        )}>
                          {row.wpm}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="px-5 py-3.5 font-mono text-[var(--color-text-muted)] text-sm">
                        {Number(row.accuracy).toFixed(1)}%
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-[var(--color-text-dim)] text-xs">
                        {new Date(row.completed_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-center text-[var(--color-text-dim)] mt-5">
          Se muestra la mejor marca personal de cada jugador · Actualizado en tiempo real
        </p>
      </main>
    </>
  )
}
