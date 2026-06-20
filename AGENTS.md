# Bundle Builder — Agent Guide

EcomExperts frontend take-home: multi-step security-system bundle builder with live review panel.

## Links

| Resource      | URL                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------- |
| Notion brief  | https://app.notion.com/p/Frontend-Take-Home-Bundle-Builder-74300ea92b998376b5d381bfc0e7e38d |
| Figma file    | https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder                          |
| Figma desktop | https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder?node-id=1-342            |
| Figma tablet  | https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder?node-id=1-27             |
| Figma mobile  | https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder?node-id=1-658            |

### Responsive frames

| View    | node-id |
| ------- | ------- |
| Desktop | `1:342` |
| Tablet  | `1:27`  |
| Mobile  | `1:658` |

Build desktop first for pixel fidelity, then tablet, then mobile. Do not shrink desktop — match each frame.

---

## Current phase (update as you progress)

- [x] `client/` scaffolded (Vite + React + TS)
- [x] Tailwind configured
- [x] Shared types + `bundle.json` catalog seed
- [x] `client/src/api/client.ts` + `implementations/local.ts`
- [x] Reducer + selectors (variant qty logic)
- [x] Optimistic UI + debounced sync queue
- [x] Builder UI (accordion, product cards, variants, steppers)
- [x] Review panel (grouped lines, synced steppers, totals)
- [x] localStorage save/restore ("Save my system for later")
- [ ] Responsive (tablet → mobile)
- [ ] `server/` Express + TS + SQLite
- [ ] `client/src/api/implementations/http.ts` + `VITE_USE_API=true`
- [ ] Quote + checkout endpoints
- [ ] Root README run instructions + polish

---

## Repo layout

```
home/
├── client/          # React + TypeScript + Tailwind
├── server/          # Express + TypeScript + SQLite (no mock/json-server)
├── AGENTS.md        # This file
└── README.md        # Run instructions
```

---

## Architecture decisions

1. **FE first, BE later** — FE will not break if `api/client.ts` abstraction is used.
2. **No JSON Server mock** — use `local.ts` during FE dev; switch to Express via env flag.
3. **Components NEVER import `bundle.json` directly** — only `api.*`.
4. **Catalog is read-only** (from `GET /api/v1/config`); **selections live in reducer**.
5. **Optimistic UI** — instant local updates; debounced `PATCH /configurations/:id` when API enabled.
6. **localStorage is required** for "Save my system for later" (brief). Server save is optional bonus.
7. **Client previews totals** during editing; **server is authoritative** at quote/checkout.
8. **Never trust client-sent prices** — BE resolves prices from catalog/DB.
9. **Types source of truth:** `server/src/types/` (client imports via TS path alias when wired).

---

## Code documentation

- Prefer **types + tests** over comments; no per-feature markdown files.
- **JSDoc sparingly** on non-obvious logic only (variant keys, review selectors, pricing preview vs authoritative quote, API quirks).
- Skip JSDoc on components and obvious helpers.
- Details: [`.cursor/rules/client-fe.mdc`](./.cursor/rules/client-fe.mdc) (client) · [`.cursor/rules/server-be.mdc`](./.cursor/rules/server-be.mdc) (server).

---

## What we're building (from brief)

Two-column experience:

**Left — Builder:** 4-step accordion (cameras → plan → sensors → extra protection). Step 1 open on load. "N selected" per step. Product cards with optional badge, variants, qty stepper, pricing. "Next: …" advances steps.

**Right — Review panel ("Your security system"):** Grouped lines (Cameras, Sensors, Accessories, Plan). Synced qty steppers. Shipping, guarantee, financing, total with struck-through compare-at, savings, Checkout (placeholder OK), Save for later.

---

## Variant behavior (CRITICAL — interview focus)

- Each variant has **its own quantity** — key: `productId:variantId` (no variant → `productId:default`).
- Card qty stepper binds to **active variant chip**. Switching chip shows that variant's count.
- Review panel lists **every variant with qty > 0** as a separate line (Red ×2 stays when Blue selected on card).
- Products without variants: single stepper, no chip row.
- Selected chip styling deferred per brief — focus on behavior + review panel flow.

---

## Product dependencies

- Catalog products may declare `requires: string[]` — other product ids auto-added at qty 1 when this product is selected.
- Example: motion sensor `requires: ["wyze-sense-hub"]`.
- **Lock state is derived**, not stored: a product is locked (min qty 1) while any selected product still lists it in `requires`.
- Removing the last dependent removes auto-required products from `selections`.
- Logic lives in `client/src/lib/productDependencies.ts`; reducer and `local.ts` PATCH/create normalize selections.
- **Server must mirror** the same rules on PATCH/quote (see `server-be.mdc`).

---

## API contract (fixed — do not change URLs)

| Method | Route                                 | Purpose                                                 |
| ------ | ------------------------------------- | ------------------------------------------------------- |
| GET    | `/api/v1/health`                      | Health check                                            |
| GET    | `/api/v1/config`                      | Full catalog (steps, products, meta, initialSelections) |
| POST   | `/api/v1/configurations`              | Create draft configuration                              |
| GET    | `/api/v1/configurations/:id`          | Load configuration                                      |
| PATCH  | `/api/v1/configurations/:id`          | Update selections / activeVariants / openStepId         |
| POST   | `/api/v1/configurations/:id/save`     | Mark saved (server draft, optional)                     |
| POST   | `/api/v1/configurations/:id/quote`    | Server-validated pricing                                |
| POST   | `/api/v1/configurations/:id/checkout` | Create order draft (placeholder OK)                     |

---

## FE data layers

```
1. CATALOG (read-only)     → api.getConfig()
2. RUNTIME STATE (mutable) → reducer: selections, activeVariants, openStepId
3. DERIVED                 → review lines, totals, step counts (never stored)
4. PERSISTENCE             → localStorage on "Save for later"
```

### Boot sequence

1. `api.getConfig()` → catalog
2. Check localStorage for saved snapshot
3. If saved → restore or `api.getConfiguration(id)` / create with snapshot
4. Else → `api.createConfiguration({})` with `initialSelections` from catalog
5. Render matching Figma seed state

### Migration switch

```env
VITE_USE_API=false   # local.ts (default while building FE)
VITE_USE_API=true    # http.ts → Express via Vite proxy
```

---

## Key files (create as you build)

### Client

| File                                      | Role                                       |
| ----------------------------------------- | ------------------------------------------ |
| `client/src/api/client.ts`                | Single data door — see implementations     |
| `client/src/api/implementations/local.ts` | In-memory + bundle.json (Phase 1)          |
| `client/src/api/implementations/http.ts`  | fetch to Express (Phase 2)                 |
| `client/src/state/bundleReducer.ts`       | Selections + accordion state               |
| `client/src/state/selectors.ts`           | Review lines, totals, step counts          |
| `client/src/sync/optimisticSync.ts`       | Debounced PATCH queue                      |
| `client/src/lib/pricing.ts`               | Client preview totals (mirror on server)   |
| `client/src/lib/productDependencies.ts`   | Product `requires` graph + selection rules |
| `client/src/lib/storage.ts`               | localStorage read/write                    |
| `client/src/data/bundle.json`             | Catalog seed until server serves it        |

### Server

| File                                       | Role                                    |
| ------------------------------------------ | --------------------------------------- |
| `server/data/bundle.json`                  | Catalog seed (→ SQLite seed)            |
| `server/src/types/`                        | API types (source of truth)             |
| `server/src/lib/pricing/calculateQuote.ts` | Authoritative quote logic               |
| `server/src/lib/productDependencies.ts`    | Mirror client `requires` rules on PATCH |
| `server/src/routes/v1/`                    | Express routes matching API contract    |
| `server/src/db/schema.sql`                 | SQLite schema                           |
| `server/src/db/seed.ts`                    | Seed from bundle.json                   |

---

## Do NOT

- Import `bundle.json` in React components
- Send prices from client to server
- Skip localStorage for save-for-later
- Add generic CRUD `/products` endpoints
- Use JSON Server — Express + SQLite only
- Store computed totals in reducer state (derive them)
- One quantity per product when variants exist
- Store product lock/required-by state separately (derive from catalog + selections)

---

## Implementation order

1. Types + `bundle.json` from Figma
2. `api/client.ts` + `local.ts`
3. Reducer + selectors + variant logic tests
4. Desktop layout (builder + review panel)
5. Interactions (accordion, steppers, variant sync)
6. localStorage save/restore
7. Responsive tablet + mobile
8. Express + SQLite (same API contract)
9. `http.ts` + flip `VITE_USE_API=true`

---

## How to continue in a new session

Say: **"Continue the bundle builder — see AGENTS.md"** and specify FE or BE work.

**Frontend docs:** [docs/FRONTEND_PLAN.md](./docs/FRONTEND_PLAN.md) (phases) · [client/COMPONENTS.md](./client/COMPONENTS.md) (component reference)

**Commits:** `<type>(<scope>): <subject>` + body — see [`.cursor/rules/git-commits.mdc`](./.cursor/rules/git-commits.mdc).
