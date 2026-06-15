'use server'

import { createClient } from '@/lib/supabase/server'
import type { TestResult, AdventureState, ItemSlot, Perk, LessonProgressRow } from '@/types'
import { ACHIEVEMENT_CHECKS, xpGainedForResult, levelFromXp } from '@/lib/achievements'
import { SHOP_BY_ID, DEFAULT_SKIN } from '@/lib/shop'
import { LESSON_BY_ID, computeStars } from '@/lib/lessons'

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

/** Top de teclas que el usuario más falla (para la práctica dirigida). */
export async function getWeakKeys(limit = 7): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('typing_results')
    .select('char_errors')
    .eq('user_id', user.id)
    .not('char_errors', 'eq', '{}')
    .limit(80)

  const agg: Record<string, number> = {}
  for (const row of data ?? []) {
    const errs = row.char_errors as Record<string, number> | null
    if (!errs) continue
    for (const [k, v] of Object.entries(errs)) {
      if (!/^[a-zñA-ZÑ]$/.test(k)) continue
      agg[k.toLowerCase()] = (agg[k.toLowerCase()] ?? 0) + Number(v)
    }
  }

  return Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k)
}

// ── Curso por lecciones ────────────────────────────────────────

export async function getLessonProgress(): Promise<Record<string, LessonProgressRow>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id, stars, best_wpm, best_accuracy')
    .eq('user_id', user.id)

  return Object.fromEntries(
    (data ?? []).map((r) => [
      r.lesson_id,
      { stars: r.stars, best_wpm: r.best_wpm, best_accuracy: Number(r.best_accuracy) },
    ])
  )
}

/** Guarda el resultado de una lección. Las estrellas se calculan en el servidor. */
export async function saveLessonResult(
  lessonId: string,
  wpm: number,
  accuracy: number
): Promise<{ stars: number } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const lesson = LESSON_BY_ID[lessonId]
  if (!lesson) return { error: 'Lección no válida' }

  const safeWpm = Math.max(0, Math.min(Math.round(wpm), 400))
  const safeAcc = Math.max(0, Math.min(accuracy, 100))
  const stars   = computeStars(safeWpm, safeAcc, lesson.minWpm)

  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('stars, best_wpm, best_accuracy')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  await supabase.from('lesson_progress').upsert(
    {
      user_id:       user.id,
      lesson_id:     lessonId,
      stars:         Math.max(stars, existing?.stars ?? 0),
      best_wpm:      Math.max(safeWpm, existing?.best_wpm ?? 0),
      best_accuracy: Math.max(safeAcc, Number(existing?.best_accuracy ?? 0)),
      updated_at:    new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  )

  return { stars }
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

// ── Modo Aventura ──────────────────────────────────────────────

/** Construye el estado de aventura (monedas, ítems poseídos/equipados, mejoras). */
export async function getAdventureState(): Promise<AdventureState | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: items }] = await Promise.all([
    supabase.from('users_profile').select('coins, adventure_best').eq('id', user.id).single(),
    supabase.from('game_items').select('item_id, equipped').eq('user_id', user.id),
  ])

  // El skin por defecto siempre se posee.
  const owned = new Set<string>([DEFAULT_SKIN])
  const equipped: Partial<Record<ItemSlot, string>> = { skin: DEFAULT_SKIN }
  const perks: Perk[] = []

  for (const row of items ?? []) {
    owned.add(row.item_id)
    const item = SHOP_BY_ID[row.item_id]
    if (!item) continue
    if (item.type === 'perk') {
      if (item.perk) perks.push(item.perk)
    } else if (row.equipped) {
      equipped[item.type] = row.item_id
    }
  }

  return {
    coins: profile?.coins ?? 0,
    best:  profile?.adventure_best ?? 0,
    owned: [...owned],
    equipped,
    perks,
  }
}

interface ShopActionResult {
  error?: string
  coins?: number
  owned?: string[]
  equipped?: Partial<Record<ItemSlot, string>>
  perks?: Perk[]
}

/** Compra un ítem: valida monedas, descuenta y lo equipa (cosmético) o activa (perk). */
export async function buyItem(itemId: string): Promise<ShopActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const item = SHOP_BY_ID[itemId]
  if (!item) return { error: 'Ítem no válido' }

  const { data: profile } = await supabase
    .from('users_profile').select('coins').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const { data: existing } = await supabase
    .from('game_items').select('item_id').eq('user_id', user.id).eq('item_id', itemId).maybeSingle()
  if (existing) return { error: 'Ya tienes este ítem' }

  if ((profile.coins ?? 0) < item.price) return { error: 'No tienes suficientes monedas' }

  const newCoins = (profile.coins ?? 0) - item.price
  const { error: coinErr } = await supabase
    .from('users_profile').update({ coins: newCoins }).eq('id', user.id)
  if (coinErr) return { error: coinErr.message }

  const { error: insErr } = await supabase
    .from('game_items').insert({ user_id: user.id, item_id: itemId, equipped: true })
  if (insErr) {
    // revertir el cobro si falla la inserción
    await supabase.from('users_profile').update({ coins: profile.coins }).eq('id', user.id)
    return { error: insErr.message }
  }

  // Los cosméticos recién comprados se auto-equipan: desequipar los del mismo slot.
  if (item.type !== 'perk') {
    const siblings = Object.values(SHOP_BY_ID)
      .filter((i) => i.type === item.type && i.id !== itemId)
      .map((i) => i.id)
    if (siblings.length) {
      await supabase
        .from('game_items')
        .update({ equipped: false })
        .eq('user_id', user.id)
        .in('item_id', siblings)
    }
  }

  const state = await getAdventureState()
  return { coins: state?.coins, owned: state?.owned, equipped: state?.equipped, perks: state?.perks }
}

/** Equipa un cosmético ya poseído (uno por slot). */
export async function equipItem(itemId: string): Promise<ShopActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const item = SHOP_BY_ID[itemId]
  if (!item || item.type === 'perk') return { error: 'Ítem no equipable' }

  // El skin por defecto puede no estar en la tabla todavía.
  if (itemId !== DEFAULT_SKIN) {
    const { data: owned } = await supabase
      .from('game_items').select('item_id').eq('user_id', user.id).eq('item_id', itemId).maybeSingle()
    if (!owned) return { error: 'No tienes este ítem' }
  }

  const siblings = Object.values(SHOP_BY_ID)
    .filter((i) => i.type === item.type)
    .map((i) => i.id)

  await supabase
    .from('game_items')
    .update({ equipped: false })
    .eq('user_id', user.id)
    .in('item_id', siblings)

  if (itemId !== DEFAULT_SKIN) {
    await supabase
      .from('game_items')
      .update({ equipped: true })
      .eq('user_id', user.id)
      .eq('item_id', itemId)
  }

  const state = await getAdventureState()
  return { coins: state?.coins, owned: state?.owned, equipped: state?.equipped, perks: state?.perks }
}

/** Guarda el resultado de una partida: suma monedas y actualiza el récord. */
export async function finishAdventureRun(
  coinsEarned: number,
  score: number
): Promise<{ coins: number; best: number } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const earned = Math.max(0, Math.min(Math.round(coinsEarned), 100000))
  const safeScore = Math.max(0, Math.min(Math.round(score), 1000000))

  const { data: profile } = await supabase
    .from('users_profile').select('coins, adventure_best').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const newCoins = (profile.coins ?? 0) + earned
  const newBest  = Math.max(profile.adventure_best ?? 0, safeScore)

  const { error } = await supabase
    .from('users_profile')
    .update({ coins: newCoins, adventure_best: newBest })
    .eq('id', user.id)
  if (error) return { error: error.message }

  return { coins: newCoins, best: newBest }
}
