# Al-Mohamadia Frontend

Next.js admin UI for **Al-Mohamadia**, a wood store management system for a
small timber shop. Shopkeepers create sales invoices, track inventory and
debt, manage customers and suppliers, and watch daily sales.

| | |
|---|---|
| **Stack** | Next.js (App Router) · React · TypeScript · Tailwind CSS |
| **Languages** | English (LTR, default) · Arabic (RTL) |
| **Themes** | Light · Dark |
| **Currency** | EGP (ج.م) |
| **Default port** | `3001` (backend usually uses `3000`) |

Product name in the UI: **Al-Mohamadia**.

---

## Features

- **Sales & money** — cash / customer invoices, debt payments, dashboard KPIs
- **Stock & catalog** — items, pricing, inventory, purchases from suppliers
- **People** — customers (مديونية), suppliers, admin user management
- **Trust** — read-only audit log of sensitive actions
- **i18n & theme** — Arabic / English and light / dark, switchable at runtime

---

## Getting started

### Prerequisites

- Node.js suitable for Next.js 16
- A running [Al-Mohamadia-Backend](../Al-Mohamadia-Backend) API
  (default `http://localhost:3000`)

### Setup

```bash
npm install
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Use `http://` for local development. Do not commit real credentials.

### Run

```bash
npm run start:dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

### Scripts

| Script | Command |
|--------|---------|
| Dev | `npm run start:dev` |
| Build | `npm run build` |
| Start | `npm run start` |
| Lint | `npm run lint` |

---

## Related repository

| Repo | Role |
|------|------|
| [Al-Mohamadia-Backend](../Al-Mohamadia-Backend) | NestJS API, MongoDB schema, JWT auth, business rules |

---

## Documentation

Detailed product rules, design tokens, and phase plan live under `docs/`
(local / private working docs):

| Doc | Contents |
|-----|----------|
| `docs/OVERVIEW.md` | Business overview, journeys, frontend architecture |
| `docs/AGENTS.md` | Engineering standards for contributors / AI agents |
| `docs/Design-System.md` | Quiet Ledger design system (light / dark tokens, UX) |
| `docs/PHASES.md` | Vertical-slice build plan |
