import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getAdventureState } from '@/lib/actions'
import { Adventure } from '@/components/adventure/Adventure'

export default async function AventuraPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const state = (await getAdventureState()) ?? {
    coins: 0, best: 0, owned: ['skin_default'], equipped: { skin: 'skin_default' }, perks: [],
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10 w-full">
        <Adventure initial={state} />
      </main>
    </>
  )
}
