# Cart Purchase Module

> Manages the complete lifecycle of e-commerce cart purchases — from checkout through status transitions to reporting and admin operations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Design Patterns](#design-patterns)
  - [Checkout Flow](#checkout-flow)
  - [Purchase Status Lifecycle](#purchase-status-lifecycle)
- [API Reference](#api-reference)
  - [User Endpoints](#user-endpoints)
  - [Admin / Staff Endpoints](#admin--staff-endpoints)
- [Project Structure](#project-structure)
- [Services](#services)
  - [CheckoutValidator](#checkoutvalidator)
  - [PriceCalculator](#pricecalculator)
  - [SerialService](#serialservice)
  - [MonthlyCountService](#monthlycountservice)
- [Strategies](#strategies)
  - [StrategyFactory](#strategyfactory)
  - [BookStrategy](#bookstrategy)
  - [ProductStrategy](#productstrategy)
- [Helpers](#helpers)
- [Key Design Decisions](#key-design-decisions)
- [Extension Guide](#extension-guide)
- [Testing Strategy](#testing-strategy)

---

## Overview

This module owns every operation related to cart purchases:

| Concern                | What it covers                                                                  |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Checkout**           | Validation, pricing, serial generation, persistence, notifications              |
| **Status Transitions** | `pending → received → confirmed`, `received/confirmed → returned`               |
| **Queries & Reports**  | User purchases, admin listing with search, staff performance reports, analytics |
| **Admin Operations**   | Notes, item deletion, full purchase deletion with rollback                      |

The controller layer is intentionally thin. Volatile logic (validation rules, pricing math, product-type branching) is delegated to **services** and **strategies** so that each file has a single reason to change.

---

## Architecture

### Design Patterns

#### Strategy Pattern

Product-type-specific behavior (e.g., book metadata decoration) is isolated behind a strategy interface. At checkout, the `StrategyFactory` inspects the cart item discriminator (`__t`) and returns the appropriate strategy. This allows adding new product types without modifying existing code (Open/Closed Principle).

```
StrategyFactory.getStrategy(cartItems)
    ├── __t === "ECBook"    → bookStrategy.decorateItems(items, body)
    └── __t === "ECProduct" → productStrategy.decorateItems(items)  // identity
```

#### Service Layer

Cross-cutting concerns are extracted into dedicated services:

- **CheckoutValidator** — all validation rules in one place
- **PriceCalculator** — type-agnostic line-item construction and totals
- **SerialService** — deterministic serial generation (Cairo timezone)
- **MonthlyCountService** — shared cache logic consumed by multiple controllers

### Checkout Flow

```
POST /api/cart-purchases
 │
 ├─ 1. Throttle check (30s cooldown per user)
 ├─ 2. Load cart (itemsWithDetails virtual + coupon populate)
 ├─ 3. CheckoutValidator
 │      ├── ensureCartNotEmpty(cartItems)
 │      ├── ensureBookFieldsIfNeeded(cartItems, body)
 │      └── validatePayment({ total, body, paymentFile })
 ├─ 4. StrategyFactory → picks bookStrategy | productStrategy
 ├─ 5. PriceCalculator
 │      ├── buildLineItems(cartItems) → base items with per-item couponCode & discount
 │      └── totalsFromCart(cart)       → { subtotal, discount, total }
 ├─ 6. Strategy.decorateItems(baseItems, body) → decorated items
 ├─ 7. SerialService.generatePurchaseSerial(userSerial)
 ├─ 8. ECCartPurchase.create({ ... })
 ├─ 9. Loop cart items → coupon.markAsUsed() for each item that has a coupon
 ├─ 10. Notifications
 │       ├── Email (purchase confirmation to user)
 │       ├── WhatsApp (optional, if phone number exists)
 │       ├── In-app (Notification.insertMany to all Admin/SubAdmin/Moderator)
 │       └── Bell (real-time socket via emitBellNotification)
 ├─ 11. User stats update (numberOfPurchases++, TotalSpentAmount+=total)
 └─ 12. cart.clear()
```

### Purchase Status Lifecycle

```
                              ┌────────────────────────────────────┐
                              │                                    ▼
  ┌─────────┐  receivePurchase  ┌──────────┐  confirmCartPurchase  ┌───────────┐
  │ pending ├──────────────────▶│ received ├───────────────────────▶│ confirmed │
  └─────────┘                   └────┬─────┘                       └───────────┘
                                     │                                   ▲
                          returnCart  │                    confirmCart     │
                          Purchase   │                    Purchase       │
                                     ▼                                   │
                               ┌──────────┐                              │
                               │ returned ├──────────────────────────────┘
                               └──────────┘
```

| Transition                      | Guard                                    | Side Effects                                               |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `pending → received`            | Status must be `pending`                 | Sets `receivedBy`, `receivedAt`                            |
| `received → confirmed`          | Status must be `received` or `returned`  | Sets `confirmedBy`, `confirmedAt`, refreshes monthly cache |
| `received/confirmed → returned` | Status must be `confirmed` or `received` | Sets `returnedBy`, `returnedAt`                            |

---

## API Reference

**Base path:**

- **v1:** `/api/v1/ec/cart-purchases` (cart-level coupon)
- **v2:** `/api/v2/ec/cart-purchases` (per-item coupon)

**Auth:** All routes require JWT (`verifyJWT` middleware).

> **v2 coupon change:** In v2, coupons are applied per cart item (not per cart). At checkout,
> each item's coupon is individually marked as used. The purchase `items[]` subdocuments
> carry their own `couponCode` and `discount` fields. The top-level purchase `discount`
> is the sum of all per-item discounts.

### User Endpoints

| Method | Path | Handler              | Description                                                                                                         |
| ------ | ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`  | `createCartPurchase` | Create a new purchase from the active cart. Accepts `multipart/form-data` (payment screenshot, optional watermark). |
| `GET`  | `/`  | `getCartPurchases`   | List the authenticated user's own purchases (sorted by newest).                                                     |

#### `POST /` — Create Purchase

**Content-Type:** `multipart/form-data`

| Field                   | Type       | Required | Condition                                     |
| ----------------------- | ---------- | -------- | --------------------------------------------- |
| `paymentMethod`         | `ObjectId` | Yes\*    | When `total > 0`                              |
| `numberTransferredFrom` | `String`   | Yes\*    | When `total > 0`                              |
| `paymentScreenShot`     | `File`     | Yes\*    | When `total > 0`                              |
| `nameOnBook`            | `String`   | Yes\*    | When cart contains books (`__t === "ECBook"`) |
| `numberOnBook`          | `String`   | Yes\*    | When cart contains books                      |
| `seriesName`            | `String`   | Yes\*    | When cart contains books                      |
| `notes`                 | `String`   | No       | Free-text customer note                       |
| `watermark`             | `File`     | No       | Optional watermark image                      |

**Responses:**

| Status | Description                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------- |
| `201`  | Purchase created successfully                                                                      |
| `400`  | Validation error (empty cart, missing book fields, missing payment, same number as payment method) |
| `429`  | Throttled — another purchase was made within the last 30 seconds                                   |

---

### Admin / Staff Endpoints

**Roles:** `Admin`, `SubAdmin`, `Moderator` unless noted otherwise.

| Method   | Path                         | Handler                             | Roles                      | Description                                                     |
| -------- | ---------------------------- | ----------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `GET`    | `/admin/all`                 | `getAllPurchases`                   | Admin, SubAdmin, Moderator | Paginated list with search and filters                          |
| `GET`    | `/admin/statistics`          | `getPurchaseStatistics`             | Admin                      | Aggregate overview + monthly + optional daily stats             |
| `GET`    | `/admin/product-statistics`  | `getProductPurchaseStats`           | Admin                      | Per-product purchase count and revenue                          |
| `GET`    | `/admin/response-time`       | `getResponseTimeStatistics`         | Admin                      | Business-hour response/confirm time analytics                   |
| `GET`    | `/admin/fullreport`          | `getFullOrdersReport`               | Admin                      | Staff performance report (per-staff response & confirm times)   |
| `GET`    | `/confirmed-count`           | `getMonthlyConfirmedPurchasesCount` | Admin, SubAdmin, Moderator | Current user's monthly confirmed purchase count (cached)        |
| `GET`    | `/:id`                       | `getCartPurchaseById`               | Admin, SubAdmin, Moderator | Single purchase detail with all populates                       |
| `PATCH`  | `/:id/receive`               | `receivePurchase`                   | Admin, SubAdmin, Moderator | Transition `pending → received`                                 |
| `PATCH`  | `/:id/confirm`               | `confirmCartPurchase`               | Admin, SubAdmin, Moderator | Transition `received/returned → confirmed`                      |
| `PATCH`  | `/:id/return`                | `returnCartPurchase`                | Admin, SubAdmin, Moderator | Transition `confirmed/received → returned`                      |
| `PATCH`  | `/:id/admin-note`            | `addAdminNote`                      | Admin, SubAdmin, Moderator | Attach/update admin note                                        |
| `DELETE` | `/:id`                       | `deletePurchase`                    | Admin, SubAdmin            | Delete purchase (rollbacks: user stats, coupon, monthly cache)  |
| `DELETE` | `/:purchaseId/items/:itemId` | `deleteItemFromPurchase`            | Admin, SubAdmin            | Remove a single item (recalculates totals; blocks if last item) |

#### `GET /admin/all` — Query Parameters

| Param       | Type       | Description                                                                                                                                   |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`      | `Number`   | Page number (default: `1`)                                                                                                                    |
| `limit`     | `Number`   | Results per page (default: `10`)                                                                                                              |
| `status`    | `String`   | Filter by status (`pending`, `received`, `confirmed`, `returned`)                                                                             |
| `startDate` | `ISO Date` | Filter purchases created on or after this date                                                                                                |
| `endDate`   | `ISO Date` | Filter purchases created on or before this date                                                                                               |
| `minTotal`  | `Number`   | Minimum purchase total                                                                                                                        |
| `maxTotal`  | `Number`   | Maximum purchase total                                                                                                                        |
| `search`    | `String`   | Full-text search across: purchase serial, user name/email/phone, product title/serial, transfer number. Also supports direct ObjectId lookup. |

#### `GET /admin/statistics` — Query Parameters

| Param  | Type       | Description                                                        |
| ------ | ---------- | ------------------------------------------------------------------ |
| `date` | `ISO Date` | Optional. If provided, includes daily stats for that specific day. |

**Response shape:**

```json
{
  "overview": { "totalPurchases", "confirmedPurchases", "pendingPurchases", "totalRevenue", "confirmedRevenue", "averagePrice" },
  "monthlyStats": [ { "year", "month", "count", "revenue", "confirmedCount", "confirmedRevenue" } ],
  "dailyStats": null | { /* same shape as overview */ }
}
```

#### `GET /admin/response-time` — Query Parameters

| Param       | Type       | Description                            |
| ----------- | ---------- | -------------------------------------- |
| `startDate` | `ISO Date` | Start of range (default: `2025-11-01`) |
| `endDate`   | `ISO Date` | End of range (default: now)            |

**Response shape:**

```json
{
  "receiveTime":       { "averageMinutes", "maxMinutes", "minMinutes", "count" },
  "confirmTime":       { "averageMinutes", "maxMinutes", "minMinutes", "count" },
  "totalResponseTime": { "averageMinutes", "maxMinutes", "minMinutes", "count" },
  "currentStatus":     { "pending": N, "received": N, "confirmed": N }
}
```

> Times are calculated in **business hours only** (9 AM – 9 PM Cairo time).

---

## Project Structure

```
cart-purchase/
│
├── index.js                              # Barrel export — all 15 handlers for routes
├── helpers.js                            # Timezone + business-minute utilities
├── README.md
│
│  ── Checkout ──────────────────────────
├── createCartPurchase.js                 # Checkout orchestrator (Strategy + Services)
│
│  ── Status Transitions ───────────────
├── receivePurchase.js                    # pending → received
├── confirmCartPurchase.js                # received|returned → confirmed
├── returnCartPurchase.js                 # confirmed|received → returned
│
│  ── Queries & Reports ────────────────
├── getCartPurchases.js                   # User's own purchases
├── getCartPurchaseById.js                # Single purchase detail
├── getAllPurchases.js                     # Admin: filtered + paginated + search
├── getFullOrdersReport.js                # Staff performance report
├── getMonthlyConfirmedPurchasesCount.js  # Monthly confirmed count (lazy cache)
├── getProductPurchaseStats.js            # Per-product analytics (aggregation)
├── getPurchaseStatistics.js              # Overview + monthly + daily stats
├── getResponseTimeStatistics.js          # Business-hour response time analytics
│
│  ── Admin Operations ─────────────────
├── addAdminNote.js                       # Attach/update admin note
├── deleteItemFromPurchase.js             # Remove one item, recalculate totals
├── deletePurchase.js                     # Full delete with rollbacks
│
│  ── Services ─────────────────────────
├── services/
│   ├── checkoutValidator.js              # Validation rules
│   ├── priceCalculator.js                # Type-agnostic line items + totals
│   ├── serialService.js                  # Cairo-time daily serial generation
│   └── monthlyCountService.js            # Shared monthly-count cache logic
│
│  ── Strategies ───────────────────────
└── strategies/
    ├── strategyFactory.js                # Picks strategy by item __t; rejects mixed carts
    ├── bookStrategy.js                   # Decorates with nameOnBook, numberOnBook, seriesName
    └── productStrategy.js                # Identity pass-through
```

---

## Services

### CheckoutValidator

**File:** `services/checkoutValidator.js`

Encapsulates all pre-checkout validation. Each method throws `AppError` on failure.

| Method                     | Signature                                                                                               | Purpose                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ensureCartNotEmpty`       | `(cartItems) → void`                                                                                    | Throws 400 if cart has no items                                                                                                                                               |
| `ensureBookFieldsIfNeeded` | `(cartItems, body) → void`                                                                              | Throws 400 if any item is `ECBook` and `nameOnBook`, `numberOnBook`, or `seriesName` is missing                                                                               |
| `validatePayment`          | `async ({ total, body, paymentFile }) → { paymentMethodDoc, numberTransferredFrom, paymentScreenShot }` | Skips validation when `total ≤ 0` (free order). Otherwise validates file, transfer number, and payment method. Prevents user from submitting the payment method's own number. |

### PriceCalculator

**File:** `services/priceCalculator.js`

Produces type-agnostic data structures. Product-type decoration is **not** done here — that responsibility belongs to strategies.

| Method           | Signature                                | Purpose                                                                                               |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `buildLineItems` | `(cartItems) → Array<LineItem>`          | Maps cart items to `{ product, productType, priceAtPurchase, couponCode, discount, productSnapshot }` |
| `totalsFromCart` | `(cart) → { subtotal, discount, total }` | Reads pre-calculated totals from the cart document (discount = sum of per-item discounts)             |

### SerialService

**File:** `services/serialService.js`

Generates deterministic purchase serial numbers scoped to user and Cairo-timezone day.

| Function                 | Signature                     | Output Format                                                         |
| ------------------------ | ----------------------------- | --------------------------------------------------------------------- |
| `buildUserSerial`        | `(user) → String`             | `user.userSerial` or last 8 chars of `_id` uppercased                 |
| `generatePurchaseSerial` | `async (userSerial) → String` | `{userSerial}-CP-{YYYYMMDD}-{NNN}` (e.g., `AB12CD34-CP-20260206-001`) |

### MonthlyCountService

**File:** `services/monthlyCountService.js`

Shared logic consumed by both `confirmCartPurchase` (eager cache) and `getMonthlyConfirmedPurchasesCount` (lazy cache).

| Function                       | Signature                 | Purpose                                                                                                                                    |
| ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `refreshMonthlyConfirmedCount` | `async (userId) → Number` | Counts confirmed purchases for the current Cairo month, updates `User.monthlyConfirmedCount` and `lastConfirmedCountUpdate`, returns count |
| `isCacheStale`                 | `(user) → Boolean`        | Returns `true` if cache has never been set or belongs to a previous month                                                                  |

---

## Strategies

### StrategyFactory

**File:** `strategies/strategyFactory.js`

| Function      | Signature                | Behavior                                                               |
| ------------- | ------------------------ | ---------------------------------------------------------------------- |
| `detectType`  | `(cartItems) → String`   | Extracts unique `__t` values. Throws 400 if cart contains mixed types. |
| `getStrategy` | `(cartItems) → Strategy` | Returns the matching strategy or falls back to `productStrategy`.      |

### BookStrategy

**File:** `strategies/bookStrategy.js`

```js
decorateItems(items, body) → items with { nameOnBook, numberOnBook, seriesName }
```

Attaches book-specific metadata from the request body to each line item.

### ProductStrategy

**File:** `strategies/productStrategy.js`

```js
decorateItems(items) → items  // identity — no decoration
```

---

## Helpers

**File:** `helpers.js`

| Export                                 | Type                    | Description                                                                                    |
| -------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `EGYPT_TIMEZONE`                       | `String`                | `"Africa/Cairo"`                                                                               |
| `BUSINESS_START_HOUR`                  | `Number`                | `9` (9 AM)                                                                                     |
| `BUSINESS_END_HOUR`                    | `Number`                | `21` (9 PM)                                                                                    |
| `DEFAULT_STATS_START_DATE`             | `Date`                  | `2025-11-01` — default range start for stats endpoints                                         |
| `getCurrentEgyptTime()`                | `() → DateTime`         | Current Luxon `DateTime` in Cairo timezone                                                     |
| `calculateBusinessMinutes(start, end)` | `(Date, Date) → Number` | Minutes between two dates counting only business hours (9 AM – 9 PM). Handles multi-day spans. |
| `formatMinutes(minutes)`               | `(Number) → String`     | Human-readable format: `"45m"` or `"2h 15m"`                                                   |

---

## Key Design Decisions

| Decision                                                    | Rationale                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| PriceCalculator builds **type-agnostic** base items         | Book-field decoration is a product-type concern → belongs in the strategy, not the calculator (SRP)                                        |
| `monthlyCountService` as shared service                     | Prevents duplication between confirm (eager cache write) and GET count (lazy cache read)                                                   |
| `isCacheStale()` helper                                     | Encapsulates month-boundary staleness logic so callers stay readable                                                                       |
| Strategies expose only `decorateItems`                      | Keeps the strategy interface minimal; additional hooks (e.g., `validateItems`, `postPersist`) can be added without touching the controller |
| Throttle check at controller level                          | Simple 30s cooldown prevents accidental double-submits without complex idempotency keys                                                    |
| Existence check before update in `addAdminNote`             | Prevents silent no-ops when an invalid ID is provided                                                                                      |
| `getAllPurchases` uses `$in` batch populate                 | Eliminates N+1 queries — aggregation results are re-populated in a single query                                                            |
| `deletePurchase` refreshes monthly cache **after** deletion | Ensures the deleted purchase is naturally excluded from the count without manual `$ne` filters                                             |

---

## Extension Guide

| Feature                           | Where to Change                                                                                            | Controller Impact |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| **Per-Item Coupon**               | ✅ Implemented in v2. See `cart/apply-coupon.js`, `priceCalculator.js`, `createCartPurchase.js`            | Done              |
| **Dynamic Required Fields**       | `services/checkoutValidator.js` — load rules from a `CheckoutFieldConfig` collection                       | None              |
| **New Product Type**              | Create `strategies/newTypeStrategy.js` with `decorateItems(items, body)`, register in `strategyFactory.js` | None              |
| **New Status Transition**         | Add controller file (e.g., `cancelPurchase.js`), export from `index.js`, add route                         | Additive only     |
| **Webhook Notifications**         | Add a new notification block in `createCartPurchase.js` after step 10                                      | Minimal           |
| **Pagination for User Purchases** | Add `page`/`limit` query params in `getCartPurchases.js`                                                   | Self-contained    |

---

## Testing Strategy

### Unit Tests

| Module                | Test Cases                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkoutValidator`   | Empty cart → 400; cart with books + missing fields → 400; free order skips payment; same number as payment method → 400; valid payment → returns doc |
| `priceCalculator`     | `buildLineItems` maps correct shape (no book fields); `totalsFromCart` preserves all four properties                                                 |
| `serialService`       | First serial of day → `-001`; sequential increments; Cairo day boundary rollover                                                                     |
| `monthlyCountService` | `isCacheStale` returns `true` for null, previous month; `refreshMonthlyConfirmedCount` returns correct count                                         |
| `bookStrategy`        | Decorates all items with `nameOnBook`, `numberOnBook`, `seriesName`                                                                                  |
| `productStrategy`     | Returns items unchanged (identity)                                                                                                                   |
| `strategyFactory`     | Pure book cart → bookStrategy; pure product cart → productStrategy; mixed → throws 400                                                               |

### Integration Tests

| Scenario                                     | Assertions                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Checkout (book)                              | Purchase persisted with book fields, coupon marked used, email sent, user stats incremented, cart cleared |
| Checkout (product)                           | Purchase persisted without book fields, same side effects                                                 |
| Checkout (free order)                        | No payment fields required, purchase created with `total: 0`                                              |
| Status: receive → confirm → return → confirm | Correct timestamps and `*By` fields set at each step; monthly cache updated on confirm                    |
| Delete purchase (confirmed)                  | User stats decremented, coupon restored, monthly cache refreshed                                          |
| Delete item (2+ items)                       | Totals recalculated, item removed                                                                         |
| Delete item (last item)                      | Blocked with 400                                                                                          |
| Search (`getAllPurchases`)                   | ObjectId fast-path, serial search, user name search all return correct results                            |

### Regression

- `getFullOrdersReport` response-time tracks **all received orders**, not only confirmed ones (legacy bug fixed).
- `deletePurchase` monthly cache reflects deletion (no stale `$ne` filter).
