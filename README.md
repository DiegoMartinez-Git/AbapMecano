<div align="center">

# AbapMecano

**A typing trainer built for developers — practice on real code, master keyboard accuracy, and learn SAP/ABAP terminology while typing.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-proyecto--mecanografia.vercel.app-e2b714?style=for-the-badge&logo=vercel&logoColor=2c2e31)](https://proyecto-mecanografia.vercel.app)

[![English](https://img.shields.io/badge/lang-English-e2b714?style=flat-square)](README.md)
[![Español](https://img.shields.io/badge/lang-Espa%C3%B1ol-323437?style=flat-square)](README.es.md)

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Overview

AbapMecano is a web typing trainer designed specifically for software developers. Instead of practising on plain prose, it focuses on real code patterns, symbols, numbers, and SAP/ABAP terminology — the characters developers handle most.

It combines a clean, distraction-free typing experience (inspired by MonkeyType) with progression systems designed to keep practice engaging: a structured course, targeted weak-key drills, detailed statistics, achievements, and a gamified "Adventure" mode.

**Live demo:** [proyecto-mecanografia.vercel.app](https://proyecto-mecanografia.vercel.app)

---

## Features

### Typing Engine
- **Multiple modes** — timed tests and fixed word-count tests.
- **SAP/ABAP mode** — generates text built exclusively from SAP/ABAP keywords and syntax.
- **Numbers and symbols toggle** — mixes digits and special characters into the word pool.
- **Custom text** — accepts a user-provided snippet to practise on.
- **Precision mode** — blocks the space bar until the current word is error-free.
- **3-2-1 countdown** before timed tests, with an animated overlay.
- **Animated caret** and a live WPM sparkline that updates during the test.
- **Caps Lock detection** with an on-screen warning banner.

### Learning and Guidance
- **On-screen keyboard guide** — colour-coded by finger, highlighting the next key to press.
- **Adjustable font size** and keyboard visibility, persisted across sessions.
- **Structured course** — 9 progressive lessons (home row, top row, bottom row, all letters, capitals, punctuation, numbers, symbols, and ABAP/SAP), with a star rating and a moderate unlock system.
- **Weak-key practice** — detects the most error-prone keys and generates targeted drills.

### Progress and Statistics
- **Statistics dashboard** with a WPM-over-time SVG chart.
- **Error heatmap** — a QWERTY keyboard coloured by mistype frequency per key.
- **XP, levels, streaks and achievements** for long-term motivation.
- **Personal records** with a confetti celebration on a new best score.
- **Global ranking** to compare results across users.

### Adventure Mode
- A type-to-play auto-runner: each correct character advances the character.
- Coins to collect, **bugs** to defeat, and `{ }` obstacles to dodge.
- An in-game **shop** with cosmetics (skins, hats, pets, trails) and upgrades (extra life, shield, coin magnet, double coins, double jump).
- Fully rendered with SVG/CSS and Framer Motion — no external assets.

### Accounts
- **Magic-link authentication** powered by Supabase.
- Editable profile and username.
- All results, progress and unlocks are persisted per account.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router + Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org) |
| **UI** | [React 19](https://react.dev) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Backend / Auth / DB** | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| **Icons** | [Lucide](https://lucide.dev) |
| **Extras** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 20 or later
- A [Supabase](https://supabase.com) project (for authentication and data persistence)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd "Proyecto Mecanografía"

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Create a .env.local file (see below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> The Supabase schema includes tables for user profiles, typing results, achievements, lesson progress and adventure items. A Supabase project must be set up and the corresponding schema applied before running.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
.
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home — main typing test
│   ├── curso/            # Lesson-based course
│   ├── practica/         # Weak-key practice
│   ├── estadisticas/     # Statistics dashboard
│   ├── ranking/          # Global leaderboard
│   ├── aventura/         # Adventure mode
│   ├── perfil/           # User profile & settings
│   ├── login/            # Authentication
│   └── auth/             # Auth callbacks & password reset
├── components/           # React components (typing, course, stats, adventure, ui…)
├── lib/                  # Text generation, lessons, shop catalog, server actions
├── store/                # Zustand stores (settings…)
├── types/                # Shared TypeScript types
└── app/globals.css       # Theme tokens & global styles
```

---

## Design

AbapMecano uses a flat, dark "carbon" theme inspired by MonkeyType's *Serika Dark*, with a mustard-yellow accent (`#e2b714`). Typography pairs **Roboto Mono** (for typing) with **Lexend Deca** (for the UI), both loaded through `next/font`.

---

## Deployment

The application is deployed on [Vercel](https://vercel.com). A production build is created with:

```bash
npm run build
```

Supabase environment variables must be configured in the deployment environment for authentication and data features to work.

---

## Author

**Diego Martínez**

---

## License

© 2026 Diego Martínez. All rights reserved.

This project is shared publicly for portfolio and demonstration purposes. The code may be reviewed, but it is not licensed for reuse or redistribution without permission.
