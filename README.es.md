<div align="center">

# ⌨️ AbapMecano

**Un entrenador de mecanografía hecho para desarrolladores — practica con código real, domina tu teclado y aprende terminología SAP/ABAP mientras escribes.**

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

## 📖 Descripción

**AbapMecano** es un entrenador de mecanografía web diseñado específicamente para desarrolladores de software. En lugar de practicar con prosa corriente, entrenas con patrones de código reales, símbolos, números y terminología SAP/ABAP — los caracteres con los que de verdad peleas cada día.

Combina una experiencia de tipeo limpia y sin distracciones (inspirada en MonkeyType) con sistemas de progresión que mantienen la práctica entretenida: un curso estructurado, ejercicios dirigidos a tus teclas débiles, estadísticas detalladas, logros e incluso un modo "Aventura" gamificado.

> **🔗 Pruébalo en vivo:** **[proyecto-mecanografia.vercel.app](https://proyecto-mecanografia.vercel.app)**

---

## ✨ Características

### ⌨️ Motor de tipeo
- **Varios modos** — tests por tiempo y por número fijo de palabras.
- **Modo SAP/ABAP** — genera texto compuesto exclusivamente por palabras clave y sintaxis SAP/ABAP.
- **Toggle de números y símbolos** — mezcla dígitos y caracteres especiales en el pool de palabras.
- **Texto personalizado** — pega tu propio fragmento y practica con él.
- **Modo precisión** — bloquea la barra espaciadora hasta que la palabra actual esté sin errores.
- **Cuenta atrás 3-2-1** antes de los tests por tiempo, con un overlay animado.
- **Caret animado** y un sparkline de PPM en vivo que se actualiza mientras escribes.
- **Detección de Bloq Mayús** con un aviso en pantalla.

### 🎹 Aprendizaje y guía
- **Teclado en pantalla** — coloreado por dedo, resalta la siguiente tecla a pulsar.
- **Tamaño de letra ajustable** y visibilidad del teclado, guardados entre sesiones.
- **Curso estructurado** — 9 lecciones progresivas (fila central → superior → inferior → letras → mayúsculas → puntuación → números → símbolos → ABAP/SAP), con valoración por estrellas y un sistema de desbloqueo moderado.
- **Práctica de teclas débiles** — detecta automáticamente las teclas en las que más fallas y genera ejercicios dirigidos.

### 📊 Progreso y estadísticas
- **Panel de estadísticas** con una gráfica SVG de PPM a lo largo del tiempo.
- **Mapa de calor de errores** — un teclado QWERTY coloreado según la frecuencia con la que fallas cada tecla.
- **XP, niveles, rachas y logros** para mantenerte motivado.
- **Récords personales** con una celebración de confeti al batir tu mejor marca.
- **Ranking global** para comparar tus resultados con otros usuarios.

### 🎮 Modo Aventura
- Un auto-runner donde se juega escribiendo: cada carácter correcto hace avanzar a tu personaje.
- Recoge monedas, derrota **bugs** 🐛 y esquiva obstáculos `{ }`.
- Una **tienda** dentro del juego con cosméticos (skins, sombreros, mascotas, estelas) y mejoras (vida extra, escudo, imán de monedas, monedas dobles, doble salto).
- Totalmente renderizado con SVG/CSS y Framer Motion — sin assets externos.

### 🔐 Cuentas
- **Autenticación con magic link** mediante Supabase.
- Perfil y nombre de usuario editables.
- Todos tus resultados, progreso y desbloqueos se guardan en tu cuenta.

---

## 🛠️ Stack tecnológico

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

## 🚀 Primeros pasos

### Requisitos previos
- [Node.js](https://nodejs.org) 20 o superior
- Un proyecto de [Supabase](https://supabase.com) (para autenticación y persistencia de datos)

### Instalación

```bash
# 1. Clona el repositorio
git clone <url-de-tu-repo>
cd "Proyecto Mecanografía"

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
#    Crea un archivo .env.local (ver abajo)

# 4. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=url-de-tu-proyecto-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

> El esquema de Supabase incluye tablas para perfiles de usuario, resultados de tipeo, logros, progreso de lecciones e ítems de aventura. Crea tu propio proyecto de Supabase y aplica el esquema correspondiente antes de ejecutar.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo (Turbopack) |
| `npm run build` | Compila para producción |
| `npm run start` | Ejecuta la build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## 📁 Estructura del proyecto

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

## 🎨 Diseño

AbapMecano usa un tema plano y oscuro tipo "carbón" inspirado en el *Serika Dark* de MonkeyType, con un acento amarillo mostaza (`#e2b714`). La tipografía combina **Roboto Mono** (para el tipeo) con **Lexend Deca** (para la interfaz), ambas cargadas con `next/font`.

---

## 📦 Despliegue

La app está desplegada en [Vercel](https://vercel.com). La build de producción se crea con:

```bash
npm run build
```

Las variables de entorno de Supabase deben configurarse en el entorno de despliegue para que funcionen la autenticación y las funciones de datos.

---

## 👤 Autor

**Diego Martínez**

---

## 📄 Licencia

© 2026 Diego Martínez. Todos los derechos reservados.

Este proyecto se comparte públicamente con fines de portfolio y demostración. Puedes explorar el código libremente, pero no está licenciado para su reutilización o redistribución sin permiso.
