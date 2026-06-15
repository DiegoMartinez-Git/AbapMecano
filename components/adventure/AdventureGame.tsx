'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateText } from '@/lib/texts'
import { finishAdventureRun } from '@/lib/actions'
import { getItem } from '@/lib/shop'
import type { AdventureState } from '@/types'
import { cn } from '@/lib/utils'
import { Runner, type RunnerPose } from './Runner'
import { Parallax, Ground, Coin, Bug, Obstacle, Hearts } from './GameScene'
import { CaretText } from '@/components/typing/CaretText'

// ── Constantes de juego ────────────────────────────────────────
const PX_PER_CHAR   = 13
const RUNNER_X      = 90      // posición horizontal fija del personaje (px)
const ENGAGE_CHARS  = 16      // distancia (en chars) a la que un bug puede morderte
const BASE_HEARTS   = 3
const BUG_BONUS     = 5       // monedas extra por derrotar un bug
const WORDS         = 60

interface Entity { i: number; charIndex: number }

interface RunResult {
  win: boolean
  collected: number
  earned: number
  distance: number
  best: number
  bugsKilled: number
}

interface Props {
  state: AdventureState
  onCoinsChange: (coins: number, best: number) => void
}

export function AdventureGame({ state, onCoinsChange }: Props) {
  const hasPerk = (p: string) => state.perks.includes(p as never)
  const maxHearts = BASE_HEARTS + (hasPerk('extraLife') ? 1 : 0)

  const skinColor = getItem(state.equipped.skin ?? 'skin_default')?.color ?? '#2563eb'
  const hatGlyph  = state.equipped.hat ? getItem(state.equipped.hat)?.glyph : undefined
  const petGlyph  = state.equipped.pet ? getItem(state.equipped.pet)?.glyph : undefined
  const trailItem = state.equipped.trail ? getItem(state.equipped.trail) : undefined
  const trailColor = trailItem?.trailColor

  // ── Estado de partida ────────────────────────────────────────
  const [sapMode, setSapMode]   = useState(false)
  const [text, setText]         = useState('')
  const [typed, setTyped]       = useState('')
  const [status, setStatus]     = useState<'idle' | 'playing' | 'over'>('idle')
  const [hearts, setHearts]     = useState(maxHearts)
  const [shieldUp, setShieldUp] = useState(hasPerk('shield'))
  const [collected, setCollected] = useState(0)
  const [combo, setCombo]       = useState(0)
  const [wpm, setWpm]           = useState(0)
  const [pose, setPose]         = useState<RunnerPose>('idle')
  const [flash, setFlash]       = useState(false)
  const [result, setResult]     = useState<RunResult | null>(null)

  const [collectedSet, setCollectedSet] = useState<Set<number>>(new Set())
  const [defeatedSet, setDefeatedSet]   = useState<Set<number>>(new Set())

  // ── Entidades del nivel (se generan una vez por partida) ─────
  const coinsRef     = useRef<Entity[]>([])
  const bugsRef      = useRef<Entity[]>([])
  const obstaclesRef = useRef<Entity[]>([])
  const bittenRef    = useRef<Set<number>>(new Set())
  const jumpedRef    = useRef<Set<number>>(new Set())

  // ── Refs anti stale-closure ──────────────────────────────────
  const typedRef    = useRef('')
  const textRef     = useRef('')
  const statusRef   = useRef<'idle' | 'playing' | 'over'>('idle')
  const heartsRef   = useRef(maxHearts)
  const shieldRef   = useRef(hasPerk('shield'))
  const startRef    = useRef<number | null>(null)
  const poseTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishedRef = useRef(false)

  useLayoutEffect(() => {
    typedRef.current  = typed
    textRef.current   = text
    statusRef.current = status
    heartsRef.current = hearts
    shieldRef.current = shieldUp
  })

  // ── Generar nivel ────────────────────────────────────────────
  const buildLevel = useCallback((txt: string) => {
    // Localiza el final de cada palabra
    const wordEnds: number[] = []
    for (let i = 0; i < txt.length; i++) {
      if (txt[i] === ' ' && i > 0) wordEnds.push(i)
    }
    wordEnds.push(txt.length)

    // Monedas: cada 4 chars (saltando espacios)
    const coins: Entity[] = []
    let ci = 0
    for (let i = 4; i < txt.length; i += 4) {
      if (txt[i] !== ' ') coins.push({ i: ci++, charIndex: i })
    }
    // Bugs: cada ~7 palabras a partir de la 4ª
    const bugs: Entity[] = []
    let bi = 0
    for (let w = 4; w < wordEnds.length; w += 7) bugs.push({ i: bi++, charIndex: wordEnds[w] })
    // Obstáculos: cada ~9 palabras a partir de la 6ª
    const obs: Entity[] = []
    let oi = 0
    for (let w = 6; w < wordEnds.length; w += 9) obs.push({ i: oi++, charIndex: wordEnds[w] })

    coinsRef.current = coins
    bugsRef.current = bugs
    obstaclesRef.current = obs
    bittenRef.current = new Set()
    jumpedRef.current = new Set()
  }, [])

  const newRun = useCallback(() => {
    const txt = generateText('words', WORDS, sapMode ? 'sap' : 'generic', { numbers: false, symbols: false })
    buildLevel(txt)
    setText(txt); textRef.current = txt
    setTyped(''); typedRef.current = ''
    setStatus('idle'); statusRef.current = 'idle'
    setHearts(maxHearts); heartsRef.current = maxHearts
    setShieldUp(hasPerk('shield')); shieldRef.current = hasPerk('shield')
    setCollected(0); setCombo(0); setWpm(0)
    setPose('idle'); setFlash(false); setResult(null)
    setCollectedSet(new Set()); setDefeatedSet(new Set())
    startRef.current = null
    finishedRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sapMode, buildLevel])

  useEffect(() => { newRun() }, [newRun])

  // ── Pose transitoria ─────────────────────────────────────────
  const flashPose = useCallback((p: RunnerPose, ms: number) => {
    setPose(p)
    if (poseTimer.current) clearTimeout(poseTimer.current)
    poseTimer.current = setTimeout(() => {
      if (statusRef.current === 'playing') setPose('run')
    }, ms)
  }, [])

  // ── Fin de partida ───────────────────────────────────────────
  const endRun = useCallback((win: boolean) => {
    if (finishedRef.current) return
    finishedRef.current = true
    setStatus('over'); statusRef.current = 'over'
    setPose(win ? 'run' : 'hurt')

    const collectedNow = collectedSet.size
    const bugsKilled   = defeatedSet.size
    const mult = (hasPerk('doubleCoins') ? 2 : 1) * (hasPerk('magnet') ? 1.25 : 1)
    const earned   = Math.round(collectedNow * mult) + (win ? 25 : 0)
    const distance = typedRef.current.length

    setResult({ win, collected: collectedNow, earned, distance, best: state.best, bugsKilled })

    ;(async () => {
      const res = await finishAdventureRun(earned, distance)
      if ('coins' in res) {
        onCoinsChange(res.coins, res.best)
        setResult((r) => (r ? { ...r, best: res.best } : r))
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectedSet, defeatedSet, state.best, onCoinsChange])

  // ── Interacciones según progreso (chars correctos) ───────────
  useEffect(() => {
    if (status !== 'playing') return
    const len = typed.length

    // Recoger monedas
    setCollectedSet((prev) => {
      let changed = false
      const next = new Set(prev)
      let gained = 0
      for (const c of coinsRef.current) {
        if (c.charIndex <= len && !next.has(c.i)) { next.add(c.i); changed = true; gained++ }
      }
      if (gained) setCollected((n) => n + gained)
      return changed ? next : prev
    })

    // Derrotar bugs
    setDefeatedSet((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const b of bugsRef.current) {
        if (b.charIndex <= len && !next.has(b.i)) {
          next.add(b.i); changed = true
          setCollected((n) => n + BUG_BONUS)
          flashPose('attack', 320)
        }
      }
      return changed ? next : prev
    })

    // Saltar obstáculos
    for (const o of obstaclesRef.current) {
      if (o.charIndex <= len && !jumpedRef.current.has(o.i)) {
        jumpedRef.current.add(o.i)
        flashPose('jump', hasPerk('doubleJump') ? 620 : 480)
      }
    }

    // WPM en vivo
    if (startRef.current) {
      const mins = (Date.now() - startRef.current) / 60000
      if (mins > 0) setWpm(Math.round((len / 5) / mins))
    }

    // Victoria
    if (len >= textRef.current.length && textRef.current.length > 0) endRun(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, status])

  // ── Mordisco de bug al fallar ────────────────────────────────
  const bugBite = useCallback(() => {
    const len = typedRef.current.length
    const next = bugsRef.current.find(
      (b) => !defeatedSet.has(b.i) && b.charIndex >= len && (b.charIndex - len) <= ENGAGE_CHARS
    )
    if (!next || bittenRef.current.has(next.i)) return
    bittenRef.current.add(next.i)

    if (shieldRef.current) {
      setShieldUp(false); shieldRef.current = false
      flashPose('hurt', 360)
      return
    }
    const remaining = heartsRef.current - 1
    heartsRef.current = remaining
    setHearts(remaining)
    flashPose('hurt', 360)
    if (remaining <= 0) endRun(false)
  }, [defeatedSet, endRun, flashPose])

  // ── Teclado ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); newRun(); return }
      if (statusRef.current === 'over') return
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.key.length !== 1 && e.key !== 'Backspace') return

      // Empezar con la primera tecla
      if (statusRef.current === 'idle') {
        startRef.current = Date.now()
        setStatus('playing'); statusRef.current = 'playing'
        setPose('run')
      }

      if (e.key === 'Backspace') {
        // Permitido pero no resta progreso clave del juego (solo estética)
        return
      }
      if (typedRef.current.length >= textRef.current.length) return

      const expected = textRef.current[typedRef.current.length]
      if (e.key === expected) {
        const nt = typedRef.current + e.key
        typedRef.current = nt
        setTyped(nt)
        setCombo((c) => c + 1)
        if (pose !== 'run' && statusRef.current === 'playing') {
          // mantener carrera salvo pose transitoria activa
        }
      } else {
        // Error: no avanza, posible mordisco
        setCombo(0)
        setFlash(true)
        setTimeout(() => setFlash(false), 200)
        bugBite()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [newRun, bugBite, pose])

  // ── Render ───────────────────────────────────────────────────
  const scroll = typed.length * PX_PER_CHAR
  const progress = text.length ? Math.min(100, (typed.length / text.length) * 100) : 0
  const jumping = pose === 'jump'

  return (
    <div className="w-full select-none">
      {/* HUD superior */}
      <div className="flex items-center justify-between mb-3">
        <Hearts hearts={hearts} max={maxHearts} />
        <div className="flex items-center gap-4 text-sm">
          {shieldUp && <span title="Escudo activo">🛡️</span>}
          {combo >= 10 && <span className="text-[var(--color-accent)] font-mono text-xs">combo x{combo}</span>}
          <span className="font-mono text-[var(--color-text-muted)]">{wpm} <span className="text-[10px]">PPM</span></span>
          <span className="flex items-center gap-1 font-mono font-bold text-[#fbbf24]">
            <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /></svg>
            {collected}
          </span>
        </div>
      </div>

      {/* Escena */}
      <div className="relative w-full rounded-md border border-[var(--color-border)] overflow-hidden" style={{ height: 240 }}>
        <Parallax scroll={scroll} />

        {/* Capa de entidades */}
        <div className="absolute inset-0">
          {/* Monedas */}
          {coinsRef.current.map((c) => {
            const left = c.charIndex * PX_PER_CHAR - scroll + RUNNER_X
            if (left < -40 || left > 900) return null
            return (
              <div key={`c${c.i}`} className="absolute transition-[left] duration-150 ease-linear" style={{ left, bottom: 92 }}>
                <Coin collected={collectedSet.has(c.i)} />
              </div>
            )
          })}
          {/* Obstáculos */}
          {obstaclesRef.current.map((o) => {
            const left = o.charIndex * PX_PER_CHAR - scroll + RUNNER_X
            if (left < -40 || left > 900) return null
            return (
              <div key={`o${o.i}`} className="absolute transition-[left] duration-150 ease-linear" style={{ left, bottom: 46 }}>
                <Obstacle />
              </div>
            )
          })}
          {/* Bugs */}
          {bugsRef.current.map((b) => {
            const left = b.charIndex * PX_PER_CHAR - scroll + RUNNER_X
            if (left < -50 || left > 900) return null
            return (
              <div key={`b${b.i}`} className="absolute transition-[left] duration-150 ease-linear" style={{ left, bottom: 48 }}>
                <Bug defeated={defeatedSet.has(b.i)} />
              </div>
            )
          })}
        </div>

        {/* Estela */}
        {trailColor && status === 'playing' && (
          <div className="absolute" style={{ left: RUNNER_X - 6, bottom: 58 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute rounded-full animate-[trail-fade_0.6s_ease-out_infinite]"
                style={{ width: 8 - i * 2, height: 8 - i * 2, background: trailColor, left: -i * 12, bottom: i * 3, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        )}

        {/* Personaje */}
        <div
          className={cn('absolute z-10', jumping && (hasPerk('doubleJump') ? 'animate-[jump-high_0.6s_ease-out]' : 'animate-[jump-arc_0.48s_ease-out]'))}
          style={{ left: RUNNER_X - 28, bottom: 46 }}
        >
          <Runner color={skinColor} pose={pose} hatGlyph={hatGlyph} petGlyph={petGlyph} />
        </div>

        <Ground scroll={scroll} />

        {/* Flash de error */}
        {flash && <div className="absolute inset-0 bg-[var(--color-error)]/10 pointer-events-none" />}

        {/* Overlay idle */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg)]/55">
            <p className="text-[var(--color-text-main)] font-semibold">Escribe para empezar a correr</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Acierta para avanzar y recoger monedas · falla y los bugs te muerden</p>
          </div>
        )}

        {/* Overlay fin */}
        <AnimatePresence>
          {status === 'over' && result && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/90 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] p-6 text-center"
              >
                <div className="text-3xl mb-2">{result.win ? '🏁' : '💀'}</div>
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                  {result.win ? '¡Nivel completado!' : 'Te han vencido los bugs'}
                </h3>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <Stat label="Monedas" value={`+${result.earned}`} accent />
                  <Stat label="Bugs" value={String(result.bugsKilled)} />
                  <Stat label="Distancia" value={String(result.distance)} />
                </div>
                {result.distance >= result.best && result.distance > 0 && (
                  <p className="text-xs text-[var(--color-success)] mb-3">🏆 ¡Nuevo récord de distancia!</p>
                )}
                <button
                  onClick={newRun}
                  className="w-full py-2.5 rounded-md text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-[var(--color-on-accent)] transition-colors"
                >
                  Jugar otra vez
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de progreso + texto */}
      <div className="mt-3 w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Texto a escribir */}
      <div className="mt-4 px-2 break-words">
        <CaretText text={text} typed={typed} showCaret={status !== 'over'} textSize="text-xl" />
      </div>

      {/* Pie */}
      <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[var(--color-text-dim)]">
        <span className="flex items-center gap-1.5">
          <kbd className="font-mono bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px]">Tab</kbd>
          reiniciar
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={sapMode}
            disabled={status === 'playing'}
            onChange={(e) => setSapMode(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Términos SAP/ABAP
        </label>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] py-2">
      <div className={cn('text-lg font-bold font-mono', accent ? 'text-[#fbbf24]' : 'text-[var(--color-text-main)]')}>{value}</div>
      <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wide">{label}</div>
    </div>
  )
}
