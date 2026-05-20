# Food Delivery — Multi-Tenant SaaS

A multi-tenant food delivery platform built with **Next.js 16** + **SQLite** (dev) + **Supabase** (production).

## Features

| Feature | Status |
|---------|--------|
| Menu browsing with categories | ✅ |
| Item detail with modifier options | ✅ |
| Cart with Zustand + localStorage | ✅ |
| Checkout with Stripe & PayPal | ✅ |
| Order tracking with live polling | ✅ |
| Restaurant dashboard (kanban) | ✅ |
| Menu editor & settings | ✅ |
| Admin panel (tenants, users) | ✅ |
| Multi-tenant auth (local dev) | ✅ |
| Delivery tracking API | ✅ |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (Turbopack) |
| UI | Tailwind CSS v4 + shadcn/ui + Base UI |
| State | Zustand v5 |
| Database (dev) | SQLite via better-sqlite3 |
| Database (prod) | Supabase PostgreSQL |
| Auth (dev) | Local session cookie + SHA-256 |
| Auth (prod) | Supabase Auth |
| Payments | Stripe + PayPal (sandbox) |

## Getting Started

```bash
npm install
npm run seed    # Seed sample data (tenants, menu, demo users)
npm run dev     # Start dev server on localhost:3000
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@example.com` | `password` |
| Staff | `staff@pizzahub.com` | `password` |
| Admin | `admin@example.com` | `password` |

## Seed Data

- **Pizza Hub** (`/menu/pizzahub`) — 8 menu items across 4 categories
- **Burger Bros** (`/menu/burger-bros`) — 7 menu items across 3 categories

## Architecture

- **Proxy** (`src/proxy.ts`) — Auth guard for `/dashboard/*` and `/admin/*` routes
- **Local Data API** (`src/lib/local-data.ts`) — SQLite query functions replacing Supabase for dev
- **Local Auth** (`src/lib/local-auth.ts`) — Password hashing (SHA-256 + salt), user CRUD
- **Cart Store** (`src/lib/cart-store.ts`) — Zustand store persisted to localStorage
- **Dashboard** — Kanban with 5s polling for live order updates
- **Order Tracking** — 3s polling via `/api/orders/[orderId]`

## Routes

### Customer
- `/menu/[slug]` — Restaurant menu
- `/menu/[slug]/item/[itemId]` — Item detail + modifiers
- `/checkout` — Cart + payment
- `/orders` — Order history
- `/order/[orderId]` — Order tracking

### Staff
- `/dashboard` — Kanban (accept → confirm → prepare → ready → out for delivery)
- `/dashboard/menu` — Menu editor
- `/dashboard/settings` — Restaurant profile

### Admin
- `/admin` — Platform overview
- `/admin/tenants` — Manage restaurants
- `/admin/users` — Manage users

## Run Tests

```bash
npm test
```

## Production

For production deployment, configure Supabase environment variables and the database migration in `supabase/migration.sql`.
