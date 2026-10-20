# Al-Mohamadia

Next.js admin UI for a wood store. Shopkeepers sign in, sell wood, collect customer debt, restock from suppliers, watch stock, and review an audit trail. A **super admin** manages admin accounts. Users cannot self-register.

The UI is Arabic (RTL, default) or English (LTR), with light and dark themes. It talks only to the [Al-Mohamadia backend](https://github.com/kotbb/Al-Mohamadia-Backend) under `/api/v1`.

## Project structure

```text
app/
  [locale]/                # URL routes (en, ar); pages stay thin
    login/
    (app)/                 # authenticated shell
  layout/                  # sidebar, header, app shell
  modules/                 # feature UI, hooks, and API calls
    auth/
    dashboard/
    customers/
    invoices/
    payments/
    suppliers/
    purchases/
    supplier-payments/
    inventory/
    items/
    audit/
    shared/                # buttons, modals, tables, form controls
i18n/                      # locale routing (ar default, en)
messages/                  # en.json and ar.json
lib/
  api/                     # fetch client, auth header, refresh on 401
  auth/                    # session, guards, roles
  theme/                   # light / dark
```

## Features

### Authentication

- Sign in with username and password
- Access token on each request; refresh on 401
- Logout clears the session and returns to login
- Unauthenticated visits to protected screens redirect to login
- Shared loading screens cover route transitions, authentication, and login
- Localized and global error/not-found pages handle invalid or unsupported routes

### Dashboard (`/`)

- Today's sales, estimated gross profit, collections, and invoice count
- Outstanding customer debt
- Period financial summaries, chart, and top-selling items with day/week/month/year or custom dates

### Customers (`/customers`)

- List, search, and filter by debt or active status
- Create, edit, and soft-delete customers
- Customer detail with balance (مديونية)
- Merge duplicate customers
- Optional Egyptian mobile field with fixed Egypt/+20 prefix, automatic spacing, a ten-digit limit and persistent generic guidance; errors appear only after a submit attempt, and existing phones can be cleared

### Sales invoices (`/invoices`)

- Create and update invoices with real-time stock and customer debt reconciliation
- Cash or customer sale, with piece, cubic-meter, or مبلغ حر amount-only lines
- Discount, paid, and remaining
- Dedicated creation and editing pages with compact rows and category-grouped item choices
- Meter dimensions for piece and cubic items; single defaults auto-fill, multiple defaults offer editable choices
- Save a new dimension preset inline or type a custom value without saving it
- Saving presets preserves other line fields; failed entries remain available for retry
- Focused shared numeric inputs ignore wheel changes; typing and arrow controls remain available
- Dedicated export page defaults to PNG A5; PDF A4, price visibility, print, and download remain available, with paper/settings guidance excluded from invoice outputs
- PNG file sharing where supported, with copy/download fallbacks; PDF sharing sends a public receipt link
- Public receipts show Arabic PDF print guidance and the standard brown/outline action buttons; notices stay outside printed/downloaded receipts
- Cancel an invoice
- Invoice detail uses an Invoice number / Same customer selector with one labeled Previous/Next pair; neighbor links preserve the selected mode
- Existing results stay visible while filters refresh; stale row actions are disabled
- Click customer, supplier, sales-invoice or purchase-invoice rows to open details; nested links/actions remain independent
- Cubic receipt unit prices show volume × saved m³ rate across preview, print, PNG, PDF and sharing; piece rates and stored totals stay unchanged

### Customer payments (`/payments`)

- Record a payment against an invoice or against standing debt
- List and cancel payments

### Suppliers (`/suppliers`)

- List, search, and filter suppliers
- Create, edit, and soft-delete suppliers
- Supplier detail with amount owed
- Merge duplicate suppliers
- Optional Egyptian mobile numbers with the shared Egypt/+20 field

### Purchases (`/purchases`)

- Create purchases on a dedicated page (stock and amount owed go up)
- Category-grouped items, meter dimensions, and inline saved dimension defaults
- Purchase list and detail
- Cancel a purchase

### Supplier payments (`/supplier-payments`)

- Record a payment to a supplier
- List and cancel payments

### Inventory (`/inventory`)

- Live stock, low-stock and negative-stock flags
- Valuation at cost and selling price
- Manual stock adjustment (جرد) with a reason
- Compact category tables retaining eight columns, collapse controls, pagination, and history actions
- Compact valuation/profit/alert KPI cards; category counts describe the loaded page

### Items and categories (`/items`, `/categories`)

- Categories: create, edit, soft-delete
- Items: piece, per-cubic-meter, or مبلغ حر pricing; free-amount items have no editable cost, price, or stock
- Price history
- Edit and soft-delete items
- Dedicated Add/Edit pages with multiple dimension defaults per axis

### Audit log (`/audit`)

- Read-only activity feed
- Filter by actor, action, entity, and date range

### Users (`/users`)

- **Super admin only.** Hidden from admins.
- Create, edit, activate, deactivate, and soft-delete admins
- Change another user's role (`admin` or `super_admin`)

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- next-intl (English and Arabic)
- Recharts for the dashboard
- Native `fetch` (no Axios)

## Prerequisites

- Node.js suitable for Next.js 16
- A running [Al-Mohamadia backend](../Al-Mohamadia-Backend) (default `http://localhost:3000`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.example .env.local
```

On Windows:

```cmd
copy .env.example .env.local
```

3. Edit `.env.local` if the API is not on the default host.

### Environment variables

| Variable              | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL, including `/api/v1` (default `http://localhost:3000/api/v1`) |

`NEXT_PUBLIC_API_URL` is embedded at build time; rebuild after changing the API origin.

Use `http://` for local development. `https://localhost` fails without a local TLS certificate. Do not commit real credentials.

## Running the application

### Development

```bash
npm run start:dev
```

Default URL: [http://localhost:3001](http://localhost:3001)

`start:dev` already uses port `3001` so it does not clash with the API on `3000`.

### Production

```bash
npm run build
npm run start
```

`next start` listens on port `3000` unless you set `PORT`. Use another port when the API is already on `3000`:

```bash
npx next start -p 3001
```

## Routes

Locales are prefixed: `/ar/...` and `/en/...`. Unprefixed visits select Arabic
with RTL layout; browser language and locale cookies do not override that default.
Explicit `/en` routes stay English/LTR. Paths below omit the prefix.

Unauthenticated users are sent to `/login`. The **Users** screen is `super_admin` only. Other protected screens below are available to `admin` and `super_admin`. The shared receipt is public and does not require sign-in.

| Path                       | Who         | Screen              |
| -------------------------- | ----------- | ------------------- |
| `/login`                   | Public      | Sign in             |
| `/`                        | Both        | Dashboard           |
| `/customers`               | Both        | Customer list       |
| `/customers/:id`           | Both        | Customer detail     |
| `/invoices`                | Both        | Invoice list        |
| `/invoices/new`            | Both        | New invoice         |
| `/invoices/:id`            | Both        | Invoice detail      |
| `/invoices/:id/edit`       | Both        | Edit invoice        |
| `/invoices/:id/export`     | Both        | PNG/PDF export      |
| `/invoices/public/:token`  | Public      | Shared receipt      |
| `/payments`                | Both        | Customer payments   |
| `/suppliers`               | Both        | Supplier list       |
| `/suppliers/:id`           | Both        | Supplier detail     |
| `/purchases`               | Both        | Purchase list       |
| `/purchases/new`           | Both        | New purchase        |
| `/purchases/:id`           | Both        | Purchase detail     |
| `/supplier-payments`       | Both        | Supplier payments   |
| `/inventory`               | Both        | Stock levels        |
| `/items`                   | Both        | Item list           |
| `/items/new`               | Both        | New item            |
| `/items/:id/edit`          | Both        | Edit item           |
| `/items/:id/price-history` | Both        | Price history       |
| `/categories`              | Both        | Categories          |
| `/audit`                   | Both        | Audit log           |
| `/users`                   | Super admin | User management     |

The sidebar groups those screens into three hubs:

1. **Sales & Customers** - customer invoices, customers, customer payments
2. **Purchases & Suppliers** - purchase invoices, suppliers, supplier payments
3. **Inventory** - stock, items, categories

Dashboard, audit, and users sit outside those hubs.

## Roles

| Role        | Value         | Notes                                                                                              |
| ----------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Admin       | `admin`       | Shop screens: dashboard, sales, purchases, inventory, audit. The Users item is hidden. |
| Super admin | `super_admin` | Everything an admin sees, plus Users.                                                              |

The API is the authority. Hiding a nav item does not grant access.

## Testing

```bash
npm run lint
npm run check:architecture
npm run test:architecture
npm run test:forms
npx tsc --noEmit
npm run build
```

There is no generic `npm run test` script. `test:forms` (also available as
`test:dimensions`) runs focused form/calculation tests. Backend tests cover API
behavior. Architecture validation also runs automatically before builds.

Visual verification is manual unless explicitly requested: check English/Arabic,
mobile, numeric inputs, dimension presets, item/invoice pages, export/sharing,
and Save & Print.
