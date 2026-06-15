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

// ── Modo Aventura ──────────────────────────────────────────────
export type ItemSlot = 'skin' | 'hat' | 'pet' | 'trail'
export type ItemType = ItemSlot | 'perk'
export type Perk = 'magnet' | 'shield' | 'doubleCoins' | 'extraLife' | 'doubleJump'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: ItemType
  /** Color del personaje (solo skins) */
  color?: string
  /** Glifo/emoji para sombreros, mascotas y mejoras */
  glyph?: string
  /** Color de la estela (solo trails) */
  trailColor?: string
  /** Mejora jugable asociada (solo type 'perk') */
  perk?: Perk
}

/** Progreso de una lección del curso */
export interface LessonProgressRow {
  stars: number
  best_wpm: number
  best_accuracy: number
}

/** Estado de los ítems de un usuario, agrupado para el juego y la tienda */
export interface AdventureState {
  coins: number
  best: number
  /** ids de ítems que el usuario posee */
  owned: string[]
  /** ítem equipado por cada slot cosmético */
  equipped: Partial<Record<ItemSlot, string>>
  /** mejoras activas (perks poseídos) */
  perks: Perk[]
}
