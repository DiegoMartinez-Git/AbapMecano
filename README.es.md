<div align="center">

# AbapMecano

**Un entrenador de mecanografía hecho para desarrolladores — práctica sobre código real, precisión de teclado y terminología SAP/ABAP mientras se escribe.**

[![Demo en vivo](https://img.shields.io/badge/Demo_en_vivo-proyecto--mecanografia.vercel.app-e2b714?style=for-the-badge&logo=vercel&logoColor=2c2e31)](https://proyecto-mecanografia.vercel.app)

[![English](https://img.shields.io/badge/lang-English-323437?style=flat-square)](README.md)
[![Español](https://img.shields.io/badge/lang-Espa%C3%B1ol-e2b714?style=flat-square)](README.es.md)

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Descripción

AbapMecano es un entrenador de mecanografía web diseñado específicamente para desarrolladores de software. En lugar de practicar con prosa corriente, se centra en patrones de código reales, símbolos, números y terminología SAP/ABAP — los caracteres que más manejan los desarrolladores.

Combina una experiencia de tipeo limpia y sin distracciones (inspirada en MonkeyType) con sistemas de progresión diseñados para mantener la práctica entretenida: un curso estructurado, ejercicios dirigidos a las teclas débiles, estadísticas detalladas, logros y un modo "Aventura" gamificado.

**Demo en vivo:** [proyecto-mecanografia.vercel.app](https://proyecto-mecanografia.vercel.app)

---

## Características

### Motor de tipeo
- **Varios modos** — tests por tiempo y por número fijo de palabras.
- **Modo SAP/ABAP** — genera texto compuesto exclusivamente por palabras clave y sintaxis SAP/ABAP.
- **Toggle de números y símbolos** — mezcla dígitos y caracteres especiales en el conjunto de palabras.
- **Texto personalizado** — admite un fragmento propio para practicar sobre él.
- **Modo precisión** — bloquea la barra espaciadora hasta que la palabra actual esté sin errores.
- **Cuenta atrás 3-2-1** antes de los tests por tiempo, con un overlay animado.
- **Caret animado** y un sparkline de PPM en vivo que se actualiza durante el test.
- **Detección de Bloq Mayús** con un aviso en pantalla.

### Aprendizaje y guía
- **Teclado en pantalla** — coloreado por dedo, resaltando la siguiente tecla a pulsar.
- **Tamaño de letra ajustable** y visibilidad del teclado, persistidos entre sesiones.
- **Curso estructurado** — 9 lecciones progresivas (fila central, fila superior, fila inferior, todas las letras, mayúsculas, puntuación, números, símbolos y ABAP/SAP), con valoración por estrellas y un sistema de desbloqueo moderado.
- **Práctica de teclas débiles** — detecta las teclas con más errores y genera ejercicios dirigidos.

### Progreso y estadísticas
- **Panel de estadísticas** con una gráfica SVG de PPM a lo largo del tiempo.
- **Mapa de calor de errores** — un teclado QWERTY coloreado según la frecuencia de error por tecla.
- **XP, niveles, rachas y logros** para la motivación a largo plazo.
- **Récords personales** con una celebración de confeti al lograr una nueva mejor marca.
- **Ranking global** para comparar resultados entre usuarios.

### Modo Aventura
- Un auto-runner que se juega escribiendo: cada carácter correcto hace avanzar al personaje.
- Monedas que recoger, **bugs** que derrotar y obstáculos `{ }` que esquivar.
- Una **tienda** dentro del juego con cosméticos (skins, sombreros, mascotas, estelas) y mejoras (vida extra, escudo, imán de monedas, monedas dobles, doble salto).
- Totalmente renderizado con SVG/CSS y Framer Motion — sin assets externos.

### Cuentas
- **Autenticación con magic link** mediante Supabase.
- Perfil y nombre de usuario editables.
- Todos los resultados, el progreso y los desbloqueos se persisten por cuenta.

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router + Turbopack) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org) |
| **UI** | [React 19](https://react.dev) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Animación** | [Framer Motion](https://www.framer.com/motion/) |
| **Estado** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Backend / Auth / BD** | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| **Iconos** | [Lucide](https://lucide.dev) |
| **Extras** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Despliegue** | [Vercel](https://vercel.com) |

---

## Primeros pasos

### Requisitos previos
- [Node.js](https://nodejs.org) 20 o superior
- Un proyecto de [Supabase](https://supabase.com) (para autenticación y persistencia de datos)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd "Proyecto Mecanografía"

# 2. Instalar las dependencias
npm install

# 3. Configurar las variables de entorno
#    Crear un archivo .env.local (ver abajo)

# 4. Arrancar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en un navegador.

### Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=url-del-proyecto-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=clave-anon-de-supabase
```

> El esquema de Supabase incluye tablas para perfiles de usuario, resultados de tipeo, logros, progreso de lecciones e ítems de aventura. Es necesario crear un proyecto de Supabase y aplicar el esquema correspondiente antes de ejecutar.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo (Turbopack) |
| `npm run build` | Compila para producción |
| `npm run start` | Ejecuta la build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## Estructura del proyecto

```
.
├── app/                  # Páginas del App Router de Next.js
│   ├── page.tsx          # Inicio — test de mecanografía principal
│   ├── curso/            # Curso por lecciones
│   ├── practica/         # Práctica de teclas débiles
│   ├── estadisticas/     # Panel de estadísticas
│   ├── ranking/          # Ranking global
│   ├── aventura/         # Modo Aventura
│   ├── perfil/           # Perfil y ajustes del usuario
│   ├── login/            # Autenticación
│   └── auth/             # Callbacks de auth y restablecer contraseña
├── components/           # Componentes React (typing, course, stats, adventure, ui…)
├── lib/                  # Generación de texto, lecciones, catálogo de tienda, server actions
├── store/                # Stores de Zustand (ajustes…)
├── types/                # Tipos TypeScript compartidos
└── app/globals.css       # Tokens del tema y estilos globales
```

---

## Diseño

AbapMecano usa un tema plano y oscuro tipo "carbón" inspirado en el *Serika Dark* de MonkeyType, con un acento amarillo mostaza (`#e2b714`). La tipografía combina **Roboto Mono** (para el tipeo) con **Lexend Deca** (para la interfaz), ambas cargadas con `next/font`.

---

## Despliegue

La aplicación está desplegada en [Vercel](https://vercel.com). La build de producción se crea con:

```bash
npm run build
```

Las variables de entorno de Supabase deben configurarse en el entorno de despliegue para que funcionen la autenticación y las funciones de datos.

---

## Autor

**Diego Martínez**

---

## Licencia

© 2026 Diego Martínez. Todos los derechos reservados.

Este proyecto se comparte públicamente con fines de portfolio y demostración. El código puede revisarse, pero no está licenciado para su reutilización o redistribución sin permiso.
