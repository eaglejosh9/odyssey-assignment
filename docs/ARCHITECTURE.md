# Architecture decisions & tradeoffs

## The contract flow

The whole point of the stack is that one schema produces every downstream type:

```
services/backend/src/db/schema.ts        ← single source of truth (Drizzle)
       │
       ▼
services/backend/src/db/zod.ts           ← drizzle-zod adapters + extras
       │
       ▼
services/backend/src/routes/*.ts         ← @hono/zod-openapi createRoute
       │
       ▼
services/backend/openapi.json            ← regenerate via `pnpm gen:contract`
       │
       ▼
packages/api-client/src/generated/       ← Orval: types + React Query hooks
       │
       ▼
apps/dashboard/app/*.tsx                 ← imports generated hooks only
```

The dashboard never imports from `@odyssey/backend`. The only API-shaped types the dashboard sees come from `@odyssey/api-client/generated`. Run `pnpm gen:contract` after any backend route or schema change.

## Why these choices

### Hono on Cloudflare Workers, not Express/Node
The brief specified it, but it's also a fit: Workers' cold-start profile is essentially zero, and `@hono/zod-openapi` gives us request/response validation, typed handlers, and OpenAPI generation from one definition. `wrangler dev` is the dev loop; `wrangler deploy` is one command from prod.

### Neon over local Postgres
Workers can't open TCP sockets to a local Postgres without a tunnel. Neon's HTTP driver (`@neondatabase/serverless`) speaks over `fetch`, which Workers can do natively. Same connection string works for the seed/migrate scripts (run on Node) and the Worker. Trade: a remote DB makes dev marginally slower than local, but it's the most realistic deployment story for this stack.

### Drizzle + drizzle-zod, not Prisma
The brief said so, but Drizzle is the right call for Workers anyway — Prisma's engine binary doesn't ship there. `drizzle-zod` is the keystone: it produces zod schemas directly from the table definitions, which feed straight into the OpenAPI route definitions. Schema changes propagate without manual restating.

### Orval with a `fetch` mutator
Orval ingests `openapi.json` and emits typed React Query hooks plus async client functions for every route. Both call our custom `apiFetch` mutator (`packages/api-client/src/mutator.ts`), which centralizes base URL resolution, JSON handling, and typed error throwing. Orval's `tags-split` mode keeps the generated code reviewable.

**Structure of `packages/api-client/src/generated/`:**

```
generated/
├── schemas/              ← Orval-generated types (one file per OpenAPI schema)
├── orders/               ← Orval-generated client + hooks for /orders/*
├── menu/                 ← Orval-generated client + hooks for /menu/*
├── customers/            ← Orval-generated client + hooks for /customers/*
├── settings/             ← Orval-generated client + hooks for /settings
├── stats/                ← Orval-generated client + hooks for /stats/*
├── schemas.ts            ← `export * from './schemas/'` — single import surface
├── orders.ts             ← thin wrapper: friendlier hook names + unwraps response
├── menu.ts               ← same pattern
├── customers.ts          ← same pattern
├── settings.ts           ← same pattern
└── stats.ts              ← same pattern
```

The top-level `.ts` files are deliberate **wrappers**, not duplicate types. Each one:

- imports Orval's async client function (e.g. `getOrders`, `patchOrdersIdStatus`) and types from its sibling subdirectory
- wires it through `useQuery` / `useMutation` with a project-wide query-key scheme so mutations can invalidate consistently
- unwraps Orval's `{ data, status, headers }` response envelope so consumers can treat `result.data` as the response body directly

The dashboard imports only from these wrappers (e.g. `useListOrders` instead of `useGetOrders`), but the runtime path goes through the Orval-generated code. A backend field rename triggers `pnpm gen:contract` → Orval rewrites `schemas/` and the per-route clients → TypeScript surfaces every affected call site in the dashboard. No hand-maintained shadow.

**Orval signal patch**: Orval 7.21 has a small codegen bug where param-less endpoints call `getX(signal)` instead of `getX({ signal })`. `packages/api-client/scripts/fix-orval-signal.mjs` runs automatically after `orval` to rewrite those call sites — idempotent, no manual editing of generated files.

### Expo + RN Web (not Next.js)
The brief required RN. Expo Router gives a file-based router that works on web and native from one codebase. We ship a web-first dashboard; the native bundle is reachable but not the primary target.

### Custom theme over Tailwind / NativeWind
A `useTheme()` hook returning semantic tokens (typed) is closest to RN-idiomatic styling. Components consume tokens; they never reach for raw values. Pulling Tailwind in would have added pipeline complexity (PostCSS via Metro) without making the design system meaningfully better.

## Data model

```
menu_categories ─< menu_items
                       │
customers ─< orders ───┘ (via order_items, with name + price snapshots)
business_settings (singleton: id = 1)
```

- `order_items` snapshots `nameSnapshot` and `priceSnapshotCents` so editing the menu can't rewrite history.
- `business_settings` is a singleton row — `loadSettings` lazily creates it on first read.
- Order totals are derived on the server in `services/orders.ts#createOrder` using `services/totals.ts`. The client never supplies totals.

## Order state machine

```
pending → accepted → preparing → ready → completed
   │         │           │
   ▼         ▼           ▼
   cancelled (terminal)
```

- Single definition lives in [`services/backend/src/services/order-status.ts`](../services/backend/src/services/order-status.ts).
- Backend rejects illegal moves with `409 INVALID_STATUS_TRANSITION`.
- Frontend mirrors the *action set per state* (`apps/dashboard/src/features/orders/transitions.ts`) only to decide which buttons to render. It does not redefine the enum (that comes from the generated `OrderStatus`).

## What's deliberately *not* in here

- **Auth** — single-restaurant context. Adding sessions/roles would consume the timebox and isn't in the brief.
- **Real-time push** — dashboard polls (Home stats refresh every 15s via React Query). A `useEventStream` over Workers' WebSocket / Durable Objects would be the natural next step.
- **Transactional `createOrder`** — Neon HTTP driver doesn't expose multi-statement transactions. The order + items are inserted in two consecutive calls; FK constraints keep the model consistent (orphan items can't exist). For higher-volume production, switch to Neon's `Pool` driver via `unstable_node_compat` and wrap the insert in `db.transaction(...)`.
- **Pagination** — the orders list caps at 200 rows. Below that threshold a single fetch + client-side filtering is faster than refetching on tab change. Add cursor pagination when this becomes load-bearing.
- **Image uploads** — `menu_items.imageUrl` is a URL field; no upload pipeline. R2 + signed URLs is the obvious extension.
- **Native verification** — the brief calls native "a bonus, not a requirement." The code paths are RN-compatible (no `window.*` access in primitives), but only web has been exercised.

## Stretch goal status (per the picker)

- **Local dev:** ✓ wrangler dev + expo dev work standalone.
- **Deployable Worker config:** ✓ `wrangler.toml` is ready. Provision a Neon URL via `wrangler secret put DATABASE_URL`, then `wrangler deploy`.

## Useful pointers when reviewing

| What you want to see                | Where                                                            |
| ----------------------------------- | ---------------------------------------------------------------- |
| Schema → zod adapters               | `services/backend/src/db/zod.ts`                                 |
| OpenAPI route definitions           | `services/backend/src/routes/*.ts`                               |
| Order creation (validation + totals)| `services/backend/src/services/orders.ts#createOrder`            |
| State machine                       | `services/backend/src/services/order-status.ts`                  |
| Generated client / hooks            | `packages/api-client/src/generated/`                             |
| Custom fetcher                      | `packages/api-client/src/mutator.ts`                             |
| Design tokens                       | `packages/ui/src/tokens/*`                                       |
| UI primitives                       | `packages/ui/src/components/*`                                   |
| Visual showcase                     | `apps/dashboard/app/ui-library.tsx` (route `/ui-library`)        |
| Orders detail flow                  | `apps/dashboard/src/features/orders/OrderDetailDrawer.tsx`       |

## Tradeoffs called out

| Tradeoff                                                          | Why                                                                                |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Thin wrappers around Orval output instead of using its hooks raw  | Orval's hook names (`useGetOrders`) are verbose; wrappers expose `useListOrders` and unwrap the `{data,status,headers}` envelope. Wrappers delegate to Orval's generated async client functions — Orval remains the runtime + type source. |
| No transactions in `createOrder`                                  | Neon HTTP driver limitation. FK constraints keep model consistent.                 |
| Polling instead of push                                           | Smaller surface for a 1–2 day build; React Query's `refetchInterval` is enough.    |
| Single hard-coded restaurant identity                             | No multi-tenant model. Trivial to extend.                                          |
| Settings opening hours stored as JSONB                            | Simpler than a separate `opening_hours` table for the timebox. Validated by zod.   |
