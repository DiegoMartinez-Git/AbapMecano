'use client'

import { cn } from '@/lib/utils'

/** Fondo con parallax (capas SVG que se desplazan a distinta velocidad). */
export function Parallax({ scroll }: { scroll: number }) {
  const layer = (factor: number, height: number, color: string, opacity: number, points: string) => {
    const W = 1200
    const off = -((scroll * factor) % W)
    return (
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height }}>
        <div className="absolute bottom-0 flex" style={{ left: off, width: W * 2 }}>
          {[0, 1].map((i) => (
            <svg key={i} width={W} height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
              <polygon points={points} fill={color} opacity={opacity} />
            </svg>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* cielo */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #12121c 0%, #15131f 55%, #181522 100%)' }} />
      {/* estrellas tenues */}
      <Stars />
      {/* colinas lejanas */}
      {layer(0.15, 120, '#241f33', 1, '0,120 0,70 200,40 400,75 600,35 800,70 1000,45 1200,80 1200,120')}
      {/* "servidores"/edificios medios */}
      {layer(0.4, 90, '#2c2640', 1, '0,90 0,55 80,55 80,30 160,30 160,60 280,60 280,40 360,40 360,65 480,65 480,35 560,35 560,60 700,60 700,45 800,45 800,62 920,62 920,38 1000,38 1000,60 1120,60 1120,50 1200,50 1200,90')}
    </div>
  )
}

function Stars() {
  const stars = [
    [60, 24], [180, 50], [320, 18], [460, 60], [600, 30],
    [740, 48], [880, 20], [1010, 54], [140, 80], [520, 90], [900, 78],
  ]
  return (
    <>
      {stars.map(([x, y], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[var(--color-accent)]"
          style={{ left: `${(x / 1200) * 100}%`, top: y, width: 2, height: 2, opacity: 0.4 }}
        />
      ))}
    </>
  )
}

/** Suelo con tiles que se desplazan. */
export function Ground({ scroll }: { scroll: number }) {
  const W = 80
  const off = -(scroll % W)
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
      <div className="absolute top-0 flex" style={{ left: off }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="border-r border-[var(--color-border)]/40" style={{ width: W, height: '100%' }} />
        ))}
      </div>
    </div>
  )
}

/** Moneda recogible. */
export function Coin({ collected }: { collected: boolean }) {
  return (
    <div className={cn('relative transition-all duration-200', collected && 'opacity-0 -translate-y-8 scale-150')}>
      <div className="animate-[coin-spin_1.2s_linear_infinite]">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
          <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#92400e">$</text>
        </svg>
      </div>
    </div>
  )
}

/** Enemigo: un "bug" del código. */
export function Bug({ defeated }: { defeated: boolean }) {
  return (
    <div className={cn('relative transition-all duration-300 origin-bottom', defeated ? 'opacity-0 scale-0 rotate-45' : 'animate-[bug-wobble_0.6s_ease-in-out_infinite]')}>
      <svg width="34" height="34" viewBox="0 0 34 34">
        {/* patas */}
        <g stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="20" x2="2" y2="24" /><line x1="8" y1="24" x2="3" y2="29" />
          <line x1="26" y1="20" x2="32" y2="24" /><line x1="26" y1="24" x2="31" y2="29" />
        </g>
        {/* cuerpo */}
        <ellipse cx="17" cy="20" rx="11" ry="10" fill="#ef4444" />
        <path d="M17 10 a11 10 0 0 1 11 10 H6 a11 10 0 0 1 11 -10 z" fill="#dc2626" />
        <line x1="17" y1="10" x2="17" y2="30" stroke="#7f1d1d" strokeWidth="1.5" />
        {/* antenas */}
        <g stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round">
          <line x1="13" y1="11" x2="10" y2="5" /><line x1="21" y1="11" x2="24" y2="5" />
        </g>
        <circle cx="10" cy="5" r="1.6" fill="#7f1d1d" /><circle cx="24" cy="5" r="1.6" fill="#7f1d1d" />
        {/* ojos */}
        <circle cx="13" cy="18" r="2.4" fill="#fff" /><circle cx="21" cy="18" r="2.4" fill="#fff" />
        <circle cx="13" cy="18" r="1.1" fill="#000" /><circle cx="21" cy="18" r="1.1" fill="#000" />
      </svg>
    </div>
  )
}

/** Obstáculo a saltar: un bloque de código. */
export function Obstacle() {
  return (
    <div className="flex items-end">
      <div className="rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 font-mono text-sm text-[var(--color-accent)] shadow-sm">
        {'{ }'}
      </div>
    </div>
  )
}

/** Fila de corazones (vida). */
export function Hearts({ hearts, max }: { hearts: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" className={cn('transition-all', i < hearts ? 'scale-100' : 'scale-90')}>
          <path
            d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"
            fill={i < hearts ? '#f87171' : 'transparent'}
            stroke={i < hearts ? '#f87171' : '#3f3f50'}
            strokeWidth="1.5"
          />
        </svg>
      ))}
    </div>
  )
}
