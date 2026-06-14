import { Navbar } from '@/components/layout/Navbar'
import { TypingTest } from '@/components/typing/TypingTest'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)] mb-2">
              Mecanografía
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Mejora tu velocidad · Aprende terminología SAP/ABAP escribiendo
            </p>
          </div>
          <TypingTest />
        </div>
      </main>
    </>
  )
}
