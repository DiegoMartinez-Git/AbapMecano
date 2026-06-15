'use client'

import { cn } from '@/lib/utils'

/**
 * Teclado en pantalla con guía de dedos:
 * - resalta la próxima tecla a pulsar
 * - colorea cada tecla según el dedo que la pulsa (mecanografía al tacto)
 */

type Finger =
  | 'lp' | 'lr' | 'lm' | 'li'
  | 'ri' | 'rm' | 'rr' | 'rp'
  | 'thumb'

const FINGER_COLOR: Record<Finger, string> = {
  lp: '#ef4444', // meñique izq
  lr: '#f59e0b', // anular izq
  lm: '#84cc16', // corazón izq
  li: '#22c55e', // índice izq
  ri: '#06b6d4', // índice der
  rm: '#3b82f6', // corazón der
  rr: '#8b5cf6', // anular der
  rp: '#ec4899', // meñique der
  thumb: '#9ca3af',
}

const FINGER_LABEL: Record<Finger, string> = {
  lp: 'Meñique izq.', lr: 'Anular izq.', lm: 'Corazón izq.', li: 'Índice izq.',
  ri: 'Índice der.',  rm: 'Corazón der.', rr: 'Anular der.', rp: 'Meñique der.',
  thumb: 'Pulgar',
}

// Mapa carácter → dedo (distribución QWERTY-ES al tacto)
const KEY_FINGER: Record<string, Finger> = {
  '1': 'lp', q: 'lp', a: 'lp', z: 'lp',
  '2': 'lr', w: 'lr', s: 'lr', x: 'lr',
  '3': 'lm', e: 'lm', d: 'lm', c: 'lm',
  '4': 'li', '5': 'li', r: 'li', t: 'li', f: 'li', g: 'li', v: 'li', b: 'li',
  '6': 'ri', '7': 'ri', y: 'ri', u: 'ri', h: 'ri', j: 'ri', n: 'ri', m: 'ri',
  '8': 'rm', i: 'rm', k: 'rm', ',': 'rm',
  '9': 'rr', o: 'rr', l: 'rr', '.': 'rr',
  '0': 'rp', p: 'rp', 'ñ': 'rp', '-': 'rp',
  ' ': 'thumb',
}

const ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
]

const LEGEND: Finger[] = ['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp']

export function KeyboardGuide({ nextChar }: { nextChar?: string }) {
  const target = (nextChar ?? '').toLowerCase()

  function Key({ char, wide }: { char: string; wide?: boolean }) {
    const finger = KEY_FINGER[char]
    const color  = finger ? FINGER_COLOR[finger] : '#9ca3af'
    const active = char === target

    return (
      <div
        className={cn(
          'flex items-end justify-center rounded-[5px] border text-xs font-mono select-none transition-all duration-100',
          wide ? 'flex-1' : 'w-9',
          active
            ? 'text-[var(--color-on-accent)] font-bold scale-105'
            : 'text-[var(--color-text-muted)]'
        )}
        style={{
          height: 36,
          paddingBottom: 4,
          backgroundColor: active ? 'var(--color-accent)' : `${color}1f`,
          borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        {char === ' ' ? '' : char.toUpperCase()}
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 select-none">
      <div className="flex flex-col items-center gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ paddingLeft: `${ri * 0.6}rem` }}>
            {row.map((c) => <Key key={c} char={c} />)}
          </div>
        ))}
        {/* Barra espaciadora */}
        <div className="flex w-full px-12 mt-0.5">
          <Key char=" " wide />
        </div>
      </div>

      {/* Leyenda de dedos */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-4">
        {LEGEND.map((f) => (
          <span key={f} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: FINGER_COLOR[f] }} />
            {FINGER_LABEL[f]}
          </span>
        ))}
      </div>
    </div>
  )
}
