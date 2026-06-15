import { generateText } from './texts'

export type LessonType = 'drill' | 'words' | 'caps' | 'punct' | 'numbers' | 'symbols' | 'abap'

export interface Lesson {
  id: string
  n: number
  title: string
  subtitle: string
  type: LessonType
  /** Conjunto de caracteres para lecciones de tipo 'drill' */
  charset?: string
  /** PPM mínimo para aprobar (la precisión mínima siempre es 90%) */
  minWpm: number
}

export const LESSONS: Lesson[] = [
  { id: 'home',    n: 1, title: 'Fila central',     subtitle: 'a s d f · j k l ñ',       type: 'drill',   charset: 'asdfjklñ',                          minWpm: 18 },
  { id: 'top',     n: 2, title: 'Fila superior',    subtitle: 'q w e r t y u i o p',     type: 'drill',   charset: 'asdfjklñqwertyuiop',                minWpm: 20 },
  { id: 'bottom',  n: 3, title: 'Fila inferior',    subtitle: 'z x c v b n m',           type: 'drill',   charset: 'asdfghjklñqwertyuiopzxcvbnm',       minWpm: 22 },
  { id: 'letters', n: 4, title: 'Todas las letras', subtitle: 'palabras completas',      type: 'words',                                                 minWpm: 25 },
  { id: 'caps',    n: 5, title: 'Mayúsculas',       subtitle: 'uso de Shift',            type: 'caps',                                                  minWpm: 26 },
  { id: 'punct',   n: 6, title: 'Puntuación',       subtitle: ', . ; :',                 type: 'punct',                                                 minWpm: 28 },
  { id: 'numbers', n: 7, title: 'Números',          subtitle: '0 1 2 3 4 5 6 7 8 9',     type: 'numbers',                                               minWpm: 28 },
  { id: 'symbols', n: 8, title: 'Símbolos',         subtitle: '( ) { } => != &&',        type: 'symbols',                                               minWpm: 30 },
  { id: 'abap',    n: 9, title: 'ABAP / SAP',       subtitle: 'terminología real',       type: 'abap',                                                  minWpm: 32 },
]

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
)

function drill(charset: string, count = 32): string {
  const chars = charset.split('')
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    const len = 3 + Math.floor(Math.random() * 4) // 3-6 letras
    let w = ''
    for (let j = 0; j < len; j++) w += chars[Math.floor(Math.random() * chars.length)]
    words.push(w)
  }
  return words.join(' ')
}

export function generateLessonText(lesson: Lesson): string {
  switch (lesson.type) {
    case 'drill':
      return drill(lesson.charset ?? 'asdfjklñ', 32)
    case 'words':
      return generateText('words', 35, 'generic')
    case 'caps': {
      const base = generateText('words', 30, 'generic').split(' ')
      return base.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
    case 'punct': {
      const base = generateText('words', 30, 'generic').split(' ')
      const marks = [',', '.', ';', ':']
      return base
        .map((w, i) => (i > 0 && i % 4 === 3 ? w + marks[Math.floor(Math.random() * marks.length)] : w))
        .join(' ')
    }
    case 'numbers':
      return generateText('words', 35, 'generic', { numbers: true })
    case 'symbols':
      return generateText('words', 30, 'generic', { symbols: true })
    case 'abap':
      return generateText('words', 35, 'sap')
    default:
      return generateText('words', 35, 'generic')
  }
}

/** Estrellas obtenidas (0 = no aprobado). Precisión mínima 90% + PPM por lección. */
export function computeStars(wpm: number, accuracy: number, minWpm: number): number {
  if (accuracy < 90 || wpm < minWpm) return 0
  if (accuracy >= 96 && wpm >= minWpm + 16) return 3
  if (accuracy >= 93 && wpm >= minWpm + 8) return 2
  return 1
}
