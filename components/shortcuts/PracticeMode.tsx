'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Shortcut, ShortcutCategory } from '@/lib/shortcuts'
import { normalizeKeyEvent, CATEGORIES } from '@/lib/shortcuts'
import { saveShortcutProgress } from '@/lib/actions'

interface Props {
  shortcuts: Shortcut[]
  category: ShortcutCategory
}

type Result = 'correct' | 'wrong' | null

function KeyBadge({ k, pressed }: { k: string; pressed?: boolean }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg font-mono text-sm font-semibold min-w-[2rem]',
        'border-b-2 transition-all duration-75',
        pressed
          ? 'bg-[var(--color-accent)] border-[var(--color-accent-dim)] text-white scale-95'
          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-main)]'
      )}
    >
      {k}
    </kbd>
  )
}

export function PracticeMode({ shortcuts, category }: Props) {
  const [index, setIndex]             = useState(0)
  const [result, setResult]           = useState<Result>(null)
  const [score, setScore]             = useState({ correct: 0, wrong: 0 })
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [showHint, setShowHint]       = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const hintTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = shortcuts[index % shortcuts.length]

  const nextShortcut = useCallback(() => {
    setResult(null)
    setShowHint(false)
    setPressedKeys(new Set())
    setIndex((i) => i + 1)
  }, [])

  const handleCorrect = useCallback(() => {
    if (result) return
    setResult('correct')
    setScore((s) => ({ ...s, correct: s.correct + 1 }))
    // Save progress to Supabase (fire and forget)
    saveShortcutProgress(current.id, category, true).then(() => {})
    resultTimerRef.current = setTimeout(nextShortcut, 800)
  }, [result, nextShortcut, current, category])

  const handleWrong = useCallback(() => {
    if (result) return
    setResult('wrong')
    setScore((s) => ({ ...s, wrong: s.wrong + 1 }))
    saveShortcutProgress(current.id, category, false).then(() => {})
    resultTimerRef.current = setTimeout(() => {
      setResult(null)
      setPressedKeys(new Set())
    }, 1000)
  }, [result, current, category])

  useEffect(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    setShowHint(false)
    hintTimerRef.current = setTimeout(() => setShowHint(true), 4000)
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current) }
  }, [index])

  useEffect(() => {
    return () => { if (resultTimerRef.current) clearTimeout(resultTimerRef.current) }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (result) return

      const combo = normalizeKeyEvent(e)
      setPressedKeys((prev) => new Set([...prev, e.key.toLowerCase()]))

      if (combo === current.comboStr) {
        handleCorrect()
      } else if (!['control', 'alt', 'shift', 'meta'].includes(e.key.toLowerCase())) {
        if (combo !== current.comboStr) handleWrong()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev)
        next.delete(e.key.toLowerCase())
        return next
      })
    }

    // capture:true fires before browser processes the event (needed for Ctrl+N, Ctrl+P, etc.)
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
    }
  }, [current, result, handleCorrect, handleWrong])

  const total = score.correct + score.wrong
  const pct   = total ? Math.round((score.correct / total) * 100) : 0
  const cat   = CATEGORIES[category]

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Score header */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[var(--color-success)] font-semibold">✓ {score.correct}</span>
        <span className="text-[var(--color-text-dim)]">·</span>
        <span className="text-[var(--color-error)] font-semibold">✗ {score.wrong}</span>
        {total > 0 && (
          <>
            <span className="text-[var(--color-text-dim)]">·</span>
            <span className="text-[var(--color-accent)] font-semibold">{pct}% precisión</span>
          </>
        )}
        {score.correct >= 5 && (
          <>
            <span className="text-[var(--color-text-dim)]">·</span>
            <span className="text-[10px] text-[var(--color-text-dim)]">Progreso guardado</span>
          </>
        )}
      </div>

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-full max-w-lg rounded-2xl border p-8 flex flex-col items-center gap-6 transition-colors duration-200',
            result === 'correct' && 'border-[var(--color-success)]/50 bg-[var(--color-success)]/5',
            result === 'wrong'   && 'border-[var(--color-error)]/50   bg-[var(--color-error)]/5',
            !result              && 'border-[var(--color-border)]      bg-[var(--color-surface)]'
          )}
        >
          <span className="text-xs text-[var(--color-text-dim)] font-medium">
            {cat.icon} {cat.label}
          </span>

          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-main)] mb-2">
              {current.action}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {current.description}
            </p>
          </div>

          <AnimatePresence>
            {result === 'correct' && (
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[var(--color-success)] font-semibold text-lg"
              >
                ✓ ¡Correcto!
              </motion.p>
            )}
            {result === 'wrong' && (
              <motion.div
                initial={{ x: -6 }}
                animate={{ x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="text-[var(--color-error)] font-semibold">✗ No es esa</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {current.keys.map((k, i) => (
                    <span key={i}>
                      <KeyBadge k={k} />
                      {i < current.keys.length - 1 && (
                        <span className="text-[var(--color-text-dim)] mx-0.5">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            {!result && showHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs text-[var(--color-text-dim)]">Pista:</span>
                {current.keys.map((k, i) => (
                  <span key={i}>
                    <KeyBadge k={k} />
                    {i < current.keys.length - 1 && (
                      <span className="text-[var(--color-text-dim)] mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && pressedKeys.size > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {Array.from(pressedKeys).map((k) => (
                <KeyBadge key={k} k={k} pressed />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-[var(--color-text-dim)]">
        La pista aparece sola · pulsa <kbd className="font-mono bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px]">→</kbd> para saltar
      </p>
    </div>
  )
}
