'use client'

import { cn } from '@/lib/utils'

export type RunnerPose = 'idle' | 'run' | 'jump' | 'attack' | 'hurt'

interface RunnerProps {
  color: string
  pose: RunnerPose
  hatGlyph?: string
  petGlyph?: string
}

/**
 * Personaje vector (SVG) del modo Aventura.
 * Las animaciones de carrera/salto se controlan con clases CSS (ver globals.css).
 */
export function Runner({ color, pose, hatGlyph, petGlyph }: RunnerProps) {
  const running = pose === 'run'

  return (
    <div className="relative" style={{ width: 56, height: 72 }}>
      {/* Mascota que sigue al personaje */}
      {petGlyph && (
        <div
          className="absolute text-2xl select-none"
          style={{ left: -34, bottom: 2 }}
          aria-hidden
        >
          <span className="inline-block animate-[pet-bob_0.9s_ease-in-out_infinite]">{petGlyph}</span>
        </div>
      )}

      {/* Sombrero */}
      {hatGlyph && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xl select-none z-10"
          style={{ top: -14 }}
          aria-hidden
        >
          {hatGlyph}
        </div>
      )}

      <svg
        viewBox="0 0 56 72"
        width={56}
        height={72}
        className={cn(
          'overflow-visible',
          running && 'runner-bob',
          pose === 'hurt' && 'runner-hurt',
        )}
        fill="none"
      >
        {/* Brazo trasero */}
        <g className={cn('runner-limb', running && 'arm-back')} style={{ transformOrigin: '28px 30px' }}>
          <rect x="24" y="28" width="7" height="20" rx="3.5" fill={color} opacity={0.6} />
        </g>

        {/* Piernas */}
        <g className={cn('runner-limb', running && 'leg-back')} style={{ transformOrigin: '24px 48px' }}>
          <rect x="20" y="46" width="8" height="22" rx="4" fill={color} opacity={0.7} />
        </g>
        <g className={cn('runner-limb', running && 'leg-front')} style={{ transformOrigin: '32px 48px' }}>
          <rect x="28" y="46" width="8" height="22" rx="4" fill={color} />
        </g>

        {/* Cuerpo */}
        <rect x="18" y="26" width="20" height="26" rx="10" fill={color} />

        {/* Cabeza */}
        <circle cx="28" cy="16" r="11" fill={color} />
        {/* Cara */}
        <circle cx="32" cy="15" r="1.8" fill="#0a0a0f" />
        <path d="M30 20 q3 2 6 0" stroke="#0a0a0f" strokeWidth="1.6" strokeLinecap="round" />

        {/* Brazo delantero */}
        <g className={cn('runner-limb', running && 'arm-front')} style={{ transformOrigin: '30px 30px' }}>
          <rect x="27" y="28" width="7" height="20" rx="3.5" fill={color} />
        </g>

        {/* Espada al atacar */}
        {pose === 'attack' && (
          <g className="runner-slash">
            <rect x="38" y="20" width="4" height="26" rx="2" fill="#e5e7eb" transform="rotate(35 40 33)" />
            <rect x="38" y="42" width="6" height="5" rx="2" fill="#a16207" transform="rotate(35 40 33)" />
          </g>
        )}
      </svg>
    </div>
  )
}
