'use server'

import { createClient } from '@/lib/supabase/server'
import type { TestResult } from '@/types'
import { ACHIEVEMENT_CHECKS, xpGainedForResult, levelFromXp } from '@/lib/achievements'

interface SaveResult {
  error?: string
  success?: boolean
  newAchievements?: { id: string; name: string; icon: string; xp_reward: number }[]
  leveledUp?: boolean
  newLevel?: number
  xpGained?: number
}

export async function saveTypingResult(result: TestResult): Promise<SaveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('typing_results')
    .insert({
      user_id:       user.id,
      mode:          result.mode,
      time_limit:    result.timeLimit ?? null,
      word_count:    result.wordCount ?? null,
      wpm:           result.wpm,
      raw_wpm:       result.rawWpm,
      accuracy:      result.accuracy,
      errors:        result.errors,
      correct_chars: result.correctChars,
      total_chars:   result.totalChars,
      duration_secs: result.duration,
      text_category: result.category,
      char_errors:   result.charErrors ?? {},
    })

  if (error) return { error: error.message }

  const { count: totalTests } = await supabase
    .from('typing_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const profileData = await updateStreakAndXp(supabase, user.id, result.wpm)
  if (!profileData) return { success: true }

  const { data: existingAch } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', user.id)

  const alreadyHas  = new Set(existingAch?.map((a) => a.achievement_id) ?? [])
  const toUnlockIds = ACHIEVEMENT_CHECKS
    .filter(({ id, condition }) =>
      !alreadyHas.has(id) &&
      condition(result, totalTests ?? 0, profileData.newStreak)
    )
    .map((a) => a.id)

  let newAchievements: SaveResult['newAchievements'] = []

  if (toUnlockIds.length > 0) {
    await supabase.from('user_achievements').insert(
      toUnlockIds.map((id) => ({ user_id: user.id, achievement_id: id }))
    )
    const { data: achDetails } = await supabase
      .from('achievements')
      .select('id, name, icon, xp_reward')
      .in('id', toUnlockIds)
    newAchievements = achDetails ?? []

    const bonusXp = (achDetails ?? []).reduce((s, a) => s + a.xp_reward, 0)
    if (bonusXp > 0) {
      const updatedXp = profileData.newXp + bonusXp
      await supabase
        .from('users_profile')
        .update({ xp: updatedXp, level: levelFromXp(updatedXp) })
        .eq('id', user.id)
    }
  }

  return {
    success:         true,
    newAchievements,
    leveledUp:       profileData.leveledUp,
    newLevel:        profileData.newLevel,
    xpGained:        profileData.xpGained,
  }
}

async function updateStreakAndXp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  wpm: number
) {
  const { data: profile } = await supabase
    .from('users_profile')
    .select('xp, level, streak_days, last_activity')
    .eq('id', userId)
    .single()

  if (!profile) return null

  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let newStreak = profile.streak_days
  if (profile.last_activity === yesterday)  newStreak = profile.streak_days + 1
  else if (profile.last_activity !== today) newStreak = 1

  const xpGained = xpGainedForResult(wpm)
  const newXp    = profile.xp + xpGained
  const oldLevel = profile.level
  const newLevel = levelFromXp(newXp)

  await supabase
    .from('users_profile')
    .update({ xp: newXp, level: newLevel, streak_days: newStreak, last_activity: today })
    .eq('id', userId)

  return { newXp, newLevel, newStreak, xpGained, leveledUp: newLevel > oldLevel }
}

export async function getPersonalBest(
  mode: string,
  timeLimit?: number,
  wordCount?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let query = supabase
    .from('typing_results')
    .select('wpm, accuracy')
    .eq('user_id', user.id)
    .eq('mode', mode)
    .order('wpm', { ascending: false })
    .limit(1)

  if (mode === 'timed' && timeLimit) query = query.eq('time_limit', timeLimit)
  if (mode === 'words' && wordCount)  query = query.eq('word_count', wordCount)

  const { data } = await query
  return data?.[0] ?? null
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: data }
}

export async function updateUsername(username: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const clean = username.trim().slice(0, 30)
  if (clean.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres' }

  const { error } = await supabase
    .from('users_profile')
    .update({ username: clean })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getStatistics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: profile },
    { data: recent },
    { data: bestPerMode },
    { data: userAch },
    { data: allAch },
    { count: totalTests },
    { data: charErrorRows },
  ] = await Promise.all([
    supabase.from('users_profile').select('*').eq('id', user.id).single(),
    supabase.from('typing_results')
      .select('wpm, raw_wpm, accuracy, errors, mode, time_limit, word_count, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true })
      .limit(30),
    supabase.from('typing_results')
      .select('wpm, accuracy, mode, time_limit, word_count')
      .eq('user_id', user.id)
      .order('wpm', { ascending: false }),
    supabase.from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id),
    supabase.from('achievements').select('*'),
    supabase.from('typing_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase.from('typing_results')
      .select('char_errors')
      .eq('user_id', user.id)
      .not('char_errors', 'eq', '{}')
      .limit(50),
  ])

  // Aggregate char errors across all results
  const aggregatedErrors: Record<string, number> = {}
  for (const row of charErrorRows ?? []) {
    const errs = row.char_errors as Record<string, number> | null
    if (!errs) continue
    for (const [k, v] of Object.entries(errs)) {
      aggregatedErrors[k] = (aggregatedErrors[k] ?? 0) + Number(v)
    }
  }

  return { profile, recent, bestPerMode, achievements: userAch, allAchievements: allAch, totalTests, aggregatedErrors }
}

export async function saveShortcutProgress(
  shortcutId: string,
  category: string,
  success: boolean
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('shortcut_progress')
    .select('attempts, successes')
    .eq('user_id', user.id)
    .eq('shortcut_id', shortcutId)
    .single()

  const attempts  = (existing?.attempts  ?? 0) + 1
  const successes = (existing?.successes ?? 0) + (success ? 1 : 0)
  const mastered  = successes >= 3 && (successes / attempts) >= 0.8

  await supabase
    .from('shortcut_progress')
    .upsert({
      user_id:        user.id,
      shortcut_id:    shortcutId,
      category,
      attempts,
      successes,
      mastered,
      last_practiced: new Date().toISOString(),
    }, { onConflict: 'user_id,shortcut_id' })
}

export async function getShortcutProgress(): Promise<Record<string, { attempts: number; successes: number; mastered: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('shortcut_progress')
    .select('shortcut_id, attempts, successes, mastered')
    .eq('user_id', user.id)

  return Object.fromEntries(
    (data ?? []).map((r) => [r.shortcut_id, { attempts: r.attempts, successes: r.successes, mastered: r.mastered }])
  )
}

export async function checkDailyChallenge(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from('typing_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('text_category', 'daily')
    .gte('completed_at', `${today}T00:00:00Z`)
    .lt('completed_at', `${today}T23:59:59Z`)

  return (count ?? 0) > 0
}
