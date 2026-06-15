import type { TextCategory, TestMode } from '@/types'

const WORDS_ES = [
  'el', 'la', 'de', 'que', 'en', 'un', 'no', 'se', 'por', 'con',
  'su', 'me', 'ya', 'si', 'ni', 'lo', 'le', 'al', 'del', 'las',
  'los', 'una', 'fue', 'han', 'hay', 'sin', 'mas', 'dos', 'tan', 'muy',
  'vez', 'era', 'eso', 'ser', 'dar', 'ver', 'eso', 'esa', 'ese',
  'pero', 'para', 'como', 'este', 'todo', 'bien', 'solo', 'cada', 'otro',
  'esta', 'ella', 'mundo', 'lugar', 'campo', 'punto', 'forma', 'parte',
  'clase', 'grupo', 'orden', 'nivel', 'valor', 'fecha', 'datos', 'color',
  'texto', 'nodo', 'error', 'causa', 'final', 'nuevo', 'clave', 'lista',
  'tipo', 'modo', 'paso', 'fase', 'base', 'zona', 'plan', 'meta', 'libre',
  'largo', 'corto', 'igual', 'medio', 'nunca', 'ahora', 'antes', 'desde',
  'hasta', 'claro', 'mismo', 'tanto', 'mucho', 'poco', 'luego', 'sobre',
  'entre', 'linea', 'tabla', 'archivo', 'flujo', 'tarea', 'etapa', 'ciclo',
  'bloque', 'opcion', 'modulo', 'inicio', 'salida', 'cambio',
  'tiempo', 'objeto', 'metodo', 'estado', 'evento', 'equipo', 'acuerdo',
  'usuario', 'recurso', 'proceso', 'sistema', 'empresa', 'trabajo',
  'persona', 'ciudad', 'proyecto', 'variable', 'funcion', 'servicio',
  'conocer', 'siempre', 'momento', 'recibir', 'ejemplo', 'resultado',
  'concepto', 'interfaz', 'conexion', 'contexto', 'definir', 'generar',
  'validar', 'ejecutar', 'procesar', 'calcular', 'mostrar', 'realizar',
  'aplicar', 'analizar', 'comparar', 'registrar', 'consultar', 'obtener',
  'gestionar', 'controlar', 'verificar', 'actualizar', 'eliminar', 'crear',
  'leer', 'escribir', 'buscar', 'encontrar', 'mejorar', 'reducir',
  'codigo', 'logica', 'bucle', 'clase', 'metodo', 'objeto', 'herencia',
  'instancia', 'servidor', 'cliente', 'peticion', 'respuesta', 'protocolo',
  'seguridad', 'rendimiento', 'escalable', 'modular', 'reutilizable',
]

const NUMBERS_WORDS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '10', '42', '100', '256', '1024', '2024',
  '0.5', '3.14', '2.0', '99.9',
]

const SYMBOLS_WORDS = [
  '()', '{}', '[]', '=>', '!=', '===', '!==',
  '&&', '||', '++', '--', '+=', '-=',
  '//', '/*', '*/', '<?', '?>',
]

export const SAP_PHRASES = [
  'SAP es un sistema empresarial que integra los procesos de negocio en una plataforma unica y centralizada',
  'el modulo de finanzas en SAP permite gestionar la contabilidad general y los activos fijos de la empresa',
  'ABAP es el lenguaje de programacion principal del ecosistema SAP orientado a objetos y eventos',
  'la transaccion SE38 permite crear editar y ejecutar programas ABAP en el entorno de desarrollo SAP',
  'los informes ABAP utilizan el componente ALV Grid para mostrar los datos tabulares al usuario final',
  'la tabla MARA en SAP contiene los datos maestros de materiales como numero descripcion y unidad de medida',
  'un BAPI es una interfaz estandar de SAP para acceder a los objetos de negocio desde sistemas externos',
  'los modulos de SAP incluyen finanzas logistica recursos humanos produccion gestion de calidad y ventas',
  'el customizing en SAP permite configurar el sistema segun las necesidades especificas de cada empresa cliente',
  'en ABAP una clase se define con la sentencia CLASS y sus metodos se implementan con la instruccion METHOD',
  'el sistema de transporte en SAP permite mover objetos entre los sistemas de desarrollo calidad y produccion',
  'los exits y BADIs son puntos de mejora estandar de SAP para anadir logica personalizada sin modificar el nucleo',
  'la transaccion SM30 se utiliza para mantener las tablas de customizing y configuracion en el sistema SAP',
  'en SAP el mandante representa una unidad organizativa independiente con sus propios datos maestros y configuracion',
  'los programas de tipo reporte en ABAP se ejecutan con la sentencia SUBMIT y pueden recibir parametros de entrada',
  'la instruccion SELECT en ABAP permite consultar datos de las tablas de base de datos del sistema SAP en tiempo real',
  'un function module en SAP es una funcion reutilizable que puede ser llamada desde cualquier programa ABAP del sistema',
  'el debugging en ABAP permite ejecutar el codigo paso a paso y examinar el contenido de las variables en cada punto',
]

function randomWord(): string {
  return WORDS_ES[Math.floor(Math.random() * WORDS_ES.length)]
}

function randomSapPhrase(): string {
  return SAP_PHRASES[Math.floor(Math.random() * SAP_PHRASES.length)]
}

export function generateText(
  mode: TestMode,
  count: number,
  category: TextCategory = 'generic',
  options: { numbers?: boolean; symbols?: boolean } = {}
): string {
  if (category === 'sap' || category === 'abap') {
    const pool = category === 'abap'
      ? SAP_PHRASES.filter(p => p.includes('ABAP') || p.includes('SELECT') || p.includes('METHOD'))
      : SAP_PHRASES
    const parts: string[] = []
    let total = 0
    while (total < count) {
      const phrase = pool[Math.floor(Math.random() * pool.length)]
      parts.push(phrase)
      total += phrase.split(' ').length
    }
    return parts.join(' ')
  }

  // Build extended word pool with numbers/symbols if enabled
  const wordPool = [...WORDS_ES]
  if (options.numbers) wordPool.push(...NUMBERS_WORDS, ...NUMBERS_WORDS)
  if (options.symbols) wordPool.push(...SYMBOLS_WORDS, ...SYMBOLS_WORDS)

  const pickWord = () => wordPool[Math.floor(Math.random() * wordPool.length)]

  const segments: string[] = []
  let totalWords = 0

  while (totalWords < count) {
    const injectSap = Math.random() < 0.18 && totalWords + 12 <= count
    if (injectSap) {
      const phrase = randomSapPhrase()
      segments.push(phrase)
      totalWords += phrase.split(' ').length
    } else {
      const batchSize = Math.min(Math.floor(Math.random() * 4) + 3, count - totalWords)
      const batch = Array.from({ length: batchSize }, pickWord)
      segments.push(batch.join(' '))
      totalWords += batchSize
    }
  }

  return segments.join(' ')
}

/**
 * Genera texto cargado con las teclas que el usuario más falla,
 * priorizando palabras que contienen esas letras (práctica dirigida).
 */
export function generateWeakKeyText(weakKeys: string[], count = 40): string {
  const keys = weakKeys.map((k) => k.toLowerCase()).filter((k) => /^[a-zñ]$/.test(k))
  if (keys.length === 0) return generateText('words', count, 'generic')

  const pool = WORDS_ES.filter((w) => keys.some((k) => w.includes(k)))
  const base = pool.length >= 12 ? pool : WORDS_ES

  // Ordena por nº de teclas débiles que contiene cada palabra (más útiles primero)
  const weighted = base.slice().sort(
    (a, b) =>
      keys.filter((k) => b.includes(k)).length - keys.filter((k) => a.includes(k)).length
  )
  const top = weighted.slice(0, Math.max(15, Math.floor(weighted.length / 2)))

  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(top[Math.floor(Math.random() * top.length)])
  }
  return words.join(' ')
}

export const TIME_LIMITS = [15, 30, 60, 120] as const
export const WORD_COUNTS = [10, 25, 50, 100] as const
