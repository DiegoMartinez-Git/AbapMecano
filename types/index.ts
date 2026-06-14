export type TestMode = 'timed' | 'words'
export type TestStatus = 'idle' | 'countdown' | 'running' | 'finished'
export type TextCategory = 'generic' | 'sap' | 'abap' | 'daily'
export type TimeLimit = 15 | 30 | 60 | 120
export type WordCount = 10 | 25 | 50 | 100

export interface TestResult {
  wpm: number
  rawWpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
  mode: TestMode
  timeLimit?: TimeLimit
  wordCount?: WordCount
  category: TextCategory
  completedAt: Date
  charErrors?: Record<string, number>
}
