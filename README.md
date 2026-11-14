# Skru Score - قاعدة صحاب

A score-tracking web app for card games, board games, and casual game sessions with friends, with a retro-brutalist dark design.

**الرفيق الرقمي المثالي لتسجيل نقاط الألعاب والجلسات مع الأصدقاء**

**Live demo:** https://skru-score.vercel.app

قاعدة صحاب (Skru Score) تطبيق لتسجيل نقاط ألعاب الورق والألعاب اللوحية والجلسات مع الأصدقاء، بتصميم brutalist عصري وحركات سلسة.

## Features

**Game setup**
- Choose 2 to 10 players and edit their names.
- Choose the number of rounds (minimum 1, default 4). Rounds are independent of the player count.
- "Double Last Round" option: scores in the final round count twice (x2).

**During a game**
- Enter each player's score per round; totals are calculated live, with x2 rounds applied.
- A crown marks the current leader, the player with the lowest total (lower is better).
- Add a round, add a player, remove a player (with confirmation), and rename players at any time.
- Toggle the x2 multiplier on the last round.
- Undo reverts the last action; the app keeps the last 50 actions.
- "New Match" saves the winner (lowest total) and every player's total to the match history, then clears the scores and keeps the same players.
- "Menu" returns to setup after a confirmation.

**Persistence**
- Players, scores, round settings, undo history, setup choices, and match history are saved automatically in the browser's `localStorage` (keys prefixed `skru-`), so a page reload keeps the session. Nothing is sent to a server.
- Games saved before configurable rounds existed are migrated to a consistent round count on load.

## Tech stack

- React 19 and TypeScript 5.8
- Vite 6
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- `motion` (Framer Motion) for animation and Lucide React for icons
- Fonts from Google Fonts: Montserrat, Poppins, JetBrains Mono
- Playwright for the smoke test script

## Getting started

Prerequisites: Node.js and npm.

```bash
git clone https://github.com/mohamedatef90/skru-score.git
cd skru-score
npm install
npm run dev
```

The dev server runs on http://localhost:3000 (`vite --port=3000 --host=0.0.0.0`).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |
| `npm run smoke:rounds` | Playwright browser smoke test for rounds, add round/player, reload persistence, new match, and legacy-data migration |

`npm run smoke:rounds` drives a running app: start `npm run dev` first. It uses `http://127.0.0.1:3000/` unless `SKRU_BASE_URL` is set, and needs a Playwright browser installed. It prints `SKRU_ROUNDS_SMOKE_PASS` on success.

### Environment variables

None are required to run the app. `GEMINI_API_KEY` is read by `vite.config.ts` and `src/services/geminiService.ts` (a Gemini chat helper for Skru rules and strategy), but no screen in the app uses that helper.

## Project structure

```
src/
  App.tsx                     Setup screen, scoreboard, match history, confirm modal
  main.tsx                    Entry point
  types.ts                    Player, Match, and ChatMessage types
  index.css                   Tailwind theme (colors, fonts) and custom styles
  hooks/useLocalStorage.ts    localStorage-backed state hook
  services/geminiService.ts   Gemini chat helper (not used by the UI)
scripts/smoke-rounds.mjs      Playwright smoke test
index.html, vite.config.ts, tsconfig.json, package.json
```

## Design

Theme colors are defined in `src/index.css`:

| Token | Value | Use |
| --- | --- | --- |
| `skru-purple` | `#551A8B` | Primary |
| `skru-gold` | `#FFB300` | Accent |
| `skru-white` | `#F0F0F0` | Text |
| `skru-black` | `#1A1A1A` | Background |
| `skru-red` | `#D32F2F` | Danger |
| `skru-green` | `#4CAF50` | Success |
| `skru-action` | `#6200EA` | Scrollbar hover |

Typography: Montserrat (display), Poppins (body), JetBrains Mono (mono).

## Author

Mohamed Atef (Tifo)
- GitHub: [@mohamedatef90](https://github.com/mohamedatef90)
- Email: matefm20@gmail.com
- Issues: https://github.com/mohamedatef90/skru-score/issues

## Acknowledgments

برعاية ابو الميكا وصحبته الرايقة. Inspired by card game sessions with friends.
