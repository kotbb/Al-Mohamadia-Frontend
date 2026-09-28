# Al-Mohamadia

Next.js admin UI for a wood store. Shopkeepers sign in, sell wood, collect customer debt, restock from suppliers, watch stock, and review an audit trail. A **super admin** manages admin accounts. Users cannot self-register.

The UI is English (LTR, default) or Arabic (RTL), with light and dark themes. It talks only to the [Al-Mohamadia backend](https://github.com/kotbb/Al-Mohamadia-Backend) under `/api/v1`.

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
i18n/                      # locale routing (en default, ar)
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
- Unauthenticated visits redirect to login

### Dashboard (`/`)

- Today's sales, profit, collected amount, and invoice count
- Outstanding customer debt
- Period chart (day, week, month, year) and top-selling items

### Customers (`/customers`)

- List, search, and filter by debt or active status
- Create, edit, and soft-delete customers
- Customer detail with balance (مديونية)
- Merge duplicate customers

### Sales invoices (`/invoices`)

- Cash or customer sale, with piece or cubic-meter lines
- Discount, paid, and remaining
- Preview, Arabic PDF, and WhatsApp share
- Cancel an invoice
- Invoice detail

### Customer payments (`/payments`)

- Record a payment against an invoice or against standing debt
- List and cancel payments

### Suppliers (`/suppliers`)

- List, search, and filter suppliers
- Create, edit, and soft-delete suppliers
- Supplier detail with amount owed
- Merge duplicate suppliers

### Purchases (`/purchases`)

- Restock from a supplier (stock and amount owed go up)
- Purchase list and detail
- Cancel a purchase

### Supplier payments (`/supplier-payments`)

- Record a payment to a supplier
- List and cancel payments

### Inventory (`/inventory`)

- Live stock, low-stock and negative-stock flags
- Valuation at cost and selling price
- Manual stock adjustment (جرد) with a reason

### Items and categories (`/items`, `/categories`)

- Categories: create, edit, soft-delete
- Items: piece or per-cubic-meter pricing, cost and selling price
- Price history
- Edit and soft-delete items

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

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

On Windows:

```cmd
copy .env.example .env.local
```

1. Edit `.env.local` if the API is not on the default host.

### Environment variables

| Variable              | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL, including `/api/v1` (default `http://localhost:3000/api/v1`) |

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

Locales are prefixed: `/en/...` and `/ar/...`. English is the default. Paths below omit that prefix.

Unauthenticated users are sent to `/login`. The **Users** screen is `super_admin` only. Every other screen below is available to `admin` and `super_admin`.

| Path                       | Who         | Screen                |
| -------------------------- | ----------- | --------------------- |
| `/login`                   | Public      | Sign in               |
| `/`                        | Both        | Dashboard             |
| `/customers`               | Both        | Customer list         |
| `/customers/:id`           | Both        | Customer detail       |
| `/invoices`                | Both        | Invoice list          |
| `/invoices/new`            | Both        | New invoice           |
| `/invoices/:id`            | Both        | Invoice detail        |
| `/payments`                | Both        | Customer payments     |
| `/suppliers`               | Both        | Supplier list         |
| `/suppliers/:id`           | Both        | Supplier detail       |
| `/purchases`               | Both        | Purchase list         |
| `/purchases/new`           | Both        | New purchase          |
| `/purchases/:id`           | Both        | Purchase detail       |
| `/supplier-payments`       | Both        | Supplier payments     |
| `/inventory`               | Both        | Stock levels          |
| `/items`                   | Both        | Item list             |
| `/items/new`               | Both        | New item              |
| `/items/:id/edit`          | Both        | Edit item             |
| `/items/:id/price-history` | Both        | Price history         |
| `/categories`              | Both        | Categories            |
| `/audit`                   | Both        | Audit log             |
| `/users`                   | Super admin | User management       |

The sidebar groups those screens into three hubs:

1. **Sales** - customers, invoices, customer payments
2. **Procurement** - suppliers, purchases, supplier payments
3. **Inventory** - stock, items, categories

Dashboard, audit, and users sit outside those hubs.

## Roles

| Role        | Value         | Notes                                                                                    |
| ----------- | ------------- | ---------------------------------------------------------------------------------------- |
| Admin       | `admin`       | Shop screens: dashboard, sales, procurement, inventory, audit. The Users item is hidden. |
| Super admin | `super_admin` | Everything an admin sees, plus Users.                                                    |

The API is the authority. Hiding a nav item does not grant access.

## Testing

```bash
npm run lint
```

This app has no `npm run test` script. API behavior is covered by the backend test suite.
