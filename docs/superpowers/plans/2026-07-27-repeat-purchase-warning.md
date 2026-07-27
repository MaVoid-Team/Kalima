# Repeat Purchase Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Warn authenticated customers before they submit a regular-product or e-booklet purchase containing an item from a pending or successful prior purchase, while always allowing an explicit repeat purchase.

**Architecture:** Add an authenticated preflight operation beside each existing checkout endpoint.
The regular-product operation reads the server-owned active cart, while the e-booklet operation validates submitted template identifiers.
Both frontends use one accessible warning dialog and only call the existing purchase endpoint after either a clean preflight result or explicit customer confirmation.

**Tech Stack:** Express, TypeScript, Prisma, Jest, React 19, Radix UI dialog primitives, i18next, Vite, Node source-contract tests.

## Global Constraints

The feature covers regular store products and teacher e-booklets.

Pending, awaiting-payment, paid, received, confirmed, customization-in-progress, ready, and delivered equivalents trigger the warning.

Returned, cancelled, rejected, failed, and refunded equivalents do not trigger the warning.

Regular products match by stable product identifier.

E-booklets match by stable template identifier across template versions.

The server derives customer identity from authentication and never accepts a customer identifier from the client.

The warning appears after existing form validation and before order creation.

`Go back` preserves the form, while `Continue purchase` submits exactly once.

The existing creation endpoints continue to allow repeated purchases.

If preflight fails, checkout shows its existing error treatment and does not silently submit.

No database migration or new dependency is allowed.

---

### Task 1: Regular-product repeat-purchase preflight

**Files:**

- Modify: `kalima-platform/backend/src/apps/store-api/services/cart.service.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/services/cart.service.spec.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/controllers/cart.controller.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/routes/v2/cart.routes.ts`

**Interfaces:**

```ts
type RepeatPurchaseItem = {
  id: number;
  title: string;
};

CartService.getRepeatPurchaseItems(
  userId: number,
  cartType?: "active" | "fastbuy",
): Promise<RepeatPurchaseItem[]>;

GET /cart/checkout/repeat-purchases
200 { success: true, data: { items: RepeatPurchaseItem[] } }
```

- [ ] Add failing Jest cases to `cart.service.spec.ts` that configure an active cart with product IDs and assert that `getRepeatPurchaseItems(42)` queries `purchase_items` through `purchases.user_id = 42`, includes statuses `pending`, `received`, `confirmed`, and `delivered`, excludes `returned`, deleted purchases, and deleted items, selects `products.id` and `products.title`, and deduplicates repeated product IDs.

- [ ] Run the focused test and confirm it fails because `getRepeatPurchaseItems` does not exist.

```bash
cd kalima-platform/backend
npx jest src/apps/store-api/services/cart.service.spec.ts --runInBand
```

- [ ] Implement `CartService.getRepeatPurchaseItems` with this query shape and normalize the result.

```ts
const ACTIVE_PURCHASE_STATUSES = ["pending", "received", "confirmed", "delivered"];

const cart = await this.prisma.carts.findFirst({
  where: { user_id: userId, status: cartType, is_deleted: false },
  select: { cart_items: { where: { is_deleted: false }, select: { product_id: true } } },
});

const productIds = [...new Set((cart?.cart_items ?? []).map(({ product_id }) => product_id))];
if (productIds.length === 0) return [];

const priorItems = await this.prisma.purchase_items.findMany({
  where: {
    product_id: { in: productIds },
    is_deleted: false,
    purchases: {
      user_id: userId,
      status: { in: ACTIVE_PURCHASE_STATUSES },
      is_deleted: false,
    },
  },
  select: { product_id: true, products: { select: { id: true, title: true } } },
});

return [...new Map(priorItems.map(({ products }) => [
  products.id,
  { id: products.id, title: products.title },
])).values()];
```

- [ ] Add `cartController.getRepeatPurchaseItems`, deriving `userId` from `req.user.userId`, and return `{ success: true, data: { items } }`.

- [ ] Register `GET /checkout/repeat-purchases` with the existing cart authentication middleware before the parameterized item routes can capture it.

- [ ] Run the focused service test and backend TypeScript build.

```bash
cd kalima-platform/backend
npx jest src/apps/store-api/services/cart.service.spec.ts --runInBand
npm run build
```

- [ ] Commit the regular-product backend slice.

```bash
git add kalima-platform/backend/src/apps/store-api/services/cart.service.ts \
  kalima-platform/backend/src/apps/store-api/services/cart.service.spec.ts \
  kalima-platform/backend/src/apps/store-api/controllers/cart.controller.ts \
  kalima-platform/backend/src/apps/store-api/routes/v2/cart.routes.ts
git commit -m "feat: detect repeated product purchases"
```

### Task 2: E-booklet repeat-purchase preflight

**Files:**

- Modify: `kalima-platform/backend/src/apps/store-api/dtos/e-booklet.dto.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.spec.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`

**Interfaces:**

```ts
class EBookletRepeatPurchaseCheckDto {
  template_ids!: number[];
}

EBookletService.getRepeatPurchaseTemplates(
  teacherId: number,
  templateIds: number[],
): Promise<Array<{ id: number; title: string }>>;

POST /e-booklet-checkout/repeat-purchases
{ template_ids: number[] }
200 { success: true, data: { items: Array<{ id: number; title: string }> } }
```

- [ ] Add failing Jest cases to `e-booklet.service.spec.ts` asserting that the method matches the authenticated teacher and template IDs, includes `pending`, `awaiting_payment`, `paid`, `needs_branding_info`, `customization_in_progress`, `ready`, and `delivered`, excludes `cancelled` and `rejected`, returns template titles, matches across template-version IDs, and deduplicates repeated template IDs.

- [ ] Run the focused test and confirm it fails because `getRepeatPurchaseTemplates` does not exist.

```bash
cd kalima-platform/backend
npx jest src/apps/store-api/services/e-booklet.service.spec.ts --runInBand
```

- [ ] Add the DTO with `@IsArray`, `@ArrayNotEmpty`, `@ArrayMaxSize(100)`, `@IsInt({ each: true })`, and `@Type(() => Number)` validation.

- [ ] Implement the service query.

```ts
const ACTIVE_E_BOOKLET_PURCHASE_STATUSES = [
  "pending",
  "awaiting_payment",
  "paid",
  "needs_branding_info",
  "customization_in_progress",
  "ready",
  "delivered",
] as const;

const uniqueTemplateIds = [...new Set(templateIds)];
const purchases = await this.db.e_booklet_purchases.findMany({
  where: {
    teacher_id: teacherId,
    template_id: { in: uniqueTemplateIds },
    status: { in: [...ACTIVE_E_BOOKLET_PURCHASE_STATUSES] },
  },
  select: { template_id: true, template: { select: { id: true, title: true } } },
});

return [...new Map(purchases.map(({ template }) => [
  template.id,
  { id: template.id, title: template.title },
])).values()];
```

- [ ] Add a controller method that validates the DTO, derives the teacher ID from the authenticated request, calls the service, and returns `{ success: true, data: { items } }`.

- [ ] Register the authenticated JSON route immediately before the multipart `/e-booklet-checkout` route.

- [ ] Run the focused e-booklet test and backend TypeScript build.

```bash
cd kalima-platform/backend
npx jest src/apps/store-api/services/e-booklet.service.spec.ts --runInBand
npm run build
```

- [ ] Commit the e-booklet backend slice.

```bash
git add kalima-platform/backend/src/apps/store-api/dtos/e-booklet.dto.ts \
  kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts \
  kalima-platform/backend/src/apps/store-api/services/e-booklet.service.spec.ts \
  kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts \
  kalima-platform/backend/src/apps/store-api/routes/v2/e-booklet.routes.ts
git commit -m "feat: detect repeated e-booklet purchases"
```

### Task 3: Shared warning dialog and checkout behavior

**Files:**

- Create: `kalima-platform/frontend/src/components/checkout/RepeatPurchaseWarningDialog.jsx`
- Modify: `kalima-platform/frontend/src/hooks/useCheckoutPage.js`
- Modify: `kalima-platform/frontend/src/pages/checkout/CheckoutPage.jsx`
- Modify: `kalima-platform/frontend/src/hooks/useEBooklets.js`
- Modify: `kalima-platform/frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`
- Modify: `kalima-platform/frontend/src/locales/en/checkout.json`
- Modify: `kalima-platform/frontend/src/locales/ar/checkout.json`
- Modify: `kalima-platform/frontend/src/locales/en/eBooklets.json`
- Modify: `kalima-platform/frontend/src/locales/ar/eBooklets.json`
- Create: `kalima-platform/frontend/e2e/repeat-purchase-warning.spec.js`

**Interfaces:**

```jsx
<RepeatPurchaseWarningDialog
  open={boolean}
  items={Array<{ id: number, title: string }>}
  loading={boolean}
  title={string}
  description={string}
  backLabel={string}
  continueLabel={string}
  onBack={() => void}
  onContinue={() => void}
/>
```

- [ ] Add failing Playwright scenarios that authenticate with controlled browser state, mock the two checkout APIs, and prove both checkout flows call their repeat-purchase endpoints before submission, render the shared dialog and repeated title, preserve the page after `Go back`, and submit exactly once after `Continue purchase`.

- [ ] Run the test and confirm it fails because the dialog and endpoint calls do not exist.

```bash
cd kalima-platform/frontend
npx playwright test e2e/repeat-purchase-warning.spec.js
```

- [ ] Build the shared dialog from the existing `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, and `Button` components.

- [ ] Render duplicate titles in a scroll-safe list with `min-w-0`, wrapping text, mobile-safe width, Arabic RTL compatibility, focus on `Go back`, Escape closing behavior, and disabled actions during submission.

- [ ] Refactor `useCheckoutPage` into a private `submitCheckout(formData)` function plus `handleCheckout(formData)`, `confirmRepeatPurchase()`, and `dismissRepeatPurchase()` functions.

- [ ] Have regular checkout call `GET /cart/checkout/repeat-purchases` with `showToast: false`, store the original validated form data only when duplicate items exist, and submit immediately when the returned list is empty.

- [ ] Remove the stray `alert("Here 1: ", serial)` from `useCheckoutPage` because browser alerts would conflict with the accessible warning flow.

- [ ] Extend `useEBookletCheckout` with `checkRepeatPurchases(templateIds)` calling `POST /e-booklet-checkout/repeat-purchases` with `{ template_ids: templateIds }` and no success toast.

- [ ] Refactor the e-booklet page's validated submit path so it runs preflight after existing validation, stores its `FormData` when duplicate items exist, and submits only after explicit continuation.

- [ ] Add equivalent English and Arabic translation keys for title, description, `Go back`, and `Continue purchase` in both checkout namespaces.

- [ ] Run the Playwright behavior test against the local frontend and run the production frontend build.

```bash
cd kalima-platform/frontend
npx playwright test e2e/repeat-purchase-warning.spec.js
npm run build
```

- [ ] Commit the frontend slice.

```bash
git add kalima-platform/frontend/src/components/checkout/RepeatPurchaseWarningDialog.jsx \
  kalima-platform/frontend/src/hooks/useCheckoutPage.js \
  kalima-platform/frontend/src/pages/checkout/CheckoutPage.jsx \
  kalima-platform/frontend/src/hooks/useEBooklets.js \
  kalima-platform/frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx \
  kalima-platform/frontend/src/locales/en/checkout.json \
  kalima-platform/frontend/src/locales/ar/checkout.json \
  kalima-platform/frontend/src/locales/en/eBooklets.json \
  kalima-platform/frontend/src/locales/ar/eBooklets.json \
  kalima-platform/frontend/e2e/repeat-purchase-warning.spec.js
git commit -m "feat: warn before repeated purchases"
```

### Task 4: Integrated verification and visual proof

**Files:**

- Create: `docs/proof/repeat-purchase-warning.png`

- [ ] Run the full focused backend suite and both builds from a clean worktree.

```bash
cd kalima-platform/backend
npx jest src/apps/store-api/services/cart.service.spec.ts src/apps/store-api/services/e-booklet.service.spec.ts --runInBand
npm run build
cd ../frontend
npx playwright test e2e/repeat-purchase-warning.spec.js
npm run build
```

- [ ] Start the Kalima local stack using the `kalima-local-dev` skill and use only Codex's built-in Browser for UI verification.

- [ ] Create or reuse controlled local data where the signed-in user has a pending purchase for the cart's regular product and a pending purchase for the selected e-booklet template.

- [ ] Verify regular checkout opens the warning, `Go back` preserves entered form data, a second attempt followed by `Continue purchase` creates exactly one order, and no warning appears for an item whose only prior order is returned.

- [ ] Verify e-booklet checkout opens the warning for a pending purchase, lists the title, preserves payment fields and uploaded proof after `Go back`, and permits one repeated purchase after `Continue purchase`.

- [ ] Verify desktop, mobile, English, Arabic RTL, keyboard focus, Escape behavior, and absence of console errors.

- [ ] Capture `docs/proof/repeat-purchase-warning.png` with the dialog and at least one repeated title visible.

- [ ] Run `git diff --check`, confirm only scoped files changed, and commit the proof.

```bash
git diff --check
git status --short
git add docs/proof/repeat-purchase-warning.png
git commit -m "test: add repeat purchase warning proof"
```
