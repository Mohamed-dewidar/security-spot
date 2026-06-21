# Bundle Builder — Backend Plan

Implementation plan for Express + TypeScript + SQLite in [`server/`](../server/). See [AGENTS.md](../AGENTS.md) for API contract and [`.cursor/rules/server-be.mdc`](../.cursor/rules/server-be.mdc) for conventions.

**Current state:** `server/` does not exist yet. Frontend is complete and runs with `VITE_USE_API=false` via [`client/src/api/implementations/local.ts`](../client/src/api/implementations/local.ts).

## Behavioral spec (mirror these — do not re-derive from the brief)

| Concern                  | Reference implementation                                                                | Acceptance tests                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Full API surface         | [`client/src/api/implementations/local.ts`](../client/src/api/implementations/local.ts) | [`client/src/test/api/local.test.ts`](../client/src/test/api/local.test.ts)                             |
| Product `requires` rules | [`client/src/lib/productDependencies.ts`](../client/src/lib/productDependencies.ts)     | [`client/src/test/lib/productDependencies.test.ts`](../client/src/test/lib/productDependencies.test.ts) |
| Client preview pricing   | [`client/src/lib/pricing.ts`](../client/src/lib/pricing.ts)                             | (quote totals in `local.test.ts`)                                                                       |
| PATCH body shape         | [`client/src/sync/optimisticSync.ts`](../client/src/sync/optimisticSync.ts)             | selections, activeVariants, openStepId only — **no prices**                                             |
| Boot + 404 handling      | [`client/src/state/bootBundle.ts`](../client/src/state/bootBundle.ts)                   | stale saved config id → create new draft                                                                |

Server tests in `server/src/test/` should mirror the client test scenarios (supertest + vitest).

## Implementation slices

Build in order; each slice should be runnable and testable before the next.

### Slice 1 — Scaffold + health + catalog

- [ ] Create `server/` package (Express, TS, `better-sqlite3`, Zod, `tsx`, vitest, supertest)
- [ ] `GET /api/v1/health` → `{ ok: true }`
- [ ] Copy [`client/src/data/bundle.json`](../client/src/data/bundle.json) → `server/data/bundle.json`
- [ ] `server/src/db/schema.sql` + `seed.ts` + `getBundleConfig()`
- [ ] `GET /api/v1/config` returns nested `BundleConfig` (same shape as `localApi.getConfig()`)
- [ ] Listen on port **3001**

**Done when:** `curl localhost:3001/api/v1/health` and `curl localhost:3001/api/v1/config` return valid JSON.

### Slice 2 — Configuration CRUD

- [ ] Types in `server/src/types/` (mirror client types)
- [ ] Zod schemas for create/PATCH bodies
- [ ] Copy/adapt `productDependencies`, `selectionKeys`, `openStep` into `server/src/lib/`
- [ ] `POST /api/v1/configurations` — merge onto `initialSelections`, normalize, persist
- [ ] `GET /api/v1/configurations/:id` — load or 404
- [ ] `PATCH /api/v1/configurations/:id` — merge maps, normalize selections, persist
- [ ] `POST /api/v1/configurations/:id/save` — set `savedAt` ISO timestamp

**Done when:** server tests pass scenarios from `local.test.ts` (create, patch merge, save, 404).

### Slice 3 — Quote + checkout

- [ ] `server/src/lib/pricing/calculateQuote.ts` (mirror `buildQuote` in `local.ts`)
- [ ] `POST /api/v1/configurations/:id/quote`
- [ ] `orders` table + `POST /api/v1/configurations/:id/checkout` (quote first, persist order draft)

**Done when:** quote line counts/prices and checkout `orderId` match `local.test.ts`.

### Slice 4 — Client hookup

- [ ] Implement [`client/src/api/implementations/http.ts`](../client/src/api/implementations/http.ts) (`fetch` to `/api/v1/*`, map errors to `ApiError` / `NotFoundError`)
- [ ] Vite proxy in [`client/vite.config.ts`](../client/vite.config.ts): `/api` → `http://localhost:3001`
- [ ] Set `VITE_USE_API=true` in `client/.env` and verify full app boot + debounced PATCH

**Done when:** app works end-to-end with both terminals running (see Verification below).

### Slice 5 — Docs polish

- [ ] Update [README.md](../README.md) full-stack run instructions
- [ ] Check off BE items in [AGENTS.md](../AGENTS.md)

## Target file layout

```
server/
├── package.json
├── tsconfig.json
├── data/
│   ├── bundle.json
│   └── bundle.db          # gitignored
└── src/
    ├── index.ts
    ├── db/
    │   ├── schema.sql
    │   ├── seed.ts
    │   ├── index.ts
    │   ├── catalog.ts
    │   └── configurations.ts
    ├── lib/
    │   ├── productDependencies.ts
    │   ├── selectionKeys.ts
    │   ├── openStep.ts
    │   └── pricing/calculateQuote.ts
    ├── routes/v1/
    ├── schemas/
    ├── services/
    ├── types/
    └── test/
```

## API errors

JSON body on all error responses:

```json
{ "message": "Human-readable description" }
```

| Status | When                       | Client handling                                      |
| ------ | -------------------------- | ---------------------------------------------------- |
| 404    | Configuration id not found | Throw `NotFoundError` — boot falls back to new draft |
| 400    | Zod validation failure     | Throw `ApiError(400, message)`                       |
| 500    | Unexpected server error    | Throw `ApiError(500, message)`                       |

## Verification (full stack)

```bash
# Terminal 1
cd server && pnpm install && pnpm dev

# Terminal 2
cd client
cp .env.example .env   # set VITE_USE_API=true
pnpm dev
```

Open http://localhost:5173 and confirm:

- Boot creates/loads configuration via API
- Stepper edits debounce-PATCH to server
- Motion sensor auto-adds hub (server normalizes on PATCH)
- Save for later still uses localStorage; stale config id recovers via 404 → new draft

## Out of scope

- Real payment / checkout UI
- Auth / rate limiting
- Replacing localStorage with server-only save
- Generic `/products` CRUD endpoints

## How to continue in a new session

> Continue BE — slice N: \<goal\>. Mirror `local.ts`. See `docs/BACKEND_PLAN.md`.

Example: _"Continue BE — slice 1: scaffold server + GET /api/v1/config."_
