# Bundle Builder

EcomExperts take-home: multi-step security-system bundle builder with live review panel.

## Quick start (reviewers)

**Requirements:** [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/installation)

```bash
cd client
pnpm install
pnpm dev
```

Open **http://localhost:5173**

No `.env` file is required. The app uses the in-memory local API by default (`VITE_USE_API` unset or not `"true"`).

**Optional**

```bash
pnpm test      # unit tests
pnpm build     # production build
pnpm preview   # serve the production build locally
```

### What to try

- Step through the 4-step accordion (cameras → plan → sensors → extra protection)
- Change product variants and quantities — each variant keeps its own count
- Confirm the review panel lists every variant with qty > 0 and stays in sync with card steppers
- Add a motion sensor and verify the required hub auto-adds and locks at min qty 1
- Use **Save my system for later**, refresh, and confirm the bundle restores from localStorage

---

**Agent / contributor guide:** [AGENTS.md](./AGENTS.md) · **Frontend plan & components:** [docs/FRONTEND_PLAN.md](./docs/FRONTEND_PLAN.md) · [client/COMPONENTS.md](./client/COMPONENTS.md)

## Stack

| Layer    | Tech                              | Status       |
| -------- | --------------------------------- | ------------ |
| Frontend | React, TypeScript, Tailwind, Vite | Implemented  |
| Backend  | Express, TypeScript, SQLite       | Not in scope |

This submission is **frontend-only**. Catalog and configuration are served by `client/src/api/implementations/local.ts` (no server to start).

## Project structure

```
├── client/     # React app (run from here)
├── docs/       # Frontend implementation notes
└── AGENTS.md   # Architecture & progress tracker
```

## Configuration (optional)

Copy the example env file if you want to override defaults:

```bash
cp client/.env.example client/.env
```

See [client/.env.example](./client/.env.example) for variable descriptions. No `.env` is required for the default local setup.

## Design

- [Notion brief](https://app.notion.com/p/Frontend-Take-Home-Bundle-Builder-74300ea92b998376b5d381bfc0e7e38d)
- [Figma](https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder) — desktop `1:342`, tablet `1:27`, mobile `1:658`
