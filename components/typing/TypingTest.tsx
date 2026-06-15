'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TestMode, TestStatus, TimeLimit, WordCount, TestResult, TextCategory } from '@/types'
import { generateText } from '@/lib/texts'
import {
  calculateWPM,
  calculateRawWPM,
  calculateAccuracy,
  getCorrectChars,
} from '@/lib/typing'
import { ModeSelector }     from './ModeSelector'
import { StatsBar }         from './StatsBar'
import { TextDisplay }      from './TextDisplay'
import { Results }          from './Results'
import { Countdown }        from './Countdown'
import { LiveSparkline }    from './LiveSparkline'
import { CustomTextModal }  from './CustomTextModal'
import { saveTypingResult, getPersonalBest } from '@/lib/actions'
import { useToastStore } from '@/store/toastStore'
import { useSettings } from '@/store/settingsStore'
import { KeyboardGuide } from './KeyboardGuide'

interface TypingTestProps {
  initialText?: string
  textCategory?: TextCategory
  hideSelector?: boolean
  initialMode?: TestMode
  onComplete?: (result: TestResult) => void
}

export function TypingTest({
  initialText,
  textCategory = 'generic',
  hideSelector = false,
  initialMode = 'timed',
  onComplete,
}: TypingTestProps) {
  const pushToast = useToastStore((s) => s.push)
  const fontScale    = useSettings((s) => s.fontScale)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  // Evita mismatch de hidratación con los ajustes persistidos en localStorage
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const effFontScale = mounted ? fontScale : 1

  // ── Configuration ─────────────────────────────────────────────
  const [mode, setMode]           = useState<TestMode>(initialMode)
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60)
  const [wordCount, setWordCount] = useState<WordCount>(25)
  const [sapMode, setSapMode]     = useState(false)
  const [precisionMode, setPrecisionMode] = useState(false)
  const [numbersMode, setNumbersMode]     = useState(false)

  // ── Test state ─────────────────────────────────────────────────
  const [status, setStatus]       = useState<TestStatus>('idle')
  const [text, setText]           = useState(initialText ?? '')
  const [typed, setTyped]         = useState('')
  const [timeLeft, setTimeLeft]   = useState<number>(60)
  const [isFocused, setIsFocused] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capsLockOn, setCapsLockOn]   = useState(false)
  const [shakeText, setShakeText]     = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // ── Live stats ─────────────────────────────────────────────────
  const [liveWpm, setLiveWpm]           = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)
  const [errors, setErrors]             = useState(0)
  const [result, setResult]             = useState<TestResult | null>(null)
  const [personalBest, setPersonalBest] = useState<number | null>(null)
  const [isNewBest, setIsNewBest]       = useState(false)
  const [sparkData, setSparkData]       = useState<number[]>([])
  const [wordProgress, setWordProgress] = useState(0)

  // ── Refs (stale-closure fix) ───────────────────────────────────
  const typedRef          = useRef('')
  const textRef           = useRef(initialText ?? '')
  const statusRef         = useRef<TestStatus>('idle')
  const modeRef           = useRef<TestMode>('timed')
  const timeLimitRef      = useRef<TimeLimit>(60)
  const wordCountRef      = useRef<WordCount>(25)
  const sapModeRef        = useRef(false)
  const precisionModeRef  = useRef(false)
  const numbersRef        = useRef(false)
  const startTimeRef      = useRef<number | null>(null)
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null)
  const sparkIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const finishedRef       = useRef(false)
  const isFocusedRef      = useRef(true)
  const charErrorsRef     = useRef<Record<string, number>>({})
  const customTextRef     = useRef<string | null>(initialText ?? null)
  const onCompleteRef     = useRef(onComplete)
  onCompleteRef.current   = onComplete

  // Sync refs after each render (commit phase, not render phase)
  useLayoutEffect(() => {
    typedRef.current         = typed
    textRef.current          = text
    statusRef.current        = status
    modeRef.current          = mode
    timeLimitRef.current     = timeLimit
    wordCountRef.current     = wordCount
    sapModeRef.current       = sapMode
    precisionModeRef.current = precisionMode
    numbersRef.current       = numbersMode
    isFocusedRef.current     = isFocused
  })

  // ── Generate text on config change ────────────────────────────
  useEffect(() => {
    if (customTextRef.current) return  // don't regenerate for custom/daily text
    const category: TextCategory = sapModeRef.current ? 'sap' : textCategory
    const newText = generateText(
      mode,
      mode === 'timed' ? 250 : wordCount,
      category,
      { numbers: numbersMode, symbols: false }
    )
    setText(newText)
    textRef.current = newText
    _resetState()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, timeLimit, wordCount, sapMode, numbersMode, textCategory])

  function _resetState() {
    if (timerRef.current)     clearInterval(timerRef.current)
    if (sparkIntervalRef.current) clearInterval(sparkIntervalRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    startTimeRef.current = null
    finishedRef.current  = false
    charErrorsRef.current = {}
    typedRef.current     = ''
    setTyped('')
    setStatus('idle')
    statusRef.current = 'idle'
    setTimeLeft(timeLimitRef.current)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setErrors(0)
    setResult(null)
    setCountdown(null)
    setSparkData([])
    setWordProgress(0)
  }

  // ── Live stats update on typed change ────────────────────────
  useEffect(() => {
    if (!startTimeRef.current || typed.length === 0) return
    const elapsed = Date.now() - startTimeRef.current
    const correct = getCorrectChars(text, typed)
    setLiveWpm(calculateWPM(correct, elapsed))
    setLiveAccuracy(calculateAccuracy(correct, typed.length))
    setErrors(typed.length - correct)

    if (mode === 'words') {
      setWordProgress(Math.min(100, Math.round((typed.length / text.length) * 100)))
    }
  }, [typed, text, mode])

  // ── Finish test ───────────────────────────────────────────────
  const finishTest = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (sparkIntervalRef.current) { clearInterval(sparkIntervalRef.current); sparkIntervalRef.current = null }

    const elapsed      = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const currentTyped = typedRef.current
    const currentText  = textRef.current
    const correct      = getCorrectChars(currentText, currentTyped)

    const finalResult: TestResult = {
      wpm:          calculateWPM(correct, elapsed),
      rawWpm:       calculateRawWPM(currentTyped.length, elapsed),
      accuracy:     calculateAccuracy(correct, currentTyped.length),
      errors:       currentTyped.length - correct,
      correctChars: correct,
      totalChars:   currentTyped.length,
      duration:     Math.round(elapsed / 1000),
      mode:         modeRef.current,
      timeLimit:    timeLimitRef.current,
      wordCount:    wordCountRef.current,
      category:     sapModeRef.current ? 'sap' : textCategory,
      completedAt:  new Date(),
      charErrors:   { ...charErrorsRef.current },
    }

    setResult(finalResult)
    setStatus('finished')
    statusRef.current = 'finished'

    onCompleteRef.current?.(finalResult)

    ;(async () => {
      const prev      = await getPersonalBest(modeRef.current, timeLimitRef.current, wordCountRef.current)
      const prevBest  = prev?.wpm ?? 0
      setPersonalBest(prevBest)
      const isNew = finalResult.wpm > prevBest && finalResult.wpm > 0
      setIsNewBest(isNew)

      const saved = await saveTypingResult(finalResult)

      if (saved.newAchievements?.length) {
        saved.newAchievements.forEach((ach) => {
          pushToast({ type: 'achievement', icon: ach.icon, title: '¡Logro desbloqueado!', description: `${ach.name} · +${ach.xp_reward} XP` })
        })
      }
      if (saved.leveledUp && saved.newLevel) {
        pushToast({ type: 'levelup', icon: '⬆️', title: `¡Subiste al nivel ${saved.newLevel}!`, description: 'Sigue practicando para desbloquear más logros' })
      }
      if (isNew) {
        pushToast({ type: 'success', icon: '🏆', title: `¡Nuevo récord: ${finalResult.wpm} PPM!`, description: `Anterior: ${prevBest} PPM` })
      }
    })()
  }, [pushToast, textCategory])

  // ── Start test (after countdown) ──────────────────────────────
  const startTest = useCallback(() => {
    startTimeRef.current = Date.now()
    setStatus('running')
    statusRef.current = 'running'

    // Sparkline interval: record WPM every 3 seconds
    sparkIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return
      const elapsed = Date.now() - startTimeRef.current
      const correct = getCorrectChars(textRef.current, typedRef.current)
      const wpm = calculateWPM(correct, elapsed)
      setSparkData((prev) => [...prev.slice(-20), wpm])
    }, 3000)

    if (modeRef.current === 'timed') {
      const limit = timeLimitRef.current
      setTimeLeft(limit)
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { finishTest(); return 0 }
          return prev - 1
        })
      }, 1000)
    }
  }, [finishTest])

  // ── Countdown before timed test ──────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(3)
    setStatus('countdown')
    statusRef.current = 'countdown'
    let count = 3
    countdownRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(countdownRef.current!)
        setCountdown(null)
        startTest()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }, [startTest])

  // ── Reset test ────────────────────────────────────────────────
  const resetTest = useCallback(() => {
    if (customTextRef.current) {
      // Keep custom text but reset state
      textRef.current = customTextRef.current
      setText(customTextRef.current)
    } else {
      const category: TextCategory = sapModeRef.current ? 'sap' : textCategory
      const newText = generateText(
        modeRef.current,
        modeRef.current === 'timed' ? 250 : wordCountRef.current,
        category,
        { numbers: numbersRef.current }
      )
      setText(newText)
      textRef.current = newText
    }
    _resetState()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textCategory])

  // ── Keyboard handler ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect CapsLock
      if (e.getModifierState) {
        setCapsLockOn(e.getModifierState('CapsLock'))
      }

      // Tab always resets
      if (e.key === 'Tab') {
        e.preventDefault()
        resetTest()
        return
      }

      if (statusRef.current === 'finished') return
      if (statusRef.current === 'countdown') return
      if (!isFocusedRef.current) return
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.key.length !== 1 && e.key !== 'Backspace') return

      // Backspace
      if (e.key === 'Backspace') {
        const newTyped = typedRef.current.slice(0, -1)
        setTyped(newTyped)
        typedRef.current = newTyped
        return
      }

      // First keystroke in timed mode → countdown
      if (statusRef.current === 'idle' && modeRef.current === 'timed') {
        e.preventDefault()
        startCountdown()
        return
      }

      // First keystroke in words mode → start immediately
      if (statusRef.current === 'idle') {
        startTest()
      }

      // Don't type past the end
      if (typedRef.current.length >= textRef.current.length) return

      // Precision mode: block space if current word has errors
      if (e.key === ' ' && precisionModeRef.current) {
        const lastSpace = typedRef.current.lastIndexOf(' ')
        const wordStart = lastSpace + 1
        const typedWord    = typedRef.current.slice(wordStart)
        const expectedWord = textRef.current.slice(wordStart, wordStart + typedWord.length)
        if (typedWord !== expectedWord) {
          setShakeText(true)
          setTimeout(() => setShakeText(false), 350)
          return
        }
      }

      const newTyped = typedRef.current + e.key
      setTyped(newTyped)
      typedRef.current = newTyped

      // Track char errors
      const pos = newTyped.length - 1
      const expected = textRef.current[pos]
      if (e.key !== expected && expected && expected !== ' ') {
        charErrorsRef.current[expected] = (charErrorsRef.current[expected] ?? 0) + 1
      }

      // Words mode: finish when complete
      if (modeRef.current === 'words' && newTyped.length === textRef.current.length) {
        finishTest()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [resetTest, startTest, startCountdown, finishTest])

  // ── Handle custom text ─────────────────────────────────────────
  function handleCustomText(text: string) {
    customTextRef.current = text
    setText(text)
    textRef.current = text
    _resetState()
  }

  // ── Handlers ──────────────────────────────────────────────────
  const handleModeChange      = useCallback((m: TestMode)      => setMode(m), [])
  const handleTimeLimitChange = useCallback((t: TimeLimit)     => setTimeLimit(t), [])
  const handleWordCountChange = useCallback((w: WordCount)     => setWordCount(w), [])

  function handleSapMode(v: boolean) {
    customTextRef.current = null
    setSapMode(v)
  }
  function handleNumbersMode(v: boolean) {
    customTextRef.current = null
    setNumbersMode(v)
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <CustomTextModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleCustomText}
      />

      <div
        className="flex flex-col items-center w-full"
        onClick={() => !isFocused && setIsFocused(true)}
      >
        {/* Mode selector */}
        {!hideSelector && (
          <ModeSelector
            mode={mode}
            timeLimit={timeLimit}
            wordCount={wordCount}
            disabled={status === 'running' || status === 'countdown'}
            sapMode={sapMode}
            precisionMode={precisionMode}
            numbersMode={numbersMode}
            onModeChange={handleModeChange}
            onTimeLimitChange={handleTimeLimitChange}
            onWordCountChange={handleWordCountChange}
            onSapModeChange={handleSapMode}
            onPrecisionModeChange={setPrecisionMode}
            onNumbersModeChange={handleNumbersMode}
            onCustomText={() => setShowCustomModal(true)}
          />
        )}

        {/* CapsLock warning */}
        <AnimatePresence>
          {capsLockOn && status !== 'finished' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-xs font-medium"
            >
              <span>⇪</span>
              Bloq Mayús activado
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats bar */}
        <StatsBar
          mode={mode}
          wpm={liveWpm}
          accuracy={liveAccuracy}
          errors={errors}
          timeLeft={timeLeft}
          timeLimit={timeLimit}
          status={status}
          wordProgress={wordProgress}
          sparkData={sparkData}
        />

        {/* Main area: typing or results */}
        <AnimatePresence mode="wait">
          {status === 'finished' && result ? (
            <motion.div
              key="results"
              className="w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Results
                result={result}
                onRetry={resetTest}
                personalBest={personalBest}
                isNewBest={isNewBest}
              />
            </motion.div>
          ) : (
            <motion.div
              key="test"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-full cursor-text relative"
                onClick={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                tabIndex={0}
              >
                <TextDisplay
                  text={text}
                  typed={typed}
                  isFocused={isFocused}
                  status={status}
                  shake={shakeText}
                  fontScale={effFontScale}
                />
                <Countdown count={countdown} />
              </div>

              {/* Words mode progress bar */}
              {mode === 'words' && status === 'running' && (
                <div className="mt-3 w-full h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    animate={{ width: `${wordProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard hints */}
        {status !== 'finished' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-4 text-xs text-[var(--color-text-dim)]"
          >
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px]">Tab</kbd>
              reiniciar
            </span>
            {precisionMode && (
              <span className="flex items-center gap-1 text-[var(--color-accent)]/70 text-[10px]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] inline-block" />
                Modo precisión activo
              </span>
            )}
            {status === 'idle' && (
              <span>
                {mode === 'timed' ? 'pulsa una tecla para el cuenta atrás' : 'comienza a escribir para iniciar'}
              </span>
            )}
          </motion.div>
        )}

        {/* Teclado con guía de dedos */}
        {mounted && showKeyboard && status !== 'finished' && (
          <KeyboardGuide nextChar={text[typed.length] ?? ''} />
        )}
      </div>
    </>
  )
}
