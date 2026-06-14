import type { TestResult } from '@/types'

export interface AchievementCheck {
  id: string
  condition: (result: TestResult, totalTests: number, streakDays: number) => boolean
}

export const ACHIEVEMENT_CHECKS: AchievementCheck[] = [
  { id: 'first_test',    condition: (_, total) => total === 1 },
  { id: 'speed_30',      condition: (r) => r.wpm >= 30 },
  { id: 'speed_60',      condition: (r) => r.wpm >= 60 },
  { id: 'speed_100',     condition: (r) => r.wpm >= 100 },
  { id: 'accuracy_100',  condition: (r) => r.accuracy === 100 && r.totalChars >= 50 },
  { id: 'streak_3',      condition: (_, __, s) => s >= 3 },
  { id: 'streak_7',      condition: (_, __, s) => s >= 7 },
]

export function xpForLevel(level: number): number {
  return level ** 2 * 100
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpGainedForResult(wpm: number): number {
  return 10 + Math.floor(wpm / 10) * 5
}
