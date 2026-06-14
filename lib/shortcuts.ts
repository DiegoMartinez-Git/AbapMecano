export type ShortcutCategory = 'windows' | 'vscode' | 'linux' | 'browser'

export interface Shortcut {
  id: string
  category: ShortcutCategory
  action: string
  description: string
  keys: string[]     // teclas tal como aparecen en la UI
  comboStr: string   // cadena normalizada para comparar: "ctrl+shift+p"
}

function shortcut(
  id: string,
  category: ShortcutCategory,
  action: string,
  description: string,
  keys: string[]
): Shortcut {
  const comboStr = keys
    .map((k) => k.toLowerCase())
    .sort((a, b) => {
      const order = ['ctrl', 'alt', 'shift', 'meta', 'win']
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      if (ai !== -1 && bi === -1) return -1
      if (bi !== -1 && ai === -1) return 1
      return 0
    })
    .join('+')
  return { id, category, action, description, keys, comboStr }
}

export const SHORTCUTS: Shortcut[] = [
  // ── Windows ─────────────────────────────────────────────────────
  shortcut('win-copy',       'windows', 'Copiar',                'Copia el texto o elemento seleccionado',          ['Ctrl', 'C']),
  shortcut('win-paste',      'windows', 'Pegar',                 'Pega el contenido del portapapeles',              ['Ctrl', 'V']),
  shortcut('win-cut',        'windows', 'Cortar',                'Corta el texto o elemento seleccionado',          ['Ctrl', 'X']),
  shortcut('win-undo',       'windows', 'Deshacer',              'Deshace la última acción realizada',              ['Ctrl', 'Z']),
  shortcut('win-redo',       'windows', 'Rehacer',               'Rehace la acción deshecha',                       ['Ctrl', 'Y']),
  shortcut('win-select-all', 'windows', 'Seleccionar todo',      'Selecciona todo el contenido',                    ['Ctrl', 'A']),
  shortcut('win-save',       'windows', 'Guardar',               'Guarda el documento actual',                      ['Ctrl', 'S']),
  shortcut('win-find',       'windows', 'Buscar',                'Abre el cuadro de búsqueda',                      ['Ctrl', 'F']),
  shortcut('win-new',        'windows', 'Nuevo',                 'Crea un nuevo archivo o documento',               ['Ctrl', 'N']),
  shortcut('win-close',      'windows', 'Cerrar ventana',        'Cierra la ventana o aplicación actual',           ['Alt', 'F4']),
  shortcut('win-switch',     'windows', 'Cambiar ventana',       'Alterna entre ventanas abiertas',                 ['Alt', 'Tab']),
  shortcut('win-desktop',    'windows', 'Mostrar escritorio',    'Minimiza todas las ventanas y muestra el escritorio', ['Win', 'D']),
  shortcut('win-lock',       'windows', 'Bloquear pantalla',     'Bloquea el ordenador',                            ['Win', 'L']),
  shortcut('win-taskmanager','windows', 'Administrador de tareas','Abre el administrador de tareas directamente',   ['Ctrl', 'Shift', 'Esc']),
  shortcut('win-run',        'windows', 'Ejecutar',              'Abre el cuadro de diálogo Ejecutar',              ['Win', 'R']),
  shortcut('win-explorer',   'windows', 'Explorador de archivos','Abre el explorador de Windows',                   ['Win', 'E']),

  // ── VS Code ─────────────────────────────────────────────────────
  shortcut('vsc-palette',    'vscode', 'Paleta de comandos',     'Accede a todos los comandos de VS Code',          ['Ctrl', 'Shift', 'P']),
  shortcut('vsc-quickopen',  'vscode', 'Abrir archivo rápido',   'Busca y abre archivos por nombre',                ['Ctrl', 'P']),
  shortcut('vsc-terminal',   'vscode', 'Terminal integrada',     'Abre o cierra la terminal integrada',             ['Ctrl', '`']),
  shortcut('vsc-comment',    'vscode', 'Comentar línea',         'Comenta o descomenta la línea actual',            ['Ctrl', '/']),
  shortcut('vsc-format',     'vscode', 'Formatear documento',    'Formatea el código del archivo actual',           ['Ctrl', 'Shift', 'I']),
  shortcut('vsc-sidebar',    'vscode', 'Barra lateral',          'Muestra u oculta la barra lateral',               ['Ctrl', 'B']),
  shortcut('vsc-explorer',   'vscode', 'Panel de archivos',      'Abre el explorador de archivos',                  ['Ctrl', 'Shift', 'E']),
  shortcut('vsc-search',     'vscode', 'Buscar en proyecto',     'Busca texto en todos los archivos del proyecto',  ['Ctrl', 'Shift', 'F']),
  shortcut('vsc-definition', 'vscode', 'Ir a definición',        'Navega a la definición del símbolo seleccionado', ['F12']),
  shortcut('vsc-rename',     'vscode', 'Renombrar símbolo',      'Renombra todas las instancias del símbolo',       ['F2']),
  shortcut('vsc-multisel',   'vscode', 'Selección múltiple',     'Añade cursor en todas las ocurrencias seleccionadas', ['Ctrl', 'Shift', 'L']),
  shortcut('vsc-nextsel',    'vscode', 'Siguiente ocurrencia',   'Añade cursor en la siguiente ocurrencia',         ['Ctrl', 'D']),
  shortcut('vsc-moveline',   'vscode', 'Mover línea',            'Mueve la línea actual arriba o abajo',            ['Alt', 'ArrowUp']),
  shortcut('vsc-spliteditor','vscode', 'Dividir editor',         'Abre una segunda vista del editor',               ['Ctrl', 'Shift', '5']),

  // ── Linux Terminal ───────────────────────────────────────────────
  shortcut('linux-cancel',   'linux', 'Cancelar proceso',       'Envía señal SIGINT al proceso en primer plano',   ['Ctrl', 'C']),
  shortcut('linux-suspend',  'linux', 'Suspender proceso',      'Envía señal SIGTSTP y suspende el proceso',       ['Ctrl', 'Z']),
  shortcut('linux-eof',      'linux', 'EOF / Cerrar terminal',  'Envía señal de fin de fichero o cierra la sesión',['Ctrl', 'D']),
  shortcut('linux-clear',    'linux', 'Limpiar terminal',       'Borra la pantalla de la terminal',                ['Ctrl', 'L']),
  shortcut('linux-history',  'linux', 'Buscar en historial',    'Busca comandos en el historial de la terminal',   ['Ctrl', 'R']),
  shortcut('linux-home',     'linux', 'Inicio de línea',        'Mueve el cursor al inicio de la línea',           ['Ctrl', 'A']),
  shortcut('linux-end',      'linux', 'Final de línea',         'Mueve el cursor al final de la línea',            ['Ctrl', 'E']),
  shortcut('linux-deleol',   'linux', 'Borrar hasta el final',  'Elimina desde el cursor hasta el final de línea', ['Ctrl', 'K']),
  shortcut('linux-delbow',   'linux', 'Borrar palabra anterior','Elimina la palabra inmediatamente anterior',       ['Ctrl', 'W']),
  shortcut('linux-autocomplete', 'linux', 'Autocompletar',      'Autocompleta comandos, rutas y nombres de archivo',['Tab']),

  // ── Navegador ────────────────────────────────────────────────────
  shortcut('br-newtab',      'browser', 'Nueva pestaña',        'Abre una nueva pestaña en el navegador',          ['Ctrl', 'T']),
  shortcut('br-closetab',    'browser', 'Cerrar pestaña',       'Cierra la pestaña actual',                        ['Ctrl', 'W']),
  shortcut('br-reopentab',   'browser', 'Reabrir pestaña',      'Reabre la última pestaña cerrada',                ['Ctrl', 'Shift', 'T']),
  shortcut('br-addressbar',  'browser', 'Barra de dirección',   'Selecciona el contenido de la barra de URL',      ['Ctrl', 'L']),
  shortcut('br-reload',      'browser', 'Recargar',             'Recarga la página actual',                        ['Ctrl', 'R']),
  shortcut('br-hardreload',  'browser', 'Recarga forzada',      'Recarga sin usar caché del navegador',            ['Ctrl', 'Shift', 'R']),
  shortcut('br-devtools',    'browser', 'Herramientas de desarrollador', 'Abre el panel de DevTools',              ['F12']),
  shortcut('br-history',     'browser', 'Historial',            'Abre el historial de navegación',                 ['Ctrl', 'H']),
  shortcut('br-downloads',   'browser', 'Descargas',            'Abre el gestor de descargas',                     ['Ctrl', 'J']),
  shortcut('br-zoom-in',     'browser', 'Aumentar zoom',        'Aumenta el zoom de la página',                    ['Ctrl', '+']),
  shortcut('br-zoom-out',    'browser', 'Reducir zoom',         'Reduce el zoom de la página',                     ['Ctrl', '-']),
  shortcut('br-zoom-reset',  'browser', 'Restablecer zoom',     'Vuelve al zoom 100%',                             ['Ctrl', '0']),
]

export const CATEGORIES: Record<ShortcutCategory, { label: string; icon: string }> = {
  windows: { label: 'Windows',    icon: 'WIN' },
  vscode:  { label: 'VS Code',    icon: 'VSC' },
  linux:   { label: 'Linux/Bash', icon: '>_'  },
  browser: { label: 'Navegador',  icon: 'WEB' },
}

export function normalizeKeyEvent(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey  || e.key === 'Control') parts.push('ctrl')
  if (e.altKey   || e.key === 'Alt')     parts.push('alt')
  if (e.shiftKey || e.key === 'Shift')   parts.push('shift')
  if (e.metaKey  || e.key === 'Meta')    parts.push('meta')

  const skip = new Set(['Control', 'Alt', 'Shift', 'Meta'])
  if (!skip.has(e.key)) {
    parts.push(e.key.toLowerCase())
  }

  return parts.join('+')
}
