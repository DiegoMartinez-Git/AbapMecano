import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FONT_SCALES = [
  { label: 'Pequeña', value: 0.85 },
  { label: 'Normal',  value: 1 },
  { label: 'Grande',  value: 1.25 },
  { label: 'Enorme',  value: 1.55 },
] as const

interface SettingsStore {
  /** Multiplicador del tamaño del texto de mecanografía */
  fontScale: number
  /** Mostrar el teclado con guía de dedos bajo el test */
  showKeyboard: boolean
  setFontScale: (n: number) => void
  setShowKeyboard: (v: boolean) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      fontScale: 1,
      showKeyboard: true,
      setFontScale: (n) => set({ fontScale: n }),
      setShowKeyboard: (v) => set({ showKeyboard: v }),
    }),
    { name: 'abapmecano-settings' }
  )
)
