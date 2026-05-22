# Odyssey — Restaurant Ops

A small full-stack restaurant operations product. Web dashboard (Expo + RN Web) backed by a Hono service on Cloudflare Workers, with PostgreSQL + Drizzle ORM. End-to-end type-safety flows from a single Drizzle schema through drizzle-zod, an `@hono/zod-openapi` OpenAPI document, and Orval-generated React Query hooks.

> Built as a take-home assignment. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the design decisions and tradeoffs.

---

## Repo layout

```
apps/dashboard         Expo + RN Web dashboard (expo-router)
services/backend       Hono on Cloudflare Workers + Neon
packages/ui            Design tokens + primitive components
packages/api-client    Orval-generated React Query hooks (+ fetcher)
packages/shared        Cross-cutting utils (money, time formatters)
packages/types         Cross-cutting types (ThemeName, Brand utilities)
packages/tsconfig      Shared base tsconfig
```

## Prerequisites

- **Node** ≥ 20.10
- **pnpm** 9 — `npm i -g pnpm`
- **Neon** account (free) for the Postgres URL

## First-time setup

```bash
# 1. Install
pnpm install

# 2. Configure backend env
cp services/backend/.env.example services/backend/.env
# Edit services/backend/.env and paste your Neon connection string.
# Also create services/backend/.dev.vars with the same DATABASE_URL=…
# (wrangler reads this for `pnpm dev:backend`).

# 3. Push schema + seed sample data
pnpm db:push     # creates tables from src/db/schema.ts
pnpm db:seed     # inserts categories, items, customers, orders, settings

# 4. Generate the API contract (writes openapi.json + regenerates @odyssey/api-client/generated/)
pnpm gen:contract
```

> The repo ships with a hand-mirrored `packages/api-client/src/generated/` so the
> dashboard compiles before the first codegen. Running `pnpm gen:contract`
> overwrites it from the live OpenAPI document — that's the normal workflow whenever
> backend routes change.

## Run

In two terminals:

```bash
# Terminal 1 — backend on http://localhost:8787
pnpm dev:backend

# Terminal 2 — dashboard on http://localhost:8081
pnpm dev:dashboard
```

Open the URL Expo prints (usually `http://localhost:8081`) in a browser.

> Set `EXPO_PUBLIC_API_BASE_URL` in `apps/dashboard/.env` if the backend isn't on `localhost:8787`.

## Required scripts (from the brief)

| Script                  | What it does                                                |
| ----------------------- | ----------------------------------------------------------- |
| `pnpm dev:dashboard`    | Expo dev server (web).                                      |
| `pnpm dev:backend`      | `wrangler dev` for the Cloudflare Worker.                   |
| `pnpm gen:contract`     | Write `openapi.json` then run Orval → `api-client/generated`. |
| `pnpm db:migrate`       | Apply Drizzle migrations (`drizzle/`) via node-postgres.    |
| `pnpm db:push`          | Push the schema (dev convenience, no migration files).      |
| `pnpm db:seed`          | Reset + reseed sample data.                                 |
| `pnpm lint`             | Lint workspace.                                             |
| `pnpm typecheck`        | TypeScript check across the workspace.                      |
| `pnpm test`             | Run Vitest in backend + shared + dashboard.                 |

## Routes

- **`/`** — Home: KPIs (orders today, revenue, pending, in-progress), recent orders, popular items.
- **`/orders`** — List with bucket tabs (Active / Pending / Preparing / Ready / Completed / All), tap-to-open detail drawer, status-machine-aware action buttons.
- **`/menu`** — Categories with grouped items, availability toggle inline, create/edit via modal form.
- **`/crm`** — Customer ranking by lifetime spend, detail drawer with recent orders.
- **`/settings`** — Backed by `business_settings`: prep time, auto-accept, accepting-orders kill switch, tax rate, opening hours.
- **`/ui-library`** — Living styleguide: tokens, typography, spacing, surfaces, components, and every feedback state.

## Architecture highlights

- **One source of truth** — Drizzle schema → drizzle-zod → `@hono/zod-openapi` → `openapi.json` → Orval. The dashboard never hand-authors a DTO or duplicates an enum.
- **Server-authored totals** — Order subtotal/tax/total are recomputed on the backend from menu snapshots. Client-supplied totals are ignored.
- **State machine on the server** — Status transitions are enforced in `services/backend/src/services/order-status.ts`; the API rejects illegal moves with `INVALID_STATUS_TRANSITION`.
- **Snapshots in order_items** — Name + price are captured at order time, so menu edits don't rewrite history.
- **Design tokens** — `packages/ui/src/tokens` centralizes color (primitives + semantic), typography, spacing, radius, shadow/elevation, and motion. Components never reach for raw values.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full rationale, what's stubbed, and tradeoffs.

## Tests

```bash
pnpm test
```

- `services/backend/test/totals.test.ts` — totals math, including rounding
- `services/backend/test/order-status.test.ts` — full state-machine coverage
- `services/backend/test/create-order-input.test.ts` — request-validation paths
- `packages/shared/src/money.test.ts` — formatter behavior
- `apps/dashboard/src/features/orders/transitions.test.ts` — UI transition mirror

## Stack reference

| Layer              | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Monorepo           | pnpm workspace + Turborepo                          |
| Backend runtime    | Cloudflare Workers (Hono + `@hono/zod-openapi`)     |
| Database           | PostgreSQL via Neon (HTTP driver)                   |
| ORM                | Drizzle + drizzle-zod + drizzle-kit                 |
| Codegen            | Orval (tags-split, React Query, fetch mutator)      |
| Frontend           | Expo Router on RN + RN Web                          |
| Data fetching      | TanStack Query v5                                   |
| Forms              | Local controlled state (react-hook-form available)  |
| Styling            | Custom theme + RN StyleSheet (no Tailwind)          |
| Tests              | Vitest                                              |
