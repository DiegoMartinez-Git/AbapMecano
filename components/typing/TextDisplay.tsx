'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TestStatus } from '@/types'

interface TextDisplayProps {
  text: string
  typed: string
  isFocused: boolean
  status: TestStatus
  shake?: boolean
}

export function TextDisplay({ text, typed, isFocused, status, shake = false }: TextDisplayProps) {
  const [offsetY, setOffsetY]     = useState(0)
  const [caretPos, setCaretPos]   = useState({ x: 0, y: 0, h: 24 })
  const [recentlyTyped, setRecentlyTyped] = useState(false)
  const cursorRef  = useRef<HTMLSpanElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const recentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll the text to keep cursor visible
  useEffect(() => {
    if (typed === '') {
      setOffsetY(0)
      return
    }
    if (!cursorRef.current || !wrapperRef.current) return

    const cursorEl  = cursorRef.current
    const wrapperEl = wrapperRef.current
    const cursorContentY = cursorEl.getBoundingClientRect().top - wrapperEl.getBoundingClientRect().top

    const lineHeight = parseFloat(window.getComputedStyle(cursorEl).lineHeight)
    if (!lineHeight || isNaN(lineHeight)) return

    const currentLine    = Math.floor(cursorContentY / lineHeight)
    const firstVisible   = Math.max(0, currentLine - 1)
    setOffsetY(-firstVisible * lineHeight)
  }, [typed])

  // Animated caret position — uses offsetLeft/offsetTop (no need for getBoundingClientRect)
  useEffect(() => {
    if (!cursorRef.current) return
    const el = cursorRef.current
    setCaretPos({
      x: el.offsetLeft,
      y: el.offsetTop,
      h: el.offsetHeight || 24,
    })

    // Mark as recently typed so caret stays solid
    setRecentlyTyped(true)
    if (recentTimerRef.current) clearTimeout(recentTimerRef.current)
    recentTimerRef.current = setTimeout(() => setRecentlyTyped(false), 500)
  }, [typed])

  const chars = text.split('')
  const showCaret = status !== 'finished'

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'transition-all duration-200',
          (!isFocused || status === 'finished') && 'blur-[3px] opacity-30 select-none pointer-events-none'
        )}
      >
        {/* 3-line viewport */}
        <motion.div
          className="relative w-full overflow-hidden"
          style={{ height: 'calc(3 * 2.75rem)' }}
          animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Top gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-5 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, var(--color-bg), transparent)' }}
          />

          {/* Scrolling text wrapper */}
          <div
            ref={wrapperRef}
            className="relative font-mono text-xl tracking-wide"
            style={{
              transform: `translateY(${offsetY}px)`,
              transition: typed === '' ? 'none' : 'transform 0.12s ease-out',
              lineHeight: '2.2',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {chars.map((char, i) => {
              const isCorrect   = i < typed.length && typed[i] === char
              const isIncorrect = i < typed.length && typed[i] !== char
              const isCurrent   = i === typed.length && showCaret

              return (
                <span
                  key={i}
                  ref={isCurrent ? cursorRef : undefined}
                  className={cn(
                    'transition-colors duration-75',
                    isCorrect   && 'text-[var(--color-char-correct)]',
                    isIncorrect && 'text-[var(--color-char-incorrect)] bg-red-500/10 rounded-[2px]',
                    !isCorrect && !isIncorrect && 'text-[var(--color-char-pending)]',
                  )}
                >
                  {char}
                </span>
              )
            })}

            {/* Animated sliding caret */}
            {showCaret && (
              <motion.div
                className="absolute top-0 left-0 w-0.5 rounded-full pointer-events-none z-20 bg-[var(--color-cursor)]"
                animate={{
                  x: caretPos.x - 1,
                  y: caretPos.y + caretPos.h * 0.12,
                  height: caretPos.h * 0.76,
                  opacity: recentlyTyped ? 1 : [1, 1, 0, 0, 1, 1],
                }}
                transition={{
                  x: { type: 'spring', stiffness: 600, damping: 38, mass: 0.4 },
                  y: { type: 'spring', stiffness: 600, damping: 38, mass: 0.4 },
                  height: { duration: 0.05 },
                  opacity: recentlyTyped
                    ? { duration: 0.05 }
                    : { duration: 1.1, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 0.95, 1] },
                }}
              />
            )}
          </div>

          {/* Bottom gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--color-bg))' }}
          />
        </motion.div>
      </div>

      {/* Click-to-focus overlay */}
      {!isFocused && status !== 'finished' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" />
            </svg>
            Haz clic aquí para escribir
          </div>
        </div>
      )}
    </div>
  )
}
