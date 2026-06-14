import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { WpmChart } from '@/components/stats/WpmChart'
import { ErrorHeatmap } from '@/components/stats/ErrorHeatmap'
import { getStatistics } from '@/lib/actions'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-1">{label}</p>
      <p className="text-3xl font-mono font-bold text-[var(--color-text-main)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>}
    </div>
  )
}

function ModeBar({ label, wpm, max }: { label: string; wpm: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--color-text-muted)] w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
          style={{ width: `${max ? (wpm / max) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-[var(--color-accent)] w-14 text-right">
        {wpm} PPM
      </span>
    </div>
  )
}

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stats = await getStatistics()
  if (!stats) redirect('/login')

  const { profile, recent, bestPerMode, achievements: userAch, allAchievements: allAch, totalTests, aggregatedErrors } = stats

  const avgWpm      = recent?.length
    ? Math.round(recent.reduce((s, r) => s + r.wpm, 0) / recent.length)
    : 0
  const avgAccuracy = recent?.length
    ? (recent.reduce((s, r) => s + Number(r.accuracy), 0) / recent.length).toFixed(1)
    : '100.0'
  const bestWpm     = bestPerMode?.[0]?.wpm ?? 0

  const bests60  = bestPerMode?.filter(r => r.mode === 'timed' && r.time_limit === 60)[0]?.wpm ?? 0
  const bests30  = bestPerMode?.filter(r => r.mode === 'timed' && r.time_limit === 30)[0]?.wpm ?? 0
  const bests15  = bestPerMode?.filter(r => r.mode === 'timed' && r.time_limit === 15)[0]?.wpm ?? 0
  const bests25w = bestPerMode?.filter(r => r.mode === 'words' && r.word_count === 25)[0]?.wpm ?? 0
  const maxMode  = Math.max(bests60, bests30, bests15, bests25w, 1)

  const chartData = (recent ?? []).map((r) => ({
    wpm:  r.wpm,
    date: new Date(r.completed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
  }))

  const unlockedIds = new Set(userAch?.map((a) => a.achievement_id) ?? [])

  const today   = new Date()
  const days7   = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const byDay   = Object.fromEntries(days7.map((d) => [d, 0]))
  recent?.forEach((r) => {
    const day = r.completed_at.slice(0, 10)
    if (day in byDay) byDay[day]++
  })
  const dayEntries = days7.map((d) => ({
    label: new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
    count: byDay[d],
  }))
  const maxDay = Math.max(...dayEntries.map((d) => d.count), 1)

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Estadísticas</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Tu progreso como mecanógrafo desarrollador
          </p>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Tests totales"   value={totalTests ?? 0} />
          <StatCard label="PPM promedio"    value={avgWpm}          sub="últimos 30 tests" />
          <StatCard label="Mejor marca"     value={`${bestWpm}`}    sub="PPM en cualquier modo" />
          <StatCard label="Precisión media" value={`${avgAccuracy}%`} />
        </div>

        {/* WPM chart */}
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
            Evolución de velocidad (últimos 30 tests)
          </h2>
          {chartData.length > 0
            ? <WpmChart data={chartData} />
            : <p className="text-center py-8 text-sm text-[var(--color-text-dim)]">Sin datos aún. ¡Completa tu primer test!</p>
          }
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weekly activity */}
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-5">
              Actividad (últimos 7 días)
            </h2>
            <div className="flex items-end justify-between gap-2 h-20">
              {dayEntries.map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${count ? (count / maxDay) * 60 : 2}px`,
                        background: count ? 'var(--color-accent)' : 'var(--color-border)',
                        opacity: count ? 1 : 0.4,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-dim)] capitalize">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Records by mode */}
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-5">
              Récords personales por modo
            </h2>
            <div className="flex flex-col gap-3">
              <ModeBar label="⏱ 15s"  wpm={bests15}  max={maxMode} />
              <ModeBar label="⏱ 30s"  wpm={bests30}  max={maxMode} />
              <ModeBar label="⏱ 60s"  wpm={bests60}  max={maxMode} />
              <ModeBar label="# 25p"   wpm={bests25w} max={maxMode} />
            </div>
          </div>
        </div>

        {/* Error heatmap */}
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
            Heatmap de errores por tecla
          </h2>
          <p className="text-xs text-[var(--color-text-dim)] mb-4">
            Qué caracteres te cuestan más — cuanto más rojo, más errores
          </p>
          <ErrorHeatmap errors={aggregatedErrors ?? {}} />
        </div>

        {/* Achievements */}
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-5">
            Logros ({unlockedIds.size}/{allAch?.length ?? 0})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(allAch ?? []).map((ach) => {
              const isUnlocked = unlockedIds.has(ach.id)
              const unlockDate = userAch?.find((u) => u.achievement_id === ach.id)?.unlocked_at
              return (
                <div
                  key={ach.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    isUnlocked
                      ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5'
                      : 'border-[var(--color-border)] opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl leading-none mt-0.5">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-main)] leading-snug">
                      {ach.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
                      {ach.description}
                    </p>
                    {isUnlocked && unlockDate ? (
                      <p className="text-[10px] text-[var(--color-accent)] mt-1 font-medium">
                        +{ach.xp_reward} XP · {new Date(unlockDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
                        +{ach.xp_reward} XP al desbloquear
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
