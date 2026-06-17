# EBooklet Teacher Store + Private Student Access Tracker

Source spec: `docs/specs/e-booklet-teacher-store-private-student-access-spec.md`

## Status dashboard

- Current status: Build Order 15 manual E2E complete and verified locally across teacher checkout with payment proof, admin approval, teacher code management, student redemption/viewer access, and admin device/analytics controls.
- Current build order item: Build Order 16 — Review, cleanup, and production readiness
- Active files: `docs/specs/e-booklet-teacher-store-private-student-access-tracker.md`, plus prior Build Order implementation/test files listed in git status.
- Last verification command/result: 2026-06-17 Build Order 15 local browser/API smoke on `127.0.0.1:5001` + `127.0.0.1:5173`: paid checkout returned purchase `41` pending, admin `mark-paid` returned ready, teacher access returned instance `36`, teacher code generation returned HTTP 201 for single/bulk codes, student redemption redirected to `/student/e-booklets/36`, unauth document fetch returned HTTP 401, and admin device allowance/reset returned HTTP 200.
- Current blocker: None for Build Order 15. Build Order 16 source/spec review remains pending.
- Next action: Start Build Order 16: spec compliance, cleanup, privacy/auth review, DB/generated-client review, repo hygiene, and PR/commit prep.

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
- [x] Teacher can generate one code/link for an approved eBooklet.
- [x] Teacher can bulk-generate N codes/links for an approved eBooklet.
- [x] Admin can generate/control codes for approved teacher purchases.
- [x] Code status supports unused/redeemed/expired/revoked as applicable.
- [x] Quota/seat limits enforced.
- [x] Pending purchases cannot generate codes.

### Frontend/UI
- [x] Teacher dashboard lists approved eBooklets.
- [x] Teacher can generate single code/link.
- [x] Teacher can bulk-generate codes by quantity.
- [x] Teacher can copy codes/links.
- [x] Teacher can view code redemption status.
- [x] Pending purchases show status in orders only or disabled management state.

### Verification
- [x] Backend test: single code generation after approval.
- [x] Backend test: bulk code generation after approval.
- [x] Backend test: code generation blocked before approval.
- [x] Browser smoke: generate/copy code from teacher dashboard.

### Proof — 2026-06-17 local API/browser smoke
- API smoke: local teacher token for user `8` generated free code(s), bulk quantity payload generated the requested count after backend accepted `count`/`quantity`, paid quota enforcement returned HTTP 400 when exhausted, and admin scoped access-code listing returned active records for the same teacher/instance.
- Browser smoke: opened `/teacher/e-booklets/5/invites`, generated a free shared code after terms acceptance, saw `KLM-...` code + WhatsApp message + `Saved hint` status entry, and clicked `Copy code` without browser console errors.

---

## Build Order 10 — Private student redemption and dashboard access

### Backend/API
- [x] Token/code validation requires authentication before binding access.
- [x] Logged-out redemption preserves return URL/token/code.
- [x] Valid code/link creates permanent student access record.
- [x] Duplicate/expired/invalid code handling matches business rules.
- [x] Viewer access checks student access record.

### Frontend/UI
- [x] Redemption routes remain hidden from public nav/store.
- [x] Logged-out users are routed to login/signup then returned.
- [x] Redemption success CTA routes to `/student/e-booklets`.
- [x] Student dashboard lists redeemed eBooklets.
- [x] Viewer opens only for owned access.

### Verification
- [x] Test: logged-out redemption returns after login.
- [x] Test: valid code binds access.
- [x] Test: invalid/used/expired code is blocked.
- [x] Browser smoke: student sees redeemed eBooklet in dashboard.

Verification notes:
- 2026-06-17: Existing backend tests cover authenticated redemption route, invalid/used code rejection, paid/free redemption service behavior, and viewer access ownership/expiry checks.
- 2026-06-17 live API smoke generated a teacher free access code for instance `5`, redeemed it as student `55`, confirmed `/student/e-booklets` listed the access, and confirmed `/e-booklet-viewer/5/metadata` returned 200.
- 2026-06-17 browser smoke on `127.0.0.1:5173/student/e-booklets` confirmed the redeemed eBooklet appears in the student dashboard and `Open` loads `/student/e-booklets/5` viewer content.

---

## Build Order 11 — Admin access page nested students and analytics

### Backend/API
- [x] Admin instances/access endpoint provides teacher → eBooklet grouping data.
- [x] Student list uses actual access records only.
- [x] Include student identity fields.
- [x] Include access status/source/granted date.
- [x] Include purchase/order reference when available.
- [x] Include analytics summary per student.
- [x] Include device summary per student.
- [x] Avoid requiring frontend N+1 calls for row summaries.

### Frontend/UI
- [x] `/admin/e-booklet-instances` keeps teacher groups.
- [x] Each teacher group keeps eBooklet rows.
- [x] Each eBooklet row renders nested student rows.
- [x] Each student row shows analytics summary.
- [x] Each student row shows device summary.
- [x] Empty states exist for eBooklets with no students.

### Verification
- [x] Backend test: endpoint returns nested access records with summaries.
- [x] Frontend smoke: teacher → eBooklet → student rows render.
- [x] Confirm “students who bought” excludes anonymous opens and pending proofs.

### Proof — 2026-06-17 local API/browser smoke
- Backend/API: `listInstances` now attaches `students` from active `e_booklet_access` rows only, with identity, status/source/granted date, analytics summary, device summary, and invite/access-code purchase references. Targeted backend eBooklet tests passed 123/123 and backend build passed.
- Live API smoke: `/api/v2/admin/e-booklet-instances?status=active&limit=5` returned HTTP 200 with nested `students`; first non-empty instance had device, analytics, and purchase-reference fields.
- Frontend/browser: `/admin/e-booklet-instances` rendered teacher groups, eBooklet rows, nested `Students with access` cards, empty states, and per-student Devices/Viewer opens/Source values.

---

## Build Order 12 — Embedded admin device management in student rows

### Shared component
- [x] Extract reusable admin student device panel from current devices page logic.
- [x] Use component inside nested student row.
- [x] Use same component or shared hook in existing devices page.
- [x] Preserve `/admin/e-booklet-instances/:instanceId/devices` fallback route.

### Device controls
- [x] Lazy-load full device list when a student row expands.
- [x] Show device label/status/last seen/bound date.
- [x] Allow setting allowed device count.
- [x] Allow adding allowance.
- [x] Allow resetting devices.
- [x] Require reason field where existing API requires it.
- [x] Refresh summary after actions.
- [x] Do not expose raw IP/user-agent in collapsed row.

### Verification
- [x] Test/smoke: expand student row and load devices.
- [x] Test/smoke: add allowance works.
- [x] Test/smoke: reset devices works.
- [x] Test/smoke: existing devices detail route still works.

### Proof — 2026-06-17 local source/build/browser smoke
- Added `AdminEBookletStudentDevicePanel.jsx` and reused it in both nested admin access student rows and `/admin/e-booklet-instances/:instanceId/devices`.
- Embedded panels lazy-load on expand, show label/status/last-seen/bound-date only, gate allowance/reset buttons behind a reason, and call the existing summary refresh after successful actions.
- Source contract `node tests/e-booklet-build-order12-device-panel-source-check.mjs` verified shared reuse, lazy expansion, action wiring, and no raw `ip_address`/`user_agent` exposure in the panel/page.
- Frontend build: `npm run build` passed.
- Browser smoke: expanded student device panel on `/admin/e-booklet-instances`, saw device rows, typed a reason, reset devices for instance `21` user `65`, and saw summary refresh from `Devices: 2/2` to `Devices: 0/2`; full devices route `/admin/e-booklet-instances/21/devices?userId=65` rendered the shared panel.

---

## Build Order 13 — Translations, copy, and navigation

### Requirements
- [x] Add/update English eBooklet keys.
- [x] Add/update Arabic eBooklet keys.
- [x] Ensure Arabic layout remains RTL and readable.
- [x] Add dedicated eBooklet orders navigation/CTA where appropriate.
- [x] Do not expose private redemption links in public navigation.
- [x] Update empty-state and pending/approved/rejected copy.

### Verification
- [x] Browser smoke in English.
- [x] Browser smoke in Arabic/RTL.
- [x] Public nav does not expose private student redemption.

### Proof — 2026-06-17
- Added EN/AR `eBooklets.orders` keys for empty state, loading, order count, order item status, management CTA, pending/approved/confirmed/ready/rejected/cancelled/unknown labels, and status-specific guidance copy.
- Added dedicated eBooklet orders navigation/CTA in the public navbar/command palette for authenticated non-admin users, teacher sidebar, student sidebar, and the orders page header.
- Kept public redemption routes private/hidden from navigation; source contract verifies no public navbar links to `/e-booklet-invite` or `/e-booklet-code`.
- Verification: `node tests/e-booklet-build-order13-copy-navigation-source-check.mjs && npm run build` passed.
- Browser smoke: `/e-booklets` rendered in English; after toggling language, Arabic rendered with `document.documentElement.dir === "rtl"`; DOM check found no public private-redemption navigation links.

---

## Build Order 14 — Automated verification

### Backend
- [x] Run backend unit/integration tests for eBooklets.
- [x] Run backend build/typecheck.
- [x] Record commands and results here.

### Frontend
- [x] Run frontend lint.
- [x] Run frontend build.
- [x] Run available frontend tests.
- [x] Record commands and results here.

### Commands/results log
- [x] Backend test command: `npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts` / Result: PASS, 3 suites, 123 tests.
- [x] Backend build command: `npm run build` / Result: PASS.
- [x] Frontend test command: `set -e; for f in tests/e-booklet-*.mjs; do node "$f"; done` / Result: PASS for all eBooklet source contracts.
- [x] Frontend lint command: `npm run lint` / Result: PASS.
- [x] Frontend build command: `npm run build` / Result: PASS with existing Vite large-chunk/browser-crypto warnings.

---

## Build Order 15 — Manual E2E verification

### Public teacher flow
- [x] Open `/e-booklets`.
- [x] Open teacher detail route.
- [x] Confirm old instance route redirects.
- [x] Add multiple eBooklets to cart.
- [x] Checkout with payment proof.
- [x] Confirm pending order appears in dedicated eBooklet orders.

### Admin approval flow
- [x] Admin sees pending eBooklet purchase.
- [x] Admin approves payment.
- [x] Teacher management unlocks.
- [x] Pending path checked; no eBooklet purchase reject endpoint found in current routes.

### Teacher code flow
- [x] Teacher generates one code.
- [x] Teacher bulk-generates codes.
- [x] Teacher sees status/used quota.

### Student redemption flow
- [x] Logged-out student opens private link/code.
- [x] Student logs in/signs up and returns.
- [x] Student redeems code.
- [x] Student sees eBooklet in student dashboard/viewer.
- [x] Student cannot see direct file unless authorized.

### Admin access/device flow
- [x] Admin access page shows teacher → eBooklet → student rows.
- [x] Student analytics summary is visible.
- [x] Device panel opens inside student row.
- [x] Device allowance/reset functions work.
- [x] Existing devices route still works.

### Proof — 2026-06-17 local browser/API smoke
- Replaced the earlier BO15 auth blocker with local non-admin browser auth using the running API/frontend (`127.0.0.1:5001` + `127.0.0.1:5173`).
- Browser-origin checkout posted paid template `24` with multipart `paymentScreenshot`; API returned HTTP 201 purchase `41`, status `pending`, total `150 EGP`, and `/api/v2/e-booklet-orders` listed purchase `41` for the same non-admin user.
- Admin API/page smoke confirmed purchase `41` appeared pending in `/admin/e-booklet-purchases`; admin approval via `POST /api/v2/admin/e-booklet-purchases/41/mark-paid` returned HTTP 200 and status `ready`.
- Teacher management unlock verified by `/api/v2/teacher/e-booklets` returning active teacher access `42` for instance `36`, then `/teacher/e-booklets` rendered `Teacher e-booklet #41` with `Open` and `Manage access codes` actions.
- Teacher code flow verified after setting local invite quota to `5` and creating template-specific code terms for template `24`: single paid code returned HTTP 201 (`KLM-...`), bulk generation returned HTTP 201 with `2` codes, `/api/v2/teacher/e-booklets/36/access-codes` listed `3` active paid codes, and `/teacher/e-booklets/36/invites` rendered saved hints/status plus quota/wallet/student counters.
- Student redemption verified with a browser-visible logged-out `/e-booklet-code` state requiring login/register, then local student auth returned to the same route; redeeming a free access code redirected to `/student/e-booklets/36`, rendering the protected viewer for `Teacher e-booklet #41` with pages/hotspots. Unauthenticated direct document fetch `/api/v2/e-booklet-viewer/36/document` returned HTTP 401 `Authorization header required`, while authorized metadata fetch returned HTTP 200.
- Admin access/device flow verified in `/admin/e-booklet-instances`: the page showed teacher/user row `Student smoke-1781458242927`, `Teacher e-booklet #41`, device count `1/1`, viewer opens `2`, source `access_code`; `/admin/e-booklet-instances/36/devices?userId=55` rendered the dedicated devices route with the bound `MacIntel` device; API allowance update returned HTTP 200 with `allowed_devices: 2`; reset returned HTTP 200 with `count: 1`; post-reset device list returned HTTP 200 with `0` devices.

---

## Build Order 16 — Review, cleanup, and production readiness

### Review
- [x] Review spec compliance against `e-booklet-teacher-store-private-student-access-spec.md`.
- [x] Review for duplicated checkout UI; ensure shared components are reused.
- [x] Review privacy boundaries for analytics/device data.
- [x] Review auth/role boundaries.
- [x] Review database migrations and generated client state.

### Repo hygiene
- [x] Remove dead code/stale old routes if no longer needed.
- [x] Keep legacy redirects/fallback routes where required.
- [x] `git status --short` clean except intended changes.
- [ ] Commit or prepare PR. — pending explicit approval.

### Proof — 2026-06-17 local BO16 review
- Spec compliance, checkout reuse, auth/role boundaries, privacy/device exposure, migrations/generated-client state, and stale route/legacy fallback preservation reviewed against the current diff.
- BO16 cleanup applied: admin device list now selects only safe device fields (`id`, instance/user ids, label, status, first/last seen, created date) and excludes raw fingerprints, user agents, and IP addresses; backend also requires and trims a reason for device reset/allowance mutations.
- Generated Prisma client state checked with `git status --short -- backend/src/apps/store-api/generated backend/generated backend/prisma prisma`: no generated-client drift reported; migrations/schema files are tracked under `backend/src/apps/store-api/prisma`.
- Repo hygiene checked with `git status --short`: remaining dirty files are the intended eBooklet feature/tracker changes plus intended new frontend device-panel/source-check files; no commit/PR created yet.
- Verification passed: `npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts` → 2 suites / 84 tests passed.
- Verification passed: frontend source contracts `e-booklet-build-order12-device-panel-source-check.mjs`, `e-booklet-build-order13-copy-navigation-source-check.mjs`, `e-booklet-build-order7-approved-cta-source-check.mjs`.
- Verification passed: `npm run build` in `frontend` and `backend`; frontend emitted only existing large-chunk/externalized-crypto warnings.

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
