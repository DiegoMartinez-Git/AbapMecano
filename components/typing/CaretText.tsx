'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CaretTextProps {
  text: string
  typed: string
  /** Mostrar el caret (ocultar al terminar) */
  showCaret?: boolean
  /** Clase de tamaño de fuente Tailwind (p.ej. 'text-2xl') */
  textSize?: string
  className?: string
}

/**
 * Texto con caret suave estilo MonkeyType: el cursor se mide en el DOM
 * (offsetLeft/offsetTop del carácter actual) y se desplaza con un muelle,
 * por lo que siempre cae exactamente en la letra que toca escribir.
 */
export function CaretText({
  text, typed, showCaret = true, textSize = 'text-2xl', className,
}: CaretTextProps) {
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 28, fs: 24 })
  const [recent, setRecent] = useState(false)
  const curRef = useRef<HTMLSpanElement>(null)
  const recentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!curRef.current) return
    const el = curRef.current
    const fs = parseFloat(window.getComputedStyle(el).fontSize) || 24
    setCaret({ x: el.offsetLeft, y: el.offsetTop, h: el.offsetHeight || 28, fs })
    setRecent(true)
    if (recentTimer.current) clearTimeout(recentTimer.current)
    recentTimer.current = setTimeout(() => setRecent(false), 600)
  }, [typed])

  const atEnd = typed.length >= text.length
  const caretVisible = showCaret && !atEnd

  return (
    <div className={cn('relative font-mono tracking-wide leading-[2.1]', textSize, className)}>
      {text.split('').map((char, i) => {
        const isCorrect   = i < typed.length && typed[i] === char
        const isIncorrect = i < typed.length && typed[i] !== char
        const isCurrent   = i === typed.length
        return (
          <span
            key={i}
            ref={isCurrent ? curRef : undefined}
            className={cn(
              'transition-colors duration-75',
              isCorrect   && 'text-[var(--color-char-correct)]',
              isIncorrect && 'text-[var(--color-char-incorrect)] bg-[var(--color-error)]/10 rounded-[2px]',
              !isCorrect && !isIncorrect && 'text-[var(--color-char-pending)]',
            )}
          >
            {char}
          </span>
        )
      })}

      {caretVisible && (
        <motion.div
          className="absolute top-0 left-0 w-[3px] rounded-full pointer-events-none z-20 bg-[var(--color-cursor)]"
          style={{ boxShadow: '0 0 10px var(--color-cursor)' }}
          animate={{
            x: caret.x - 1,
            y: caret.y + (caret.h - caret.fs * 0.8) / 2,
            height: caret.fs * 0.8,
            opacity: recent ? 1 : [1, 1, 0, 0, 1, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 600, damping: 38, mass: 0.4 },
            y: { type: 'spring', stiffness: 600, damping: 38, mass: 0.4 },
            height: { duration: 0.05 },
            opacity: recent
              ? { duration: 0.05 }
              : { duration: 1.1, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 0.95, 1] },
          }}
        />
      )}
    </div>
  )
}
