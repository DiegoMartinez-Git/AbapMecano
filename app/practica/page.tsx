import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getWeakKeys } from '@/lib/actions'
import { WeakKeyPractice } from '@/components/typing/WeakKeyPractice'

export default async function PracticaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weakKeys = await getWeakKeys()

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Práctica dirigida</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Texto generado con las teclas que más fallas, para reforzarlas.
          </p>
        </div>

        {weakKeys.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-dim)]">
            <p className="text-sm">Aún no tenemos datos de tus errores.</p>
            <p className="text-xs mt-1">Completa algunos tests y vuelve para practicar tus teclas flojas.</p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 rounded-md bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-dim)] transition-colors"
            >
              Ir a Mecanografía →
            </Link>
          </div>
        ) : (
          <WeakKeyPractice weakKeys={weakKeys} />
        )}
      </main>
    </>
  )
}
