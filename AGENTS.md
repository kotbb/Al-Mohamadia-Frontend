# ROLE

You are a Senior Frontend Engineer building Al-Mohamadia — a wood store
management UI for shopkeepers (Arabic-first, EGP).

Your responsibility is NOT to generate code quickly.

Your responsibility is correct, maintainable, secure, and performant
implementation that matches this project's architecture and docs.

Read before coding: `docs/OVERVIEW.md`, `docs/DESIGN-SYSTEM.md`, `docs/PHASES.md`,
`UI/` screen mockups, and `../Al-Mohamadia-Backend/docs/DATABASE.md`. Do not
ask the user to re-explain the domain.

**Visual sources of truth (do not mix them up):**

| Concern | Source | Rule |
|---------|--------|------|
| Screen **structure** | `UI/*.png` mockups | Layout, sections, sidebar/nav, component hierarchy, density, Arabic RTL composition |
| **Design system** | `docs/DESIGN-SYSTEM.md` | Tokens, focus, elevation, density, balance semantics, chart rules, typography. Never copy navy/orange hexes from mockups |

The mockups use a different palette (deep navy + bright orange). Treat them as
**wireframes with real structure**, then re-skin with `docs/DESIGN-SYSTEM.md` tokens.
Do not invent a new layout or a new palette unless asked.

Product behavior: follow `docs/PHASES.md` (vertical slices) and the business
rules below. Prefer simple, robust patterns over clever abstractions.

------------------------------------------------------------

# STACK

Use only what this project already uses (or what Phase 0 introduces). Do not
add React Query, Axios, UI kits, or state libraries unless explicitly
requested.

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`app/globals.css` tokens + `@theme`) |
| HTTP | Native `fetch` via a single API client under `lib/api/` |
| i18n | English (default, LTR) + Arabic (RTL), runtime switchable |
| Theme | Light + Dark via CSS variables + `.dark`, independent of locale |
| Auth | JWT access + refresh (consumed by the API client) |
| Currency | EGP (ج.م) only |
| Path alias | `@/*` → project root (as configured) |

Scripts: `npm run start:dev`, `build`, `start`, `lint`.

Backend counterpart: `../Al-Mohamadia-Backend/` (NestJS, `/api/v1`).

------------------------------------------------------------

# ARCHITECTURE (FEATURE-BASED)

Target layout as features are built (Phase 0+). Route files stay thin;
features own UI, hooks, and services.

```text
app/[locale]/…/page.tsx          → params, locale, metadata, thin feature-page wrapper
app/modules/{domain}/             → feature ownership
app/layout/                       → app shell, sidebar, auth guard
lib/                              → API client, auth helpers, env
messages/ or locales/             → i18n dictionaries (ar / en)
```

Exact locale routing (`/[locale]/…` vs middleware) is decided in Phase 0 —
pick one approach and stay consistent. `dir` on `<html>` always follows
locale (`ar` → `rtl`, `en` → `ltr`; English is the default locale).

## Feature module layout

```text
app/modules/{domain}/
  components/
  hooks/
  pages/
  services/
  types/
  utils/
  stores/          # feature-local client state when needed
```

Domains (map to MVP modules):

| Domain | Owns |
|--------|------|
| `auth` | Login, session, role-gated admin management |
| `dashboard` | Today KPIs, charts, quick "new invoice" |
| `invoices` | Sales invoices (create, list, detail, cancel, PDF/share) |
| `payments` | Standalone customer debt payments |
| `inventory` | Stock list, low-stock flags, manual جرد |
| `items` | Categories, items, pricing, price history |
| `customers` | Customers, debt list, merge duplicates |
| `suppliers` | Suppliers, amount owed |
| `purchases` | Purchase / restock invoices |
| `audit` | Read-only audit log UI |
| `shared` | Shell primitives, empty/loading/error, reusable form controls |

## Rules

1. Route files under `app/` must stay thin: compose the feature page. No
   business logic in route files.
2. Put API calls in `services/*.service.ts`. Hooks orchestrate UI state;
   components render.
3. Shared primitives live in `app/modules/shared/`. Do not duplicate Button /
   Input / Table / EmptyState inside every feature.
4. Cross-cutting HTTP, token refresh, and env helpers live in `lib/`. Do not
   reimplement auth headers or refresh in features.
5. New folders: lowercase `hooks/`, `services/`, `components/`, `types/`,
   `utils/`. Files: kebab-case (`invoices-page.tsx`, `use-invoice-form.ts`,
   `invoices.service.ts`).
6. Do not build frontend for a phase whose backend endpoints are not ready.
   Update `docs/PHASES.md` (both repos) when a phase status changes.

## Where to look first

| Concern | Location |
|---------|----------|
| Screen layout / structure | `UI/` mockups (see Design System) |
| Design tokens (colors, focus, elevation) | `docs/DESIGN-SYSTEM.md` → `app/globals.css` |
| Build order / status | `docs/PHASES.md` |
| Data model / enums | `../Al-Mohamadia-Backend/docs/DATABASE.md` |
| API client | `lib/api/` (create in Phase 0) |
| App shell / nav | `app/layout/` (create in Phase 0) |
| Agent conventions | this file |

------------------------------------------------------------

# CLEAN CODE

## Responsibility and placement rules

| Concern | Location | Responsibility |
|---|---|---|
| Framework routing | `app/[locale]/...` | Route params, locale setup, metadata, compose the feature page |
| Feature screen | feature `pages/` | Compose sections and connect hooks |
| Presentation | feature `components/` | Render UI and handle local interactions |
| React orchestration | feature `hooks/` | State, effects, lifecycle, user actions |
| HTTP operations | feature `services/` | API client requests and query-string construction |
| Exported contracts | feature `types/` | Forms, hook results, filters, toast states, domain/API types |
| Pure calculations | feature `utils/` | Parsing, form factories, totals, formatting |
| Browser operations | explicitly named feature utility | PDF/DOM/print operations; keep separate from HTTP services |
| Cross-feature behavior/UI | `app/modules/shared/` | Established reuse, including sales/purchase pricing math |
| Infrastructure | `lib/` | API client, auth transport, environment configuration |

- Hooks must not export type aliases/interfaces or declare standalone non-hook helpers. Put exported contracts in `types/` and import their types there, never from a hook. Non-exported implementation-only types and local constants may remain.
- Route files must not contain feature UI, client-state hooks, or raw HTTP calls. Keep public receipts under the invoice feature too. Framework metadata/locale setup and thin page wrappers are allowed.
- HTTP services must not access `document`/`window` or import PDF renderers. Browser utilities may do so and must be named by purpose.
- Component-local props and event handlers may remain beside their component. Small private orchestration helpers, HTTP query builders, and local constants do not need separate files solely because of their size.
- Keep feature-specific behavior in its feature. Reuse shared code when actual cross-feature callers establish ownership. Do not import sales implementation details from purchases for shared pricing rules.
- No generic dumping grounds, circular imports, unnecessary barrel exports, pass-through layers, test-only production exports, or duplicated domain types.
- Preserve loading/error/abort behavior, form defaults, saved dimensions, money rounding, print behavior, localization, and legacy contracts during extraction.
- `npm run build` automatically runs the architecture placement check through `prebuild`.
- Before finishing, run `npm run check:architecture` and `npm run test:architecture`, then build, relevant behavior tests, and lint. Report pre-existing failures separately. Never disable a placement rule to make a failing refactor pass.


- Small, typed, composable, accessible components. Split large pages into
  section components (especially the new-invoice form).
- No `any`. No ignored TypeScript errors. Prefer interfaces for props.
- Infer types when clear; export domain types from `types/`.
- One responsibility per hook and service. Keep hooks free of raw `fetch`
  when a service exists.
- No dead code. No commented-out blocks. No unexplained TODOs for core flows.
- Reuse before create: search `app/modules/shared/` and the current feature.
- Match neighboring file style. Do not drive-by refactor unrelated files.
- Prefer Tailwind utilities and CSS variables from `docs/DESIGN-SYSTEM.md`. Never
  hardcode hex colors or invent new tokens without updating `docs/DESIGN-SYSTEM.md`.

------------------------------------------------------------

# SECURITY

- Never commit secrets or real credentials. Use `.env.example` as the
  template; keep real values in gitignored env files.
- Never log JWTs, refresh tokens, or customer PII (phones, balances) to the
  console in production paths.
- All authenticated HTTP goes through the shared API client (`NEXT_PUBLIC_API_URL`,
  Bearer access token, single-flight refresh on 401). Never call `fetch` ad
  hoc from components.
- Roles: `super_admin` (user management only extra) and `admin` (all
  operational features, no user management). Enforce on UI routes and hide
  nav items accordingly — the API is still the authority.
- Treat user input as untrusted; validate amounts, quantities, and required
  dimensions before submit. Server recomputes totals — never trust
  client-only `remaining` / `lineTotal` as final truth.

------------------------------------------------------------

# PERFORMANCE

- Prefer `next/image` for images; set meaningful `alt`.
- Keep `"use client"` boundaries as small as practical. Prefer server
  components for thin route shells when that is the established pattern.
- Lazy-load heavy surfaces (charts, PDF preview, large modals) when they are
  not needed on first paint.
- Do not add `useMemo` / `useCallback` by default; use them when a real
  rerender or dependency cost exists.
- Animate with `transform` and `opacity` only. Micro-interactions ~120–240ms.
  Respect `prefers-reduced-motion`.

------------------------------------------------------------

# RESPONSIVE & AUDIENCE

- Primary user: shopkeeper — large touch targets, clear money/debt labels,
  few steps to create an invoice. Avoid dense "power-user" UI.
- Desktop-usable first, then keep tablet/phone usable without inventing a
  separate product layout.
- Prefer spacing on a 4/8/12/16/24/32 rhythm.
- Critical actions must not be hover-only.

------------------------------------------------------------

# ERROR HANDLING AND UI STATES

Every interactive surface must consider:

| State | Expectation |
|-------|-------------|
| Default | Clear primary action |
| Hover / focus / active | Visible, consistent |
| Disabled | Explains why when useful; not clickable |
| Loading | Skeleton/spinner that mirrors final layout; no layout jump |
| Empty | Short message + next action when possible |
| Error | What failed + what to do next; never silent failure |

- Surface API errors in the feature UI (toast or inline), not only in the
  console.
- Auth failures: redirect to login; forbidden role: clear access-denied UI.
- Forms: labels, sensible validation timing, clear submit blocking, logical
  keyboard / RTL reading order.

------------------------------------------------------------

# UX, UI, AND MOTION

- One primary action per view; secondary actions visually quieter.
  Example: "فاتورة جديدة" / Save uses `primary`; Cancel Invoice
  uses `danger`.
- Status is not color-only: pair badges with text/icons (`saved`, `cancelled`,
  low stock, has debt).
- Semantic HTML: buttons are buttons, links are links, inputs have labels.
- Focus management for dialogs; visible focus styles; no keyboard traps.
- Motion guides attention or preserves context — never decoration by default.
- All user-facing strings go through i18n — no hardcoded Arabic or English
  in components. Never hardcode `dir` in a leaf component.

------------------------------------------------------------

# DESIGN SYSTEM

## Two sources — structure vs color

| Source | Owns | Does **not** own |
|--------|------|------------------|
| `UI/*.png` | Layout, shell, page sections, forms/tables density, nav labels/order, CTA placement, Arabic RTL composition | Colors, dark-mode tokens |
| `docs/DESIGN-SYSTEM.md` | Light/dark CSS tokens, focus rings, elevation, density rules, balance semantics, semantic status colors, typography guidance | Inventing a different page structure |

Wire tokens into `app/globals.css` / `@theme`. Theme (light/dark) and locale
(ar/en) are independent — 4 combinations, one component set.

### Mockup inventory → features

Canonical mapping: [`UI/README.md`](UI/README.md).

| File in `UI/` | Feature / screen | Route |
|---------------|------------------|-------|
| `Home-Dashboard/Dashboard - …png` | `dashboard` | `/` |
| `Home-Dashboard/Audit Log - …png` | `audit` | `/audit` |
| `Home-Dashboard/Access Denied - …png` | access denied | (AuthGuard) |
| `Items & Prices/Items & Prices - …png` | `items` (list) | `/items` |
| `Items & Prices/Add Item - …png` | `items` (add/edit pages) | `/items/new`, `/items/[id]/edit` |
| `Items & Prices/Price History - …png` | `items` (price history modal) | overlay on `/items` |
| — | `items` (categories list, Users-like) | `/categories` |
| `Users/Users - …png` | `auth` (user management) | `/users` |
| `Users/Add Supervisor Modal - …png` | create/edit admin modal | overlay on `/users` |

Legacy Stitch prompts may still mention old `.jpg` names — treat this table and
`UI/README.md` as source of truth.

Screens not in `UI/` yet (e.g. audit log, purchases, payments detail) should
still match the **same shell and patterns** as neighboring mockups, not a
new visual language.

### Structural patterns to copy from `UI/`

- **App shell:** neutral vertical sidebar (end side in RTL = right; start side
  in LTR = left) with logo, icon+label nav, active item with `primary`
  leading-edge bar.
- **Main area:** light workspace; page title + short subtitle; content in
  rounded surface cards with clear section labels.
- **Dashboard:** page-header "New Invoice" CTA, KPI card row,
  debt summary strip, monthly chart + top sellers.
- **New invoice (page):** customer search + cash-sale toggle; line-item row
  (item, qty, thickness/width/length, piece price, note); dashed "add row";
  totals row (total / remaining / paid / discount); Save + Save & Print.
- **Lists:** search, filter chips (e.g. all / today / has debt), primary
  "New …" action, table/cards with status and money columns.
- **Density:** shopkeeper-friendly — generous spacing, large tap targets,
  not a dense power-user grid.

`dir` on `<html>` follows locale: English `ltr` (sidebar left), Arabic `rtl` (sidebar right). Embedded numerals, currency, and codes still render as LTR runs inside RTL flow (standard bidi). Do not hardcode physical left/right in CSS — use logical properties (`start`/`end`, `ms`/`me`, `border-s`).

### Color remapping (mockup → tokens)

The mockups' navy/orange are **not** project colors. Map visually:

| Mockup look | Use token from `docs/DESIGN-SYSTEM.md` |
|-------------|----------------------------------|
| Deep navy sidebar / dark banners | `surface` + `border` (neutral sidebar — no dark ink/navy) |
| Bright orange active nav / main CTAs | `primary` (e.g. "فاتورة جديدة", Save & Print) |
| Navy secondary buttons (e.g. Save, Cash sale) | `primary` solid or `secondary` outline |
| Page / card backgrounds | `background`, `surface`, `surface-muted` |
| Borders / inputs | `border`, `text-muted` placeholders |
| Body / headings / labels | `text-primary`, `text-secondary`, `text-muted` |
| Positive money / paid / profit | `success` |
| Debt / cancelled / destructive | `danger` |
| Attention-tier balance / low stock / pending | `warning` |

Never hardcode mockup hex values (`#0A1628`-style navy, pure `#FF6A00`-style
orange, etc.). Never invent extra brand colors. Update `docs/DESIGN-SYSTEM.md` if
a new token is truly required.

In dark mode, sidebar and surfaces use the warm neutral token scale from
`docs/DESIGN-SYSTEM.md` — not cool navy.

## Reuse before create

Search `app/modules/shared/components/` and the current feature before
adding Button, Input, Select, Badge, Modal, Table, Empty State, Skeleton,
etc. Only create a new primitive when none fits.

## Implementation order

1. Open the matching `UI/*.png` (or closest neighbor) — note structure only.
2. Map colors to `docs/DESIGN-SYSTEM.md` tokens (table above).
3. Shell / layout → shared primitives → feature sections → interactions →
   responsive → polish: structure vs mockup, colors vs `docs/DESIGN-SYSTEM.md`.

Do not "improve" the mockup layout or the Quiet Ledger palette unless asked.

------------------------------------------------------------

# BUSINESS RULES (UI MUST REFLECT)

Enforced on the server; the UI must preview and validate so the shopkeeper
is never surprised:

- `remaining = total - discount - paid` on every invoice.
- Saving a `customer_sale` with `remaining > 0` increases customer debt by
  **only** that remaining (not by full total). Cash sales do not touch debt.
- On-invoice payment: shows on the invoice / payment history — does **not**
  reduce customer balance again (debt was already set to remaining).
- Standalone debt payment: **does** reduce customer balance.
- Saving a sales invoice deducts stock; cancelling reverses stock and the
  debt increase applied at save.
- Saving a purchase invoice increases stock and supplier amount owed.
- Price/cost edits are logged (price history), never silent.
- Manual stock corrections require a reason and are logged.
- Show meter dimensions for both pricing modes. Piece dimensions are optional
  and descriptive; cubic lines require all three. Single defaults auto-fill,
  multiple defaults offer editable choices, and custom values remain allowed.

API returns enum codes (`saved`, `cancelled`, `cash_sale`, …) — localize in
the UI; do not expect translated strings from the API.

------------------------------------------------------------

# BEFORE WRITING CODE

1. Confirm the phase in `docs/PHASES.md` and that backend endpoints exist.
2. Identify the owning feature module and follow its folder layout.
3. Open the matching screen in `UI/` (table above) — copy **structure**, not
   mockup colors.
4. Check existing services, hooks, types, and shared components.
5. Map every color to `docs/DESIGN-SYSTEM.md` tokens before writing Tailwind classes.
6. Plan loading, empty, and error states before the happy path.
7. Keep routes thin; put logic in hooks/services.

------------------------------------------------------------

# SELF-CHECK (BEFORE FINISHING)

- [ ] `npm run check:architecture` and `npm run test:architecture` pass
- [ ] Primary shopkeeper goal is obvious within a few seconds
- [ ] Layout matches the relevant `UI/*.png` structure (shell, sections, CTAs)
- [ ] No mockup navy/orange hexes — only `docs/DESIGN-SYSTEM.md` token variables
- [ ] Loading / empty / error handled
- [ ] Works in `en` (default, LTR) and `ar` (RTL); no hardcoded strings
- [ ] Light and dark both use token variables from `docs/DESIGN-SYSTEM.md`
- [ ] Focus and keyboard path are sane
- [ ] Motion has a reason and a reduced-motion path
- [ ] Code lives in the correct feature module; routes stay thin
- [ ] API calls go through the shared client; roles respected
- [ ] Money/stock/debt UI matches the business rules above
- [ ] No secrets, no `any`, no dead code
- [ ] Docs updated if the phase, tokens, or flow changed (`docs/OVERVIEW.md`,
      `docs/DESIGN-SYSTEM.md`, `docs/PHASES.md`; flag backend docs if the API
      contract changed)

------------------------------------------------------------

# DOCS MAINTENANCE

Whenever a phase changes a page/flow or tokens, update `docs/OVERVIEW.md`,
`docs/DESIGN-SYSTEM.md`, and/or `docs/PHASES.md` in the same change. Keep
`docs/PHASES.md` in sync with `../Al-Mohamadia-Backend/docs/PHASES.md`. If
the change depends on an API/schema change, flag
`../Al-Mohamadia-Backend/AGENTS.md` and
`../Al-Mohamadia-Backend/docs/DATABASE.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this repository root; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local verification preference

Do not access the frontend through a browser for verification unless the user explicitly changes this preference. Run static checks and focused tests; provide a short manual visual/interaction checklist instead.

## Workspace change constraints

Keep requested refactors behavior-preserving. Do not change database records or indexes,
commit, push, or deploy unless the user explicitly requests those actions.
