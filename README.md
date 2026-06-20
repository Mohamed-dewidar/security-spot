# Bundle Builder

EcomExperts take-home: multi-step security-system bundle builder with live review panel.

**Agent / contributor guide:** see [AGENTS.md](./AGENTS.md) for architecture, API contract, Figma links, and current phase.

**Frontend plan & components:** [docs/FRONTEND_PLAN.md](./docs/FRONTEND_PLAN.md) · [client/COMPONENTS.md](./client/COMPONENTS.md)

## Stack

| Layer    | Tech                              |
| -------- | --------------------------------- |
| Frontend | React, TypeScript, Tailwind, Vite |
| Backend  | Express, TypeScript, SQLite       |

## Project structure

```
├── client/     # React app
├── server/     # Express API (to be added)
└── AGENTS.md   # Architecture & progress tracker
```

## Development

### Client (available now)

```bash
cd client
pnpm install
pnpm dev
```

### Full stack (when server is ready)

```bash
# From repo root — TBD
pnpm dev
```

Set in `client/.env`:

```env
VITE_USE_API=false   # local implementation (default while building FE)
# VITE_USE_API=true  # fetch from Express at /api/v1/*
```

## Design

- [Notion brief](https://app.notion.com/p/Frontend-Take-Home-Bundle-Builder-74300ea92b998376b5d381bfc0e7e38d)
- [Figma](https://www.figma.com/design/IYBOgaxJtgGknY77g2FKyL/Bundle-Builder) — desktop `1:342`, tablet `1:27`, mobile `1:658`
