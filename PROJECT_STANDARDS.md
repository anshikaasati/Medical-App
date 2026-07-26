# PROJECT STANDARDS — Medical Store ERP ("Next-Gen Marg ERP")

> **Purpose of this document:** This is the single source of truth for architecture, conventions, and scope while building this project with AI-assisted development. Any AI assistant (Claude, Cursor, Copilot, etc.) working on this codebase MUST read and follow this file before generating code. If a request conflicts with this file, this file wins — flag the conflict instead of silently deviating.

---

## 1. Project Vision

A modern, cloud-based Pharmacy/Medical Store Management ERP that matches the core functionality of Marg ERP but improves on it with:

- A clean, modern UI (not desktop-era design)
- Cloud access with optional offline sync
- Mobile apps for Owner, Staff, and Customer
- AI features: smart search, OCR prescription reading, sales forecasting, medicine alternatives
- WhatsApp-based ordering and notifications
- Real-time dashboards instead of static reports

**North star:** every feature should reduce clicks and training time for a non-technical shop owner or staff member, while staying GST/Indian-pharmacy-compliant.

---

## 2. Users & Roles

| Role                    | Access Level                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner (Admin)**       | Full access — all modules, reports, settings, user management                                                                                            |
| **Manager**             | Most modules except sensitive financial settings (configurable)                                                                                          |
| **Staff/Cashier**       | Billing, stock lookup, customer search, returns, online-order fulfillment. **No** access to profit reports, settings, user management, or financial data |
| **Customer**            | Own account only — search, order, prescriptions, order history, invoices                                                                                 |
| **Supplier** (Phase 2+) | Own purchase orders, dispatch status, invoice upload                                                                                                     |

Role permissions must be enforced **server-side** (middleware/guard), never only hidden in the UI.

---

## 3. Tech Stack (Locked — do not substitute without updating this file)

| Layer              | Choice                                                              | Notes                                                        |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Frontend (web)     | Next.js (App Router) + React + TypeScript                           | No plain JS files                                            |
| Mobile             | React Native (Expo)                                                 | Shares types/API client with web where possible              |
| Backend            | NestJS (Node.js, TypeScript)                                        | Modular, DI-based; do not mix in Express-style ad-hoc routes |
| Database           | PostgreSQL                                                          | Managed via Prisma ORM                                       |
| Cache/Queue        | Redis                                                               | Sessions, rate limiting, background jobs (BullMQ)            |
| Auth               | JWT (access + refresh) + OTP (mobile)                               | See §7                                                       |
| File/Image Storage | S3-compatible (Supabase Storage or AWS S3)                          | Prescriptions, invoices, product images                      |
| Payments           | Razorpay                                                            | No other gateway without explicit approval                   |
| OCR                | Google Vision API (fallback: Tesseract, self-hosted)                |                                                              |
| Barcode/QR         | ZXing (web), expo-barcode-scanner (mobile)                          |                                                              |
| Charts             | Recharts (web)                                                      |                                                              |
| Styling            | Tailwind CSS + shadcn/ui                                            | No custom CSS frameworks                                     |
| Testing            | Jest + React Testing Library (frontend), Jest + Supertest (backend) |                                                              |
| CI/CD              | GitHub Actions                                                      | Lint + typecheck + test on every PR                          |

**Package manager:** pnpm (monorepo). **Monorepo tool:** Turborepo.

---

## 4. Repository & Folder Structure

```
/apps
  /web            → Next.js owner/staff dashboard
  /customer-web   → Next.js customer storefront (or merged into /web with route groups)
  /mobile         → React Native app (Expo)
  /api            → NestJS backend
/packages
  /types          → Shared TypeScript types/interfaces (DTOs, enums)
  /api-client     → Shared typed fetch/axios client used by web + mobile
  /ui             → Shared shadcn/ui-based component library
  /config         → Shared eslint/tsconfig/tailwind config
/prisma
  schema.prisma
  /migrations
```

**Backend module structure (NestJS)** — one folder per domain, never a giant "controllers" or "services" dumping folder:

```
/src
  /auth
  /inventory
  /billing
  /purchase
  /sales
  /suppliers
  /customers
  /reports
  /ai (search, OCR, forecasting — isolated so provider swaps don't ripple)
  /notifications
  /common (guards, interceptors, pipes, decorators)
```

Each domain module = `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/`, `entities/` (or Prisma types).

---

## 5. Naming Conventions

- **Files:** kebab-case (`medicine-inventory.service.ts`)
- **React components:** PascalCase, one component per file, filename matches component (`MedicineCard.tsx`)
- **Variables/functions:** camelCase
- **DB tables:** snake_case, plural (`medicines`, `purchase_orders`)
- **DB columns:** snake_case
- **Enums:** PascalCase type, UPPER_SNAKE_CASE values (`OrderStatus.OUT_FOR_DELIVERY`)
- **API routes:** kebab-case, plural nouns (`/api/purchase-orders/:id`)
- **Branches:** `feature/inventory-batch-tracking`, `fix/gst-rounding-bug`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`) with the module in scope, e.g. `feat(billing): add barcode scan to POS`

---

## 6. API Design Standards

- REST, versioned: `/api/v1/...`
- Every response follows one envelope shape:

```json
{ "success": true, "data": {}, "error": null, "meta": { "page": 1, "total": 50 } }
```

- Errors use HTTP status codes correctly (400 validation, 401 auth, 403 permission, 404 not found, 409 conflict, 500 server) with a machine-readable `error.code` plus a human `error.message`.
- All list endpoints support pagination (`page`, `limit`), and filtering/sorting via query params — never return unbounded result sets.
- Input validation via `class-validator` DTOs on every endpoint — never trust client input, even from the internal dashboard.
- All monetary values stored as integers in paise/lowest unit, never floats.
- All timestamps stored in UTC; convert to IST only at display layer.

---

## 7. Auth & Security

- JWT access token (short-lived, ~15 min) + refresh token (httpOnly cookie, rotated on use).
- OTP login for customers via SMS (mobile-first market — expect low password adoption).
- Staff/Owner login: email or phone + password + optional 2FA.
- Passwords: bcrypt/argon2, never stored or logged in plaintext.
- Rate limit auth endpoints and OTP requests (Redis-backed).
- Role-based guards on every controller method — default-deny, explicitly allow per role.
- Prescription images and customer PII are sensitive: encrypt at rest where the storage provider supports it, and restrict signed URLs to short expiry.
- All secrets (API keys, DB creds) via environment variables — never hard-coded, never committed. `.env.example` kept up to date; real `.env` gitignored.
- Audit log for: stock edits, price changes, deletions, refunds, permission changes.

---

## 8. Data Model Guardrails

Non-negotiable fields/behaviors regardless of how a feature request is phrased:

- **Medicines** must always carry: batch number, expiry date, manufacturing date, GST rate, supplier reference. Never simplify inventory to a flat "product" table without batch/expiry tracking — this is a pharmacy, expiry is legally significant.
- **Sales/Billing** records are immutable once finalized — corrections happen via a linked return/adjustment record, never by editing the original bill row.
- **Stock changes** always go through a `stock_movements` ledger (purchase in, sale out, return, damage, transfer) — current stock is a derived/cached value, never the only source of truth.
- **Multi-store** (Phase 3): every inventory/sales table is scoped by `store_id` from day one in the schema, even if the MVP only ships one store — retrofitting this later is expensive.

---

## 9. Feature Scope by Phase (do not build ahead of phase without approval)

### Phase 1 — MVP

Auth, Dashboard (basic), Medicine Inventory (CRUD + batch/expiry), Billing (POS + GST invoice), Purchase Management, Sales records, core Reports (P&L, GST, stock), Supplier management, Customer management (basic CRM, no customer-facing app yet).

### Phase 2 — Growth

Barcode scanning, QR billing, Online customer ordering portal, home delivery tracking, WhatsApp invoice/notification integration, mobile-friendly staff interface, loyalty points.

### Phase 3 — AI & Scale

AI medicine search (fuzzy/symptom-based), OCR prescription upload, voice search, sales forecasting, smart purchase suggestions, medicine alternatives engine, multi-store support, predictive analytics dashboard.

**Rule for AI-assisted coding sessions:** if a prompt asks for a Phase 3 feature while Phase 1 is incomplete, implement it behind a feature flag / isolated module so it doesn't destabilize MVP code, and flag the scope jump back to the developer.

---

## 10. UI/UX Standards

- Design system: Tailwind + shadcn/ui, one shared theme file (`packages/config/tailwind`) — no ad-hoc inline color values.
- Every screen must have a loading state, an empty state, and an error state — no bare spinners-forever or blank white screens.
- Staff-facing screens optimized for keyboard + barcode scanner speed (minimal clicks to complete a bill).
- Customer-facing screens mobile-first (most customers will use phones).
- All currency displayed as ₹ with Indian digit grouping (e.g., ₹1,25,000).
- Dates displayed as DD-MMM-YYYY (avoid MM/DD/YYYY ambiguity).

---

## 11. Testing & Quality Gates

- No PR merges without: lint pass, typecheck pass, existing tests passing.
- New backend endpoints require at least one happy-path + one validation-failure test.
- Billing, stock-ledger, and GST calculation logic require unit tests before merge — these are the modules where silent bugs cost real money.
- No `any` type in TypeScript without an inline comment justifying it.

---

## 12. Guardrails for AI-Assisted Development

These rules exist specifically to prevent AI-generated drift from this spec:

1. **Never invent a new library/framework** outside §3 without flagging it as a proposal first.
2. **Never flatten the batch/expiry/GST fields** on medicines "to simplify" — this is core to the domain.
3. **Never bypass the stock_movements ledger** to directly increment/decrement a stock count.
4. **Never put business logic in controllers** — controllers call services; services hold logic.
5. **Never expose role-gated data** by relying on frontend hiding alone — always check on the backend.
6. **Never build Phase 2/3 features as a side effect** of a Phase 1 task — call it out instead.
7. If a requirement in a prompt conflicts with this document, **state the conflict explicitly** rather than silently choosing one.
8. When unsure of a convention not covered here, **match the closest existing pattern in the codebase** rather than introducing a new one, and note the gap so this file can be updated.

---

## 13. Open Items / To Be Decided

- [ ] Confirm offline-sync strategy for shops with unreliable internet (local-first cache vs. simple retry queue)
- [ ] Confirm multi-tenancy approach if this becomes a SaaS product for many pharmacies vs. single-shop deployments
- [ ] Confirm SMS/WhatsApp provider (e.g., Twilio, Gupshup, Meta Cloud API) for OTP + notifications
- [ ] Confirm exact GST reporting format required (GSTR-1 compatible export?)

---

_Last updated: this is a living document — update it whenever an architectural decision is made mid-project, so future AI-assisted sessions stay consistent._
