import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { TypingTest } from '@/components/typing/TypingTest'
import { getDailyText, getTodayKey } from '@/lib/daily'

export default async function RetoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today     = getTodayKey()
  const dailyText = getDailyText()

  const { count } = await supabase
    .from('typing_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('text_category', 'daily')
    .gte('completed_at', `${today}T00:00:00Z`)
    .lte('completed_at', `${today}T23:59:59Z`)

  const alreadyCompleted = (count ?? 0) > 0

  const { data: todayBest } = await supabase
    .from('typing_results')
    .select('wpm, accuracy')
    .eq('user_id', user.id)
    .eq('text_category', 'daily')
    .gte('completed_at', `${today}T00:00:00Z`)
    .order('wpm', { ascending: false })
    .limit(1)

  const bestToday = todayBest?.[0]

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Reto del día</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              El mismo texto para todos ·{' '}
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {alreadyCompleted && bestToday && (
            <div className="flex flex-col items-end gap-0.5 px-4 py-3 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Completado hoy
              </div>
              <span className="text-2xl font-mono font-bold text-[var(--color-accent)]">{bestToday.wpm} PPM</span>
              <span className="text-[10px] text-[var(--color-text-dim)]">{bestToday.accuracy}% precisión</span>
            </div>
          )}
        </div>

        {/* Text preview */}
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 mb-8">
          <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest mb-2 font-medium">
            Texto de hoy
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-mono">
            {dailyText}
          </p>
          <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
            {dailyText.split(' ').length} palabras · {dailyText.length} caracteres
          </p>
        </div>

        <TypingTest
          initialText={dailyText}
          textCategory="daily"
          hideSelector
          initialMode="words"
        />
      </main>
    </>
  )
}
