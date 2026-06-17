# EBooklet Teacher Store + Private Student Access Tracker

Source spec: `docs/specs/e-booklet-teacher-store-private-student-access-spec.md`

## Status dashboard

- Current status: Build Order 8 complete and verified through backend tests/builds, frontend build, and admin browser/API/DB smoke.
- Current build order item: Build Order 9 — Teacher code/link management after approval
- Active files: `backend/tests/e-booklet/e-booklet.service.spec.ts`, `backend/src/apps/store-api/services/e-booklet.service.ts`, `frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx`, `docs/specs/e-booklet-teacher-store-private-student-access-tracker.md`, plus existing Build Order 3-8 files/source contracts.
- Last verification command/result: 2026-06-17 Build Order 8 admin E2E passed: admin login at `/login`, `/admin/e-booklet-purchases` approve/unlock on purchase `40`, row changed `Pending` → `Ready`, API returned purchase `40` as `ready` with active instance `35`, DB confirmed active teacher access `40` role `teacher`.
- Current blocker: None for Build Order 8.
- Next action: Start Build Order 9: teacher/admin code-link generation and quota enforcement after approval.

## Stop/update rule

Update this tracker after each meaningful implementation slice. Do not mark any item complete until code is implemented and the listed verification is recorded.

Legend:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete and verified
- `[!]` Blocked / needs decision

---

## Build Order 1 — Current-state inventory and route decisions

### Requirements
- [x] Confirm current frontend routes in `frontend/src/App.jsx`.
- [x] Confirm current eBooklet frontend pages/hooks behavior.
- [x] Confirm current backend eBooklet routes/controller/service behavior.
- [x] Confirm current database entities for eBooklet purchases, instances, access records, devices, and codes.
- [x] Confirm canonical new teacher detail route, recommended `/e-booklets/:templateId`.
- [x] Record any existing partial implementation that already satisfies the spec.

### Inventory notes — 2026-06-16
- Frontend routes currently expose public `/e-booklets` and legacy public `/e-booklets/instances/:instanceId`; cart/checkout are authenticated at `/e-booklet-cart` and `/e-booklet-checkout`; hidden redeem routes exist at `/e-booklet-invite/:token` and `/e-booklet-code`; teacher/student/admin eBooklet dashboards and viewer routes also exist.
- Public store/detail pages and `useEBooklets.js` are implemented around teacher-owned **instances**, not canonical template IDs: `listStoreTemplates` calls `/e-booklet-store`, detail calls `/e-booklet-store/instances/:instanceId`, cards link to `/e-booklets/instances/:instanceId`, and cart stores only one item via `replaceWithTemplate`.
- Backend public API currently has `GET /e-booklet-store`, `GET /e-booklet-store/instances/:instanceId`, and `POST /e-booklet-checkout`; controller delegates to `listPublicInstances`, `getPublicInstance`, and `createPublicCheckoutRequest`.
- Backend has extensive teacher/admin/student private-access routes already present, including invites, access-code redeem, teacher code generation, student library, admin instances/students/devices, viewer metadata/document/pages/hotspots, terms, milestones, wallet, and analytics.
- Database schema already includes `e_booklet_purchases`, `e_booklet_instances`, `e_booklet_access`, `e_booklet_devices`, `e_booklet_device_allowances`, `e_booklet_access_codes`, `e_booklet_access_code_redemptions`, invites/redemptions/student purchase links, teacher wallets/ledger, terms, milestones, and milestone achievements.
- Canonical teacher purchase detail route for this spec is confirmed as `/e-booklets/:templateId`; current legacy route `/e-booklets/instances/:instanceId` should be retained only as a resolver/redirect fallback in Build Order 3.
- Existing partial implementation satisfies some UI/API scaffolding, but it is not aligned with the new teacher-store catalog separation because public catalog/detail currently surface instance semantics and single-item cart semantics.

### Verification
- [x] Inventory notes added to this tracker or a linked implementation note.
- [x] `git status --short` checked before edits.

---

## Build Order 2 — Public teacher catalog separation

### Backend/API
- [x] Public eBooklet store API returns teacher-buyable catalog only.
- [x] Public store response excludes student access records.
- [x] Public store response excludes codes/tokens/private links.
- [x] Public detail API supports canonical teacher detail by template ID.
- [ ] Legacy instance lookup can resolve instance → template for redirect/fallback.

### Frontend/UI
- [x] `/e-booklets` renders teacher-facing eBooklet catalog.
- [x] Catalog cards link to canonical teacher detail route.
- [x] Detail page shows teacher-facing description, cover, price, preview/version metadata.
- [x] Detail page CTA adds item to eBooklet cart.
- [x] Student-private copy/links are removed from public store UI.

### Verification
- [x] Backend test: public catalog excludes access records/codes.
- [x] Frontend smoke: `/e-booklets` displays teacher catalog.
- [x] Frontend smoke: detail page displays teacher purchase view.

### Proof — 2026-06-16
- Added failing route regressions first; observed failures for instance-backed store response and missing `/api/v2/e-booklet-store/:templateId` route.
- Changed public store controller to use `listPublishedTemplates`, added `getPublishedTemplateById`, added canonical backend route, and kept `/e-booklet-store/instances/:instanceId` on a separate fallback handler.
- Updated public frontend routes/cards/details hook to use canonical `/e-booklets/:templateId` and `/e-booklet-store/:templateId`, while preserving legacy `/e-booklets/instances/:instanceId` fetch behavior.
- Verification: backend e-booklet route test PASS 23/23; backend build PASS; frontend lint PASS; frontend build PASS with existing Vite chunk-size warning.

### Proof — 2026-06-17 local browser smoke
- Local backend/frontend smoke servers were running on `127.0.0.1:5001` and `127.0.0.1:5173`.
- Browser smoke verified `/e-booklets` rendered the teacher catalog with published eBooklet cards and prices, including `Smoke E-Booklet paid smoke-1781458293495`.
- Browser smoke verified `/e-booklets/19` rendered the canonical teacher purchase detail view with title, template price, page/hotspot/version metadata, and `Add to e-booklet cart` CTA.

---

## Build Order 3 — Legacy instance route redirect

### Requirements
- [x] Update `/e-booklets/instances/:instanceId` to redirect to canonical teacher detail route.
- [x] Resolve instance ID to template ID when possible.
- [x] If resolution fails, redirect to `/e-booklets` with safe not-found/expired feedback.
- [x] Update any internal links that still point public users to old instance route.

### Verification
- [x] Test/smoke: old instance URL redirects to teacher detail when resolvable.
- [x] Test/smoke: invalid old instance URL falls back safely.

### Proof — 2026-06-16
- Added source contract `frontend/tests/e-booklet-build-order3-source-check.mjs` and watched it fail before implementation because legacy route did not redirect.
- Implemented `EBookletDetailsPage` legacy route handling: fetch old instance URL, derive `template_id`/`templateId`/`template.id`, replace-history navigate to `/e-booklets/:templateId`, and fall back to `/e-booklets` when no template can be resolved.
- Verification: source contract PASS; frontend lint PASS; frontend build PASS with existing warnings; backend route regression PASS 23/23.

---

## Build Order 4 — Multi-item eBooklet cart model

### Backend/API or client cart
- [x] Decide and document server-side vs client-side eBooklet cart implementation based on current code.
- [x] Support multiple eBooklet items in the cart.
- [x] Store `template_id`, `template_version_id`, title, cover, unit price, quantity/rules, currency.
- [x] Support remove item.
- [x] Support clear cart.
- [x] Calculate subtotal/discount/total.
- [x] Snapshot current price/version for checkout.

### Frontend/UI
- [x] Update `useEBooklets.js` cart hook/context to support multiple items.
- [x] Update add-to-cart behavior from listing/detail pages.
- [x] Update cart badge/count if applicable.

### Verification
- [x] Test: add two different eBooklets to cart.
- [x] Test: remove one eBooklet and keep the other.
- [x] Test: clear cart.

### Proof — 2026-06-16
- Added RED source contract `frontend/tests/e-booklet-build-order4-cart-source-check.mjs`; it failed on the previous single-item `replaceWithTemplate` cart behavior.
- Implemented client-side multi-item eBooklet cart in `useEBooklets.js`: `addTemplate`, de-dupe/update by `template_id`, remove, clear, count, subtotal, discount, total, and price/version snapshot fields.
- Updated listing/detail add-to-cart CTAs to append/update instead of replacing the cart.
- Updated eBooklet cart page to render `items.map(...)`, remove individual items, show count/total, and clear the cart.
- Verification: `node tests/e-booklet-build-order3-source-check.mjs && node tests/e-booklet-build-order4-cart-source-check.mjs` → PASS; frontend lint/build → PASS with existing warnings.

---

## Build Order 5 — Shared checkout component adapter

### Shared architecture
- [x] Extract/rework checkout flow so Store and eBooklet checkout can share components.
- [x] Define checkout adapter shape for normal Store and eBooklets.
- [x] Preserve normal Store checkout behavior exactly.
- [x] Add eBooklet adapter for eBooklet cart/checkout data.

### Components to reuse
- [x] `WizardStepper`
- [x] `CartStep`
- [x] `PaymentStep`
- [x] `PaymentMethod`
- [x] `OrderSummary`
- [ ] `PrintableReceipt`
- [ ] `EmptyCartState`

### Verification
- [x] Normal `/cart` and `/checkout` still work.
- [x] EBooklet `/e-booklet-cart` and `/e-booklet-checkout` use shared components.
- [x] Frontend lint/build passes.

### Proof — 2026-06-16
- Added RED source contract `frontend/tests/e-booklet-build-order5-checkout-adapter-source-check.mjs`; it failed on custom eBooklet payment select and custom summary markup.
- Reworked `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx` to adapt eBooklet cart data into shared `PaymentMethod` and `OrderSummary` components while leaving normal `WizardCheckoutPage` imports/flow unchanged.
- Adapter shape: `checkoutItems` maps eBooklet cart rows into shared checkout item fields (`id`, `name`, `image`, `price`, `discount`, `type`); `checkoutPricing` maps subtotal/discount/total; `getPaymentMethods` wraps the existing `/payment-methods` API shape.
- `PrintableReceipt` and `EmptyCartState` are intentionally left for later order/receipt slices because the current eBooklet success state is pending-review specific and Build Order 6/7 define purchase serial/orders behavior.
- Verification: `node tests/e-booklet-build-order3-source-check.mjs && node tests/e-booklet-build-order4-cart-source-check.mjs && node tests/e-booklet-build-order5-checkout-adapter-source-check.mjs` → PASS; frontend lint/build → PASS with existing warnings.

---

## Build Order 6 — EBooklet checkout and pending purchase lifecycle

### Backend/API
- [x] `POST /api/v2/e-booklet-checkout` accepts multiple items.
- [x] Accepts `payment_method_id`.
- [x] Accepts `numberTransferredFrom`.
- [x] Accepts `paymentScreenshot`.
- [x] Accepts `notes`.
- [x] Accepts terms fields.
- [x] Creates pending eBooklet purchase/order.
- [x] Snapshots item price/version at purchase time.
- [x] Does not unlock teacher management while pending.

### Frontend/UI
- [x] Checkout payment step mirrors normal Store payment step.
- [x] Receipt/success state uses eBooklet purchase serial/status.
- [x] Success CTA routes to dedicated eBooklet orders page.

### Verification
- [x] Backend test: checkout creates pending purchase with multiple items.
- [x] Backend test: pending purchase does not unlock teacher management.
- [x] Browser smoke: submit eBooklet checkout with proof.

### Proof — 2026-06-16
- Added backend regression for multi-item public eBooklet checkout; it verifies one pending purchase, per-item links, summed total, payment metadata, no auto-access unlock, and item snapshots.
- Updated public checkout service to accept `items[]` while keeping legacy single-item payload support; controller parses multipart JSON `items`; DTO accepts optional array payloads.
- Updated eBooklet checkout frontend to post all cart items as JSON in the multipart request.
- Verification: backend public-checkout service tests → PASS 4/4; backend route tests → PASS 23/23; backend build → PASS; frontend Build Order 3-5 source contracts/lint/build → PASS with existing Vite/browser/chunk warnings.

### Proof — 2026-06-17
- Added RED source contract `frontend/tests/e-booklet-build-order6-success-source-check.mjs` for checkout success serial/status and `/e-booklet-orders` CTA.
- Updated checkout success state to show eBooklet purchase serial/reference/status and link primary CTA to the dedicated eBooklet orders page.
- Verification: Build Order 6 source contract → PASS; frontend lint/build → PASS with existing warnings.

### Local browser/API smoke — 2026-06-17
- Browser smoke reached `/e-booklet-checkout` with two cart items (`Smoke E-Booklet zero smoke-1781458293495`, `Smoke E-Booklet paid smoke-1781458293495`) and rendered the shared payment/order-summary UI.
- Initial checkout submission failed because public `/api/v2/e-booklet-store` returns canonical template IDs while the cart/checkout contract sent those values as `instance_id`; direct API returned HTTP 400 `Checkout template does not match the selected e-booklet instance.`
- Added RED/GREEN regression for teacher public checkout accepting template items without delivered instances. Fix: checkout now accepts `template_id` as the source of truth, snapshots active template/version pricing, creates pending teacher eBooklet purchases using the real `e_booklet_purchases` schema, and `instance_id` is optional/legacy only.
- Frontend fix: eBooklet cart stores template items without inventing `instance_id`; checkout posts `template_id` and includes `instance_id` only for legacy instance-backed items.
- Verification: `npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts` → PASS 57/57; backend `npm run build` → PASS; frontend `npm run build` → PASS with existing Vite browser/chunk warnings.
- Local smoke proof: submitted a zero-total template checkout from `/e-booklet-checkout`; `/e-booklet-orders` rendered pending eBooklet orders `#40` and `#39` for the logged-in teacher.

---

## Build Order 7 — Dedicated eBooklet orders page

### Backend/API
- [x] Add/list eBooklet orders endpoint for buyer/teacher scope.
- [ ] Add eBooklet order detail endpoint if mirroring normal order details.
- [x] Ensure only eBooklet purchases are returned.
- [x] Include serial, date, status, review status, total, currency, item count, titles.

### Frontend/UI
- [x] Create dedicated eBooklet orders page.
- [~] Mirror normal `/orders` layout and empty state.
- [x] Add route, recommended `/e-booklet-orders` or teacher route if required by auth model.
- [ ] Add order details if normal orders have a detail surface.
- [x] Approved orders link to teacher management/access where appropriate.
- [x] Pending orders show admin-review copy and disabled/hidden management CTA.

### Verification
- [x] Test/smoke: page lists only eBooklet orders.
- [x] Test/smoke: pending order does not show active management CTA.
- [x] Test/smoke: approved order links to management.

### Proof — 2026-06-17
- Added RED backend service test for current-user eBooklet orders; implemented `listPublicOrders` scoped to `user_id` and exposed `GET /api/v2/e-booklet-orders` behind student auth.
- Added RED frontend source contract `frontend/tests/e-booklet-build-order7-orders-page-source-check.mjs`; implemented `useEBookletOrders`, `/e-booklet-orders` route, and `EBookletOrdersPage` with pending-state rows and approved open CTA.
- Added RED approved-CTA source contract `frontend/tests/e-booklet-build-order7-approved-cta-source-check.mjs`; approved eBooklet order items now route to `/teacher/e-booklets/:instanceId/invites` instead of the student library.
- Verification: backend public-checkout + public eBooklet orders service tests → PASS 5/5; backend route tests → PASS 23/23; backend build → PASS; Build Order 3-7 frontend source contracts → PASS; frontend lint/build → PASS with existing warnings.

### Detail-surface decision — 2026-06-17
- Inspected normal buyer `/orders` surface: `MyOrdersPage` renders `OrderCard`, and `OrderCard` exposes `OrderDetailsDialog` inline from the list; there is no separate buyer `/orders/:id` page. Admin orders separately use `/admin/orders/:id`.
- Decision: a dedicated eBooklet order detail endpoint/page is not required to mirror the normal buyer order detail surface. If Build Order 7 continues before Build Order 8, the parity gap is a lightweight eBooklet order details dialog/expanded card, not a new route; do not mark the detail rows complete until implemented and smoke-tested.

---

## Build Order 8 — Admin approval unlocks teacher management

### Backend/API
- [x] Admin approve/confirm route activates teacher access for each purchased eBooklet item.
- [x] Admin reject/return route keeps teacher management locked.
- [x] Activation creates/updates teacher-owned instance/access records.
- [x] Initial student quota/seat rules are applied.
- [x] Approval is idempotent and safe to retry.

### Frontend/UI
- [x] Admin eBooklet purchases page clearly shows pending/approved/rejected states.
- [x] Approval/rejection actions refresh order and access state.

### Verification
- [x] Backend test: approval unlocks teacher management.
- [x] Backend test: rejection does not unlock management.
- [x] Browser/admin smoke: approve an order and see access appear.

### Proof — 2026-06-17
- Added RED/GREEN service regressions for admin approval, rejection, and approval retry/idempotency on teacher eBooklet checkout purchases.
- Updated `updatePurchaseStatus("paid")` to fetch the eBooklet purchase, create a teacher-owned active instance when missing, create active teacher access when missing, and mark the purchase `ready`; non-approval statuses remain status-only and do not unlock management.
- Tightened admin purchase UI so approvable rows use an explicit “Approve / unlock” action, approved/rejected states remain status-badge driven, and rejected/cancelled/ready rows no longer show the approval action.
- Verification: backend `npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts` → PASS 60/60; backend `npm run build` → PASS; frontend `npm run build` → PASS.
- Admin smoke: logged in as `admin@gmail.com` at `/login`, opened `/admin/e-booklet-purchases`, approved purchase `40`, saw row change `Pending` → `Ready`, saw approve action disappear, API confirmed active instance `35`, and DB confirmed active teacher access `40` role `teacher`.

---

## Build Order 9 — Teacher code/link management after approval

### Backend/API
- [ ] Teacher can generate one code/link for an approved eBooklet.
- [ ] Teacher can bulk-generate N codes/links for an approved eBooklet.
- [ ] Admin can generate/control codes for approved teacher purchases.
- [ ] Code status supports unused/redeemed/expired/revoked as applicable.
- [ ] Quota/seat limits enforced.
- [ ] Pending purchases cannot generate codes.

### Frontend/UI
- [ ] Teacher dashboard lists approved eBooklets.
- [ ] Teacher can generate single code/link.
- [ ] Teacher can bulk-generate codes by quantity.
- [ ] Teacher can copy codes/links.
- [ ] Teacher can view code redemption status.
- [ ] Pending purchases show status in orders only or disabled management state.

### Verification
- [ ] Backend test: single code generation after approval.
- [ ] Backend test: bulk code generation after approval.
- [ ] Backend test: code generation blocked before approval.
- [ ] Browser smoke: generate/copy code from teacher dashboard.

---

## Build Order 10 — Private student redemption and dashboard access

### Backend/API
- [ ] Token/code validation requires authentication before binding access.
- [ ] Logged-out redemption preserves return URL/token/code.
- [ ] Valid code/link creates permanent student access record.
- [ ] Duplicate/expired/invalid code handling matches business rules.
- [ ] Viewer access checks student access record.

### Frontend/UI
- [ ] Redemption routes remain hidden from public nav/store.
- [ ] Logged-out users are routed to login/signup then returned.
- [ ] Redemption success CTA routes to `/student/e-booklets`.
- [ ] Student dashboard lists redeemed eBooklets.
- [ ] Viewer opens only for owned access.

### Verification
- [ ] Test: logged-out redemption returns after login.
- [ ] Test: valid code binds access.
- [ ] Test: invalid/used/expired code is blocked.
- [ ] Browser smoke: student sees redeemed eBooklet in dashboard.

---

## Build Order 11 — Admin access page nested students and analytics

### Backend/API
- [ ] Admin instances/access endpoint provides teacher → eBooklet grouping data.
- [ ] Student list uses actual access records only.
- [ ] Include student identity fields.
- [ ] Include access status/source/granted date.
- [ ] Include purchase/order reference when available.
- [ ] Include analytics summary per student.
- [ ] Include device summary per student.
- [ ] Avoid requiring frontend N+1 calls for row summaries.

### Frontend/UI
- [ ] `/admin/e-booklet-instances` keeps teacher groups.
- [ ] Each teacher group keeps eBooklet rows.
- [ ] Each eBooklet row renders nested student rows.
- [ ] Each student row shows analytics summary.
- [ ] Each student row shows device summary.
- [ ] Empty states exist for eBooklets with no students.

### Verification
- [ ] Backend test: endpoint returns nested access records with summaries.
- [ ] Frontend smoke: teacher → eBooklet → student rows render.
- [ ] Confirm “students who bought” excludes anonymous opens and pending proofs.

---

## Build Order 12 — Embedded admin device management in student rows

### Shared component
- [ ] Extract reusable admin student device panel from current devices page logic.
- [ ] Use component inside nested student row.
- [ ] Use same component or shared hook in existing devices page.
- [ ] Preserve `/admin/e-booklet-instances/:instanceId/devices` fallback route.

### Device controls
- [ ] Lazy-load full device list when a student row expands.
- [ ] Show device label/status/last seen/bound date.
- [ ] Allow setting allowed device count.
- [ ] Allow adding allowance.
- [ ] Allow resetting devices.
- [ ] Require reason field where existing API requires it.
- [ ] Refresh summary after actions.
- [ ] Do not expose raw IP/user-agent in collapsed row.

### Verification
- [ ] Test/smoke: expand student row and load devices.
- [ ] Test/smoke: add allowance works.
- [ ] Test/smoke: reset devices works.
- [ ] Test/smoke: existing devices detail route still works.

---

## Build Order 13 — Translations, copy, and navigation

### Requirements
- [ ] Add/update English eBooklet keys.
- [ ] Add/update Arabic eBooklet keys.
- [ ] Ensure Arabic layout remains RTL and readable.
- [ ] Add dedicated eBooklet orders navigation/CTA where appropriate.
- [ ] Do not expose private redemption links in public navigation.
- [ ] Update empty-state and pending/approved/rejected copy.

### Verification
- [ ] Browser smoke in English.
- [ ] Browser smoke in Arabic/RTL.
- [ ] Public nav does not expose private student redemption.

---

## Build Order 14 — Automated verification

### Backend
- [ ] Run backend unit/integration tests for eBooklets.
- [ ] Run backend build/typecheck.
- [ ] Record commands and results here.

### Frontend
- [ ] Run frontend lint.
- [ ] Run frontend build.
- [ ] Run available frontend tests.
- [ ] Record commands and results here.

### Commands/results log
- [ ] Backend test command: — / Result: —
- [ ] Backend build command: — / Result: —
- [ ] Frontend lint command: — / Result: —
- [ ] Frontend build command: — / Result: —

---

## Build Order 15 — Manual E2E verification

### Public teacher flow
- [ ] Open `/e-booklets`.
- [ ] Open teacher detail route.
- [ ] Confirm old instance route redirects.
- [ ] Add multiple eBooklets to cart.
- [ ] Checkout with payment proof.
- [ ] Confirm pending order appears in dedicated eBooklet orders.

### Admin approval flow
- [ ] Admin sees pending eBooklet purchase.
- [ ] Admin approves payment.
- [ ] Teacher management unlocks.
- [ ] Pending/rejected path checked if feasible.

### Teacher code flow
- [ ] Teacher generates one code.
- [ ] Teacher bulk-generates codes.
- [ ] Teacher sees status/used quota.

### Student redemption flow
- [ ] Logged-out student opens private link/code.
- [ ] Student logs in/signs up and returns.
- [ ] Student redeems code.
- [ ] Student sees eBooklet in `/student/e-booklets`.
- [ ] Student opens viewer.

### Admin access/device flow
- [ ] Admin access page shows teacher → eBooklet → student rows.
- [ ] Student analytics summary is visible.
- [ ] Device panel opens inside student row.
- [ ] Device allowance/reset functions work.
- [ ] Existing devices route still works.

---

## Build Order 16 — Review, cleanup, and production readiness

### Review
- [ ] Review spec compliance against `e-booklet-teacher-store-private-student-access-spec.md`.
- [ ] Review for duplicated checkout UI; ensure shared components are reused.
- [ ] Review privacy boundaries for analytics/device data.
- [ ] Review auth/role boundaries.
- [ ] Review database migrations and generated client state.

### Repo hygiene
- [ ] Remove dead code/stale old routes if no longer needed.
- [ ] Keep legacy redirects/fallback routes where required.
- [ ] `git status --short` clean except intended changes.
- [ ] Commit or prepare PR.

### Production readiness if deploying
- [ ] Apply migrations to target DB.
- [ ] Deploy backend/frontend.
- [ ] Run production health checks.
- [ ] Run production E2E with real auth/admin approval path.

---

## Requirement traceability matrix

| Requirement | Tracker items |
| --- | --- |
| Public `/e-booklets` is teacher store only | 2 |
| Old instance route redirects | 3 |
| EBooklet cart supports multiple items | 4 |
| Checkout mirrors normal Store components | 5, 6 |
| Dedicated eBooklet orders page | 7 |
| Pending payment does not unlock teacher management | 6, 8 |
| Admin approval unlocks teacher management | 8 |
| Teacher single/bulk code generation | 9 |
| Student redemption private direct link/code only | 10, 13 |
| Student dashboard permanent access | 10 |
| Admin page teacher → eBooklet → student rows | 11 |
| Analytics beside each student | 11 |
| Devices inside each student row | 12 |
| Existing devices/detail routes preserved | 12 |
| EN/AR copy and RTL | 13 |
| Full verification | 14, 15, 16 |
