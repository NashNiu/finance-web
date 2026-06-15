# Finance Web

Finance Web — 小青账-style bookkeeping H5 (mobile web) client.

Built with **Vue 3 + Vite + TypeScript + Vant + Pinia + Vue Router + Axios + ECharts**.

---

## Prerequisites

- Node.js 18+
- The backend (`finance-server`, sibling folder) must be running before using the app.

---

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set the API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The default value is `http://localhost:3000/api` if the variable is not set.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests with Vitest (format util tests) |

---

## Features & Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login / Register | Token-based auth; switches between login and register forms |
| `/` | Home | Monthly income/expense summary, day-grouped record list, floating add button |
| `/record` | Add Record | Amount keypad, category grid, date picker, note input |
| `/record/:id` | Edit Record | Same form pre-filled; includes delete action |
| `/stats` | Statistics | Category pie chart (expense/income toggle, month navigation) + yearly trend bar chart |
| `/me` | Me | User profile display and logout |

**Auth flow:** Hash-based routing (`createWebHashHistory`). A global navigation guard checks for a JWT in `localStorage`; unauthenticated requests to protected routes redirect to `/login`. The Axios HTTP client attaches the JWT via a request interceptor and redirects to `/login` on 401 responses.

---

## Project Structure

```
src/
├── api/           # Axios-based API modules (auth, records, stats, http)
├── components/    # Reusable components (AmountKeypad, CategoryGrid, RecordList, CategoryPie, TrendBar)
├── router/        # Vue Router setup with auth guard
├── stores/        # Pinia stores (auth: token + user state)
├── types/         # Shared TypeScript types (User, FinanceRecord, Category, CategoryStat, TrendMonth, …)
├── utils/         # Utility functions (e.g. amount/date formatting)
├── views/         # Page-level components (LoginView, HomeView, RecordEditView, StatsView, MeView)
└── main.ts        # App entry point — Vant globally registered
```
