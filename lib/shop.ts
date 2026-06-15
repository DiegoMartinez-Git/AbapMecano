import type { ShopItem, ItemSlot, Perk } from '@/types'

/**
 * Catálogo de la tienda del modo Aventura.
 * Vive en código (no en BD) para poder ampliarlo fácilmente.
 * El skin por defecto es gratuito y todo el mundo lo tiene equipado de inicio.
 */
export const DEFAULT_SKIN = 'skin_default'

export const SHOP_ITEMS: ShopItem[] = [
  // ── Skins (color del personaje) ──────────────────────────────
  { id: DEFAULT_SKIN, name: 'Dev clásico',  description: 'El color de siempre.',        price: 0,   type: 'skin', color: '#2563eb' },
  { id: 'skin_emerald', name: 'Esmeralda',   description: 'Verde compilado sin errores.', price: 120, type: 'skin', color: '#34d399' },
  { id: 'skin_amber',   name: 'Ámbar',       description: 'Cálido como un warning.',       price: 120, type: 'skin', color: '#f59e0b' },
  { id: 'skin_rose',    name: 'Rosa',        description: 'Estilo sin excepciones.',       price: 150, type: 'skin', color: '#fb7185' },
  { id: 'skin_cyan',    name: 'Cian',        description: 'Frío y eficiente.',             price: 150, type: 'skin', color: '#22d3ee' },
  { id: 'skin_gold',    name: 'Oro legendario', description: 'Solo para los más rápidos.', price: 800, type: 'skin', color: '#fbbf24' },

  // ── Sombreros ────────────────────────────────────────────────
  { id: 'hat_cap',    name: 'Gorra',        description: 'Para programar de noche.',     price: 100, type: 'hat', glyph: '🧢' },
  { id: 'hat_tophat', name: 'Chistera',     description: 'Elegancia enterprise.',        price: 250, type: 'hat', glyph: '🎩' },
  { id: 'hat_wizard', name: 'Gorro de mago', description: 'Para hacer magia con ABAP.',  price: 350, type: 'hat', glyph: '🧙' },
  { id: 'hat_crown',  name: 'Corona',       description: 'Rey del teclado.',             price: 500, type: 'hat', glyph: '👑' },

  // ── Mascotas (te siguen) ─────────────────────────────────────
  { id: 'pet_cat',    name: 'Gato',         description: 'Maúlla cuando aciertas.',      price: 250, type: 'pet', glyph: '🐱' },
  { id: 'pet_robot',  name: 'Robot',        description: 'Tu copiloto de IA.',           price: 300, type: 'pet', glyph: '🤖' },
  { id: 'pet_dragon', name: 'Dragón',       description: 'Quema bugs a distancia.',      price: 600, type: 'pet', glyph: '🐲' },

  // ── Estelas ──────────────────────────────────────────────────
  { id: 'trail_spark', name: 'Estela mágica', description: 'Deja chispas al correr.',    price: 200, type: 'trail', trailColor: '#a78bfa' },
  { id: 'trail_fire',  name: 'Estela de fuego', description: 'Vas que ardes.',           price: 280, type: 'trail', trailColor: '#fb7185' },
  { id: 'trail_cyan',  name: 'Estela neón',  description: 'Rastro cibernético.',         price: 280, type: 'trail', trailColor: '#22d3ee' },

  // ── Mejoras jugables (se activan al comprarlas) ──────────────
  { id: 'perk_life',   name: 'Vida extra',   description: 'Empiezas con un corazón más.', price: 400, type: 'perk', glyph: '❤️', perk: 'extraLife' },
  { id: 'perk_shield', name: 'Escudo',       description: 'Absorbe el primer golpe de cada partida.', price: 350, type: 'perk', glyph: '🛡️', perk: 'shield' },
  { id: 'perk_magnet', name: 'Imán de monedas', description: '+25% de monedas recogidas.', price: 450, type: 'perk', glyph: '🧲', perk: 'magnet' },
  { id: 'perk_double', name: 'Monedas x2',   description: 'Duplica las monedas de cada partida.', price: 700, type: 'perk', glyph: '💰', perk: 'doubleCoins' },
  { id: 'perk_jump',   name: 'Doble salto',  description: 'Saltas más alto y vistoso sobre los bugs.', price: 250, type: 'perk', glyph: '🦅', perk: 'doubleJump' },
]

export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((i) => [i.id, i])
)

export const SLOT_LABELS: Record<ItemSlot, string> = {
  skin:  'Personaje',
  hat:   'Sombreros',
  pet:   'Mascotas',
  trail: 'Estelas',
}

export function getItem(id: string): ShopItem | undefined {
  return SHOP_BY_ID[id]
}

export function isPerkActive(perks: Perk[], perk: Perk): boolean {
  return perks.includes(perk)
}
