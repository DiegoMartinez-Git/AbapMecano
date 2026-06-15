'use client'

interface DataPoint { wpm: number; date: string }

export function WpmChart({ data }: { data: DataPoint[] }) {
  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-[var(--color-text-dim)]">
        Necesitas al menos 2 tests para ver la gráfica
      </div>
    )
  }

  const maxWpm = Math.max(...data.map((d) => d.wpm), 10)
  const minWpm = Math.max(Math.min(...data.map((d) => d.wpm)) - 10, 0)
  const range  = maxWpm - minWpm || 1

  const W = 600
  const H = 120
  const PAD = { t: 10, r: 10, b: 24, l: 36 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const points = data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * innerW,
    y: PAD.t + (1 - (d.wpm - minWpm) / range) * innerH,
    wpm: d.wpm,
    date: d.date,
  }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${PAD.t + innerH} L ${PAD.l} ${PAD.t + innerH} Z`

  // Y-axis labels
  const yLabels = [minWpm, Math.round(minWpm + range / 2), maxWpm]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: '8rem' }}
    >
      <defs>
        <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   style={{ stopColor: 'var(--color-accent)' }} stopOpacity="0.18" />
          <stop offset="100%" style={{ stopColor: 'var(--color-accent)' }} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = PAD.t + (1 - (v - minWpm) / range) * innerH
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={PAD.l + innerW} y2={y}
              style={{ stroke: 'var(--color-border)' }} strokeWidth="1" strokeDasharray="3,4" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end"
              fontSize="9" style={{ fill: 'var(--color-text-dim)' }}>{v}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#wpmGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" style={{ stroke: 'var(--color-accent)' }} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3"
          style={{ fill: 'var(--color-accent)', stroke: 'var(--color-surface)' }} strokeWidth="1.5">
          <title>{p.wpm} PPM — {p.date}</title>
        </circle>
      ))}

      {/* X-axis: first and last date */}
      <text x={PAD.l}              y={H - 4} fontSize="9" style={{ fill: 'var(--color-text-dim)' }}>{points[0].date}</text>
      <text x={PAD.l + innerW}     y={H - 4} fontSize="9" style={{ fill: 'var(--color-text-dim)' }} textAnchor="end">
        {points[points.length - 1].date}
      </text>
    </svg>
  )
}
