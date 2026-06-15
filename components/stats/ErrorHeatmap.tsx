'use client'

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

interface ErrorHeatmapProps {
  errors: Record<string, number>
}

export function ErrorHeatmap({ errors }: ErrorHeatmapProps) {
  const allKeys = KEYBOARD_ROWS.flat()
  const maxErrors = Math.max(...allKeys.map(k => errors[k] ?? 0), 1)

  if (maxErrors === 0 || Object.keys(errors).length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--color-text-dim)]">
        Sin datos de errores aún. Completa más tests para ver tu heatmap.
      </div>
    )
  }

  function getColor(key: string): string {
    const count = errors[key] ?? 0
    if (count === 0) return 'transparent'
    const intensity = count / maxErrors
    const r = Math.round(248 * intensity)
    const g = Math.round(113 * (1 - intensity * 0.8))
    const b = Math.round(113 * (1 - intensity))
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.7})`
  }

  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5" style={{ paddingLeft: `${ri * 0.75}rem` }}>
          {row.map((key) => {
            const count = errors[key] ?? 0
            const intensity = count / maxErrors
            return (
              <div
                key={key}
                className="relative w-10 h-10 rounded-md flex flex-col items-center justify-center border border-[var(--color-border)] transition-all duration-300 group cursor-default"
                style={{ backgroundColor: getColor(key) }}
                title={`${key.toUpperCase()}: ${count} errores`}
              >
                <span className="text-sm font-mono font-semibold text-[var(--color-text-main)] uppercase">
                  {key}
                </span>
                {count > 0 && (
                  <span className="text-[9px] font-mono text-[var(--color-text-dim)] leading-none mt-0.5">
                    {count}
                  </span>
                )}
                {/* Tooltip */}
                {count > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-main)] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {count} error{count !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-[var(--color-text-dim)]">Sin errores</span>
        <div className="flex gap-0.5">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: `rgba(248, ${Math.round(113 * (1 - v * 0.8))}, ${Math.round(113 * (1 - v))}, ${0.2 + v * 0.7})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-[var(--color-text-dim)]">Muchos errores</span>
      </div>
    </div>
  )
}
