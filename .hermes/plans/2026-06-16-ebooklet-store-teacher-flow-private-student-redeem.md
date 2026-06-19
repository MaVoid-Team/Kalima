# Plan: E-booklet teacher store flow + private student redemption

## Captured requirement
- `/e-booklets` is a public teacher-facing eBooklet store.
- Student redemption is private direct-link/code only; it must not be listed in public navigation/store/search.
- EBooklets keep their own data/pages/routes, but the customer purchase journey must reuse the normal Store flow **exactly page-by-page and component-by-component**, customized for eBooklets.
- Teacher access/code management unlocks only after admin confirms manual payment, same as the normal Store purchase lifecycle.
- Student redemption requires login/signup, binds permanent access to the student account, and then appears in the student dashboard eBooklets page.
- Code generation after approval supports all modes: teacher one-by-one, teacher bulk quantity, and admin generation/control.

## Current code observations
- Normal Store checkout route uses `WizardCheckoutPage` with shared components:
  - `components/checkout/WizardStepper`
  - `components/checkout/steps/CartStep`
  - `components/checkout/steps/PaymentStep`
  - `components/checkout/PaymentMethod`
  - `components/checkout/OrderSummary`
  - `components/checkout/PrintableReceipt`
  - `components/cart/EmptyCartState`
  - `contexts/CartContext.jsx`
- Current eBooklet flow has separate custom pages:
  - `pages/e-booklets/EBookletStorePage.jsx`
  - `pages/e-booklets/EBookletDetailsPage.jsx`
  - `pages/e-booklets/EBookletCartPage.jsx`
  - `pages/e-booklets/EBookletCheckoutPage.jsx`
  - `pages/e-booklets/AcceptEBookletInvitePage.jsx`
- Current public routes include:
  - `/e-booklets`
  - `/e-booklets/instances/:instanceId`
  - `/e-booklet-cart`
  - `/e-booklet-checkout`
  - `/e-booklet-invite/:token`
  - `/e-booklet-code`
- Backend currently has eBooklet-specific routes including:
  - `GET /e-booklet-store`
  - `GET /e-booklet-store/instances/:instanceId`
  - `POST /e-booklet-checkout`
  - admin eBooklet purchase/status/deliver routes.

## Implementation plan

### 1. Freeze the route model
- Keep `/e-booklets` public and teacher-facing.
- Change public detail route away from student instances if needed:
  - preferred teacher route: `/e-booklets/:templateId` or `/e-booklets/templates/:templateId`.
  - student instance/redeem routes must stay private/direct-link only.
- Keep private redemption routes hidden from nav:
  - existing `/e-booklet-invite/:token`
  - existing `/e-booklet-code`
  - optionally add clearer alias `/e-booklets/redeem/:token?` while preserving old links.

### 2. Separate teacher catalog from student access records
- Public eBooklet store API must return teacher-buyable eBooklet templates/products only.
- It must not return student-owned instances, student invite links, or access-code records.
- Detail API must return teacher-purchase details: title, cover, description, preview metadata, price, currency, available status.
- Student redeem APIs remain private and code/token-based.

### 3. Reuse normal Store purchase flow components exactly
Refactor normal Store checkout components to accept a cart adapter instead of hard-wiring `useCart()`:
- Introduce a shared checkout adapter shape:
  - `cart`
  - `loading`
  - `addToCart`
  - `removeFromCart`
  - `clearCart`
  - `checkout(formData)`
  - `getPaymentMethods()`
  - optional `browsePath`, `cartPath`, `successPath`, labels.
- Keep normal Store behavior unchanged by creating a default Store adapter from `CartContext`.
- Create an eBooklet adapter backed by eBooklet endpoints/local eBooklet cart state.
- Reuse the same visual components:
  - `WizardCheckoutPage` should become configurable/reusable, or wrap a new `CheckoutWizard` shared component.
  - `CartStep`, `PaymentStep`, `OrderSummary`, `PaymentMethod`, `PrintableReceipt`, and `EmptyCartState` should be reused, with small mapping functions for eBooklet item fields.

### 4. Make eBooklet customer pages mirror Store pages
Build eBooklet equivalents that use the same layout/components but eBooklet data:
- `/e-booklets` mirrors `/market` listing behavior, but data source is eBooklet templates.
- `/e-booklets/:id` mirrors `/product/:id` detail behavior, but data source is eBooklet template/details.
- `/e-booklet-cart` mirrors `/cart` wizard step 1.
- `/e-booklet-checkout` mirrors `/checkout` wizard step 2/payment proof.
- receipt/success modal mirrors the normal Store receipt, with eBooklet wording and purchase serial/status.
- Teacher order/history page should mirror normal `/orders` pattern where applicable, but scoped to eBooklet purchases.

### 5. Backend purchase lifecycle alignment
- Keep eBooklet purchases in eBooklet tables, not normal `products` tables.
- Make eBooklet checkout accept the same proof/payment fields as normal Store checkout:
  - `payment_method_id`
  - `numberTransferredFrom`
  - `paymentScreenshot`
  - `notes`
- Use the same status semantics as normal manual payment:
  - pending/admin review after checkout.
  - approved/confirmed after admin accepts payment.
  - rejected/returned if admin rejects/returns payment.
- Do not grant teacher management access while status is pending.
- On admin confirmation, create/unlock teacher-owned eBooklet access management.

### 6. Teacher post-approval management
- After confirmation, teacher dashboard eBooklet page shows purchased/approved eBooklets.
- Teacher can:
  - generate a single student code/link.
  - bulk-generate codes by quantity.
  - copy links/codes.
  - see redeemed students.
  - view analytics.
- Pending purchases should show status only, with actions disabled and clear copy: payment/admin review pending.

### 7. Admin controls
- Admin eBooklet Purchases should mirror normal order approval behavior as much as possible.
- Admin can confirm/reject/return eBooklet payments.
- Admin can generate/control student codes for approved teacher purchases.
- Admin eBooklet Access page should show teacher → eBooklet → student rows, with devices editable inside the student row as already requested.

### 8. Student private redemption
- Keep redeem page hidden from nav and public catalog.
- If logged out, preserve return URL/token and send to login/signup.
- After auth, validate code/token and bind permanent access to the student account.
- Student dashboard `/student/e-booklets` lists permanently redeemed eBooklets.
- Viewer access should check permanent student access, not public listing visibility.

### 9. Tests / verification
- Backend unit/integration tests:
  - public store does not expose student instances/codes.
  - eBooklet checkout creates pending manual-payment purchase.
  - pending purchase does not unlock teacher management.
  - admin confirmation unlocks teacher management.
  - student redeem binds permanent access after login.
  - duplicate code redemption is blocked or handled according to current rules.
- Frontend verification:
  - `/e-booklets` shows teacher-buyable templates.
  - eBooklet cart/checkout matches normal Store wizard components visually and functionally.
  - private redeem route is not in nav and works only by direct link/code.
  - student dashboard shows redeemed eBooklets.
- Build/lint:
  - backend tests/build.
  - frontend lint/build.
  - production E2E if deploying.

## Confirmed implementation decisions
1. Old public `/e-booklets/instances/:instanceId` must redirect to the new teacher detail route.
2. EBooklet purchase history must appear in a dedicated eBooklet orders page that mirrors normal `/orders`, not inside normal Store orders.
3. EBooklet cart must support multiple eBooklets, matching the normal Store cart flow.
