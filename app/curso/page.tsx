import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getLessonProgress } from '@/lib/actions'
import { Course } from '@/components/course/Course'

export default async function CursoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const progress = await getLessonProgress()

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-12 max-w-[1400px] mx-auto w-full">
        <Course initialProgress={progress} />
      </main>
    </>
  )
}
