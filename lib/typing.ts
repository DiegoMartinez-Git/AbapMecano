export function calculateWPM(correctChars: number, elapsedMs: number): number {
  if (elapsedMs < 500 || correctChars === 0) return 0
  const minutes = elapsedMs / 1000 / 60
  return Math.round((correctChars / 5) / minutes)
}

export function calculateRawWPM(totalChars: number, elapsedMs: number): number {
  if (elapsedMs < 500 || totalChars === 0) return 0
  const minutes = elapsedMs / 1000 / 60
  return Math.round((totalChars / 5) / minutes)
}

export function calculateAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped === 0) return 100
  return Math.round((correctChars / totalTyped) * 1000) / 10
}

export function getCorrectChars(text: string, typed: string): number {
  let count = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === text[i]) count++
  }
  return count
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}m` : `${m}:${s.toString().padStart(2, '0')}`
}
