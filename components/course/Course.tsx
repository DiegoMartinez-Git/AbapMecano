'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { LESSONS, generateLessonText, computeStars, type Lesson } from '@/lib/lessons'
import { saveLessonResult } from '@/lib/actions'
import { TypingTest } from '@/components/typing/TypingTest'
import type { TestResult, LessonProgressRow } from '@/types'

type Progress = Record<string, LessonProgressRow>

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= count ? 'var(--color-accent)' : 'none'}
          stroke={i <= count ? 'var(--color-accent)' : 'var(--color-text-dim)'}
          strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

export function Course({ initialProgress }: { initialProgress: Progress }) {
  const [progress, setProgress] = useState<Progress>(initialProgress)
  const [active, setActive] = useState<Lesson | null>(null)

  const isUnlocked = (idx: number) =>
    idx === 0 || (progress[LESSONS[idx - 1].id]?.stars ?? 0) >= 1

  if (active) {
    return (
      <LessonView
        lesson={active}
        progress={progress}
        onProgress={(id, row) => setProgress((p) => ({ ...p, [id]: row }))}
        onExit={() => setActive(null)}
        onNext={() => {
          const idx = LESSONS.findIndex((l) => l.id === active.id)
          const next = LESSONS[idx + 1]
          setActive(next ?? null)
        }}
      />
    )
  }

  const completed = Object.values(progress).filter((p) => p.stars >= 1).length

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Curso de mecanografía</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          De la fila central a ABAP, paso a paso · {completed}/{LESSONS.length} lecciones superadas
        </p>
      </div>

      <div className="grid gap-3">
        {LESSONS.map((lesson, idx) => {
          const unlocked = isUnlocked(idx)
          const row = progress[lesson.id]
          const stars = row?.stars ?? 0
          return (
            <button
              key={lesson.id}
              disabled={!unlocked}
              onClick={() => unlocked && setActive(lesson)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-md border text-left transition-colors',
                unlocked
                  ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                  : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 opacity-55 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold shrink-0',
                stars > 0 ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
              )}>
                {lesson.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--color-text-main)]">{lesson.title}</div>
                <div className="font-mono text-xs text-[var(--color-text-dim)] truncate">{lesson.subtitle}</div>
              </div>
              {unlocked ? (
                <Stars count={stars} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LessonView({
  lesson, progress, onProgress, onExit, onNext,
}: {
  lesson: Lesson
  progress: Progress
  onProgress: (id: string, row: LessonProgressRow) => void
  onExit: () => void
  onNext: () => void
}) {
  const [seed, setSeed] = useState(0)
  const [outcome, setOutcome] = useState<{ wpm: number; accuracy: number; stars: number } | null>(null)
  const text = useMemo(() => generateLessonText(lesson), [lesson, seed])

  const idx = LESSONS.findIndex((l) => l.id === lesson.id)
  const hasNext = idx < LESSONS.length - 1

  async function handleResult(result: TestResult) {
    const stars = computeStars(result.wpm, result.accuracy, lesson.minWpm)
    setOutcome({ wpm: result.wpm, accuracy: result.accuracy, stars })
    const res = await saveLessonResult(lesson.id, result.wpm, result.accuracy)
    const finalStars = 'stars' in res ? res.stars : stars
    const prev = progress[lesson.id]
    onProgress(lesson.id, {
      stars:         Math.max(finalStars, prev?.stars ?? 0),
      best_wpm:      Math.max(result.wpm, prev?.best_wpm ?? 0),
      best_accuracy: Math.max(result.accuracy, prev?.best_accuracy ?? 0),
    })
  }

  function retry() {
    setOutcome(null)
    setSeed((s) => s + 1)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Cabecera de la lección */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onExit}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
        >
          ← Curso
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--color-text-main)]">
            {lesson.n}. {lesson.title}
          </h1>
          <p className="text-xs text-[var(--color-text-dim)] font-mono">
            objetivo: precisión ≥ 90% · ≥ {lesson.minWpm} PPM
          </p>
        </div>
      </div>

      {/* Resultado de la lección */}
      {outcome && (
        <div className={cn(
          'mb-6 rounded-md border p-4 flex flex-wrap items-center gap-4',
          outcome.stars > 0 ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : 'border-[var(--color-error)]/40 bg-[var(--color-error)]/5'
        )}>
          <Stars count={outcome.stars} size={20} />
          <div className="text-sm">
            <span className="font-semibold text-[var(--color-text-main)]">
              {outcome.stars > 0 ? '¡Lección superada!' : 'Casi… inténtalo otra vez'}
            </span>
            <span className="text-[var(--color-text-muted)] ml-2 font-mono">
              {outcome.wpm} PPM · {outcome.accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={retry} className="px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors">
              Repetir
            </button>
            {outcome.stars > 0 && hasNext && (
              <button onClick={onNext} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-dim)] transition-colors">
                Siguiente lección →
              </button>
            )}
          </div>
        </div>
      )}

      <TypingTest
        key={`${lesson.id}-${seed}`}
        initialText={text}
        hideSelector
        initialMode="words"
        onComplete={handleResult}
      />
    </div>
  )
}
