'use client'

interface LiveSparklineProps {
  data: number[]
}

export function LiveSparkline({ data }: LiveSparklineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data, 10)
  const w = 100
  const h = 40
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v / max) * (h - pad * 2))
    return `${x},${y}`
  }).join(' ')

  const last = data[data.length - 1]

  return (
    <div className="flex items-center gap-3 mt-1">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-20 h-8"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="spark-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--color-accent)' }} stopOpacity="0.4" />
            <stop offset="100%" style={{ stopColor: 'var(--color-accent)' }} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polyline
          points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
          fill="url(#spark-gradient)"
          stroke="none"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          style={{ stroke: 'var(--color-accent)' }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last dot */}
        {(() => {
          const lastPt = points.split(' ').pop()!.split(',')
          return (
            <circle
              cx={lastPt[0]}
              cy={lastPt[1]}
              r="3"
              style={{ fill: 'var(--color-accent)' }}
            />
          )
        })()}
      </svg>
      <span className="text-xs font-mono text-[var(--color-accent)] tabular-nums">
        {last} <span className="text-[var(--color-text-dim)]">PPM</span>
      </span>
    </div>
  )
}
