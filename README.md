# Apna Food Admin Console

React + Vite dashboard for Apna Food operations. It talks to the existing
**FastAPI backend** in `F:\soyab\mobileapp\backend`, which owns the PostgreSQL
database `FoodDelivery`. The browser app never connects to PostgreSQL directly
and holds no database credentials.

```
Browser (this app, :5175)  ──/api──▶  Vite dev proxy  ──▶  FastAPI (:8000)  ──▶  PostgreSQL "FoodDelivery"
```

## Run it (development)

1. **Start the API** (PowerShell):

   ```powershell
   cd F:\soyab\mobileapp\backend
   .venv\Scripts\activate
   uvicorn app.main:app --reload --port 8000
   ```

   Check it at http://localhost:8000/health → `{"status":"ok","database":"ok"}`.

2. **Start the dashboard:**

   ```bash
   npm install
   npm run dev
   ```

   Open the URL Vite prints and sign in with an **admin** account.

Vite forwards `/api` and `/media` to `http://127.0.0.1:8000`, so the backend's
`CORS_ORIGINS` doesn't need to list the dashboard's port. To point at another API,
copy `.env.example` to `.env.local` and set `API_PROXY_TARGET`.

## Accounts & access

- Only users with the **admin** role can open the dashboard. After login the app
  calls `/api/admin/stats`; a `403` means "signed in, but not an admin".
- **Register** creates a *customer* account (that's what the API does). An existing
  admin grants access in **Customers → Role → Admin**.
- **Forgot password** emails a 6-digit code. With `SMTP_HOST` empty in the backend
  `.env`, the code is printed in the FastAPI terminal instead of being emailed.
- Sessions are bearer tokens stored in `localStorage`; any `401` signs the admin out.

## Pages

| Route | Backend endpoints |
|---|---|
| `/login`, `/register`, `/forgot-password` | `/api/auth/*` |
| `/` Overview | `/api/admin/stats`, `/api/admin/orders?from=` (charts built client-side) |
| `/orders` | `/api/admin/orders`, `…/{id}`, `…/{id}/status`, `…/{id}/payment` |
| `/restaurants` | `/api/admin/restaurants` (CRUD, add-ons, image upload) |
| `/menu-items` | `/api/admin/menu-items` (CRUD, portions/variants) |
| `/categories`, `/offers` | `/api/admin/categories`, `/api/admin/offers` |
| `/customers` | `/api/admin/users` (role & active toggles, create user) |
| `/notifications` | `POST /api/admin/notifications` |
| `/media-library` | `/api/admin/uploads` (list, upload, delete; shows where each image is used) |
| `/settings` | `/api/auth/change-password` + design-system sheet |

Stats, orders and the order detail refresh every 30 seconds.

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · TanStack Query 5 · React Router 7 ·
shadcn/ui-style components (Radix) · Lucide icons

## Structure

```
src/
  auth/               AuthProvider (session, admin check), RequireAdmin / GuestOnly guards
  components/
    auth/             AuthLayout for login/register/reset screens
    layout/           AppLayout, Sidebar, Topbar
    ui/               shadcn-style primitives: button, input, select, card, switch, sheet
    shared/           StatusBadge, Form helpers, FormSheet, ImageField, QueryState, Pagination…
  hooks/queries.js    One TanStack Query hook per API resource
  lib/                api client, analytics (chart series), format, orderStatus, csv
  pages/              Route components
  sections/<page>/    Larger page sections
  index.css           Design tokens (@theme): colours, type scale, spacing
```
