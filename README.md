# Suixin Ledger · 随心账本

**English** | [简体中文](./README.zh-CN.md)

A personal bookkeeping web app for tracking everyday income and expenses on mobile. It lets you record transactions in seconds, browse them by week, month, year or a custom range, search across categories, notes and amounts, and read your spending back through category breakdowns and trend charts — all in **English or Chinese**.

Built with **Vue 3 + Vite + TypeScript + Vant + Pinia + Vue Router + Axios + ECharts + Vue I18n**.

---

## Prerequisites

- Node.js **20+** (required by Vite 8)
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

In production, `.env.production` sets this to the relative path `/api` so requests stay same-origin and are proxied to the backend by nginx.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (port 5173) |
| `npm run build` | Type-check (`vue-tsc`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests with Vitest |

---

## Internationalization (i18n)

The UI ships in **Simplified Chinese (`zh-CN`)** and **English (`en`)**.

- Powered by **Vue I18n**; **Vant**'s built-in component locale switches in sync.
- The active language is persisted to `localStorage` and falls back to the browser language on first visit.
- Switch language in **Me → Preferences → Language**.
- Messages live in `src/i18n/`, split into per-namespace fragment files under `src/i18n/locales/` (e.g. `common`, `bills`, `reports`, …) and assembled in `messages.ts`.
- Date, period and chart-axis labels are locale-aware (e.g. `6月15日 昨天` ↔ `Jun 15 Yesterday`, `2026年6月` ↔ `Jun 2026`).

To add a string: add the same key to both `zh` and `en` of the relevant fragment, then reference it via `t('namespace.key')` (`const { t } = useI18n()` in components, or the exported `t` helper for use in utilities).

---

## Features & Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login / Register | Token-based auth; toggles between sign-in and sign-up forms |
| `/` | Home | Monthly summary, recent (3-day) record list, floating "add record" button |
| `/bills` | Bills | Period switcher (week / month / year / custom), expense/income chart (line or bar, configurable), grouped record details, sticky header |
| `/search` | Search | Client-side fuzzy search over category, note and amount with toggleable dimensions |
| `/reports` | Reports | Category breakdown (donut), trend chart, and a calendar view |
| `/me` | Me | Profile, feature grid, **language switcher**, and sign-out |
| `/categories` | Categories | Manage income/expense categories and subcategories |
| `/record`, `/record/:id` | Add / Edit Record | Amount keypad, category grid, date picker, note — shown as a global popup |

**Auth flow:** Hash-based routing (`createWebHashHistory`). A global navigation guard checks for a JWT in `localStorage`; unauthenticated requests to protected routes redirect to `/login`. The Axios client attaches the JWT via a request interceptor and redirects to `/login` on `401` responses.

---

## Project Structure

```
src/
├── api/           # Axios API modules (auth, records, categories, stats, http)
├── components/    # Reusable UI (AmountKeypad, CategoryGrid, CategoryDonut, DailyBar,
│                  #   PeriodPicker, RecordItem/List/Editor/Detail, RecordEditPopup,
│                  #   SubcategorySheet, AddCategoryForm, CategoryIcon, AppLoading)
├── i18n/          # Vue I18n setup + locale fragments (locales/*.ts) + messages.ts
├── router/        # Vue Router setup with auth guard
├── stores/        # Pinia stores (auth, categories, recordEdit)
├── types/         # Shared TypeScript types (User, FinanceRecord, Category, …)
├── utils/         # Helpers (format, period, aggregate, icon, swipeRegistry)
├── views/         # Page-level components (Login, Home, Bills, Search, Reports, Me,
│                  #   CategoryManage, RecordEdit)
└── main.ts        # App entry — registers Vant, Pinia, Router and I18n
```
