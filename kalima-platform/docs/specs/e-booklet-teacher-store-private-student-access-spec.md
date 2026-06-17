# EBooklet Teacher Store, Orders, Private Student Access, and Admin Access Spec

## 1. Purpose

Kalima eBooklets need a clean split between:

1. **Teacher-facing public purchasing**: teachers browse and buy eBooklets from `/e-booklets` using the same purchasing flow as the normal Store.
2. **Teacher post-approval management**: teachers only manage student access/codes after admin payment approval.
3. **Private student redemption**: students only access eBooklets through private direct link/code redemption, never from the public `/e-booklets` store.
4. **Admin access management**: admins can view teacher-owned eBooklets, students who actually gained access, analytics, and manage devices directly inside each student row.

This spec supersedes any older behavior where public eBooklet listing/detail pages behave like a student access listing.

---

## 2. Product decisions already confirmed

- `/e-booklets` is public and teacher-facing.
- Student redemption is private direct-link/code only.
- Old public `/e-booklets/instances/:instanceId` must redirect to the new teacher detail route.
- EBooklet purchases must appear in a dedicated eBooklet orders page that mirrors normal `/orders`.
- EBooklet cart must support multiple eBooklets, matching the normal Store cart behavior.
- EBooklets keep separate backend data and pages, but the customer purchase flow must reuse the normal Store checkout/page components as much as possible.
- Teacher access/code management unlocks only after admin confirms manual payment.
- Admin eBooklet Access page must show teacher → eBooklet → student rows, with device controls embedded in each student row.

---

## 3. Actors and permissions

### 3.1 Visitor

Can:
- Open `/e-booklets`.
- View public teacher-facing eBooklet listing.
- View public teacher-facing eBooklet details.

Cannot:
- Redeem student access without logging in.
- See student access links/codes.
- See private student eBooklet instances.

### 3.2 Teacher

Can:
- Browse `/e-booklets`.
- Add multiple eBooklets to eBooklet cart.
- Checkout through the eBooklet checkout flow.
- Upload manual payment proof.
- View dedicated eBooklet orders page.
- After admin approval, manage purchased eBooklet access and generate student codes/links.

Cannot:
- Generate student access before admin approval.
- Access student device controls unless explicitly provided by teacher-side management rules.

### 3.3 Student

Can:
- Open private direct link/code redemption route.
- Login/signup when required.
- Redeem a valid code/link.
- Permanently see redeemed eBooklets in student dashboard.
- Open owned eBooklet viewer if access is valid.

Cannot:
- Browse teacher purchase catalog as if it were a student library.
- See private eBooklets from public `/e-booklets` without a code/link.

### 3.4 Admin/SubAdmin

Can:
- Approve/reject/return eBooklet purchase payments.
- View dedicated eBooklet purchases/orders.
- View teacher-owned eBooklet access.
- View students who actually bought/redeemed/accessed each eBooklet.
- View analytics summaries.
- Edit/manage devices directly inside student rows.
- Use the existing device detail route as a fallback/deep link.

---

## 4. Route specification

### 4.1 Public teacher store routes

#### `GET /e-booklets`

Purpose:
- Public teacher-facing eBooklet catalog.

Behavior:
- Shows eBooklet templates/products available for teacher purchase.
- Does not list student-owned eBooklet access records.
- Does not list generated student access codes.
- Does not expose private redemption links.

Expected page behavior:
- Mirrors normal Store listing patterns where possible.
- Each card links to the new teacher detail route.
- CTA adds the eBooklet to the eBooklet cart.

#### `GET /e-booklets/:templateId` or `/e-booklets/templates/:templateId`

Purpose:
- Public teacher-facing eBooklet detail page.

Behavior:
- Shows eBooklet title, cover, description, price, version/preview metadata, and purchase CTA.
- CTA adds to eBooklet cart.
- Must not expose student redemption records.

Implementation decision needed at coding time:
- Pick one canonical teacher detail route and update all links.
- Recommended canonical route: `/e-booklets/:templateId`.

#### `GET /e-booklets/instances/:instanceId`

Purpose:
- Legacy/backward-compatible route.

Behavior:
- Redirects to the new canonical teacher detail route.
- Redirect must be safe even if only `instanceId` is available:
  - backend/frontend should resolve instance → template if possible.
  - if resolution fails, redirect to `/e-booklets` with a visible not-found/expired message.

Acceptance:
- Directly opening an old instance URL does not render the old student-style detail page.
- It lands on the teacher detail page or safe catalog fallback.

---

### 4.2 EBooklet cart and checkout routes

#### `GET /e-booklet-cart`

Purpose:
- EBooklet cart page, separate from normal Store cart.

Behavior:
- Supports multiple eBooklet items.
- Mirrors normal cart step UI.
- Reuses normal Store components/adapted shared components.
- Shows item title, cover, price, quantity/rules if applicable, subtotal, discounts if supported, and total.

Important:
- It must not use normal products table as source of truth.
- It should use an eBooklet cart adapter over eBooklet data.

#### `GET /e-booklet-checkout`

Purpose:
- EBooklet checkout/payment proof flow.

Behavior:
- Mirrors normal Store checkout wizard/payment step.
- Supports multiple eBooklets from eBooklet cart.
- Uses same manual payment fields as normal Store:
  - `payment_method_id`
  - `numberTransferredFrom`
  - `paymentScreenshot`
  - `notes`
- Creates pending eBooklet purchase/order.
- Shows receipt/success state with eBooklet purchase serial/status.

Acceptance:
- User experience is visually and functionally equivalent to normal Store checkout, except wording/data source is eBooklet-specific.

---

### 4.3 Dedicated eBooklet orders routes

#### `GET /e-booklet-orders` or `/teacher/e-booklet-orders`

Purpose:
- Dedicated eBooklet purchase history page.

Behavior:
- Mirrors normal `/orders` page.
- Lists only eBooklet purchases/orders.
- Shows purchase serial, date, total, payment status, admin review status, and purchased eBooklets.
- Links to order details if normal Store orders have detail pages.

Recommended route:
- Use `/e-booklet-orders` for buyer-facing access if teachers can buy through public flow.
- If only teachers can purchase eBooklets, `/teacher/e-booklet-orders` is acceptable, but public checkout success CTA must route correctly.

Statuses:
- Pending/admin review.
- Approved/confirmed.
- Rejected/returned.
- Delivered/access enabled if separate from approved.

Acceptance:
- EBooklet purchases do not appear inside normal `/orders` unless explicitly added later.
- The page mirrors normal order layout and behavior.

---

### 4.4 Private student redemption routes

Existing routes:
- `/e-booklet-invite/:token`
- `/e-booklet-code`

Behavior:
- These routes remain hidden from navigation and public catalog.
- If the student is logged out:
  - preserve intended redemption URL/token/code.
  - redirect to login/signup.
  - after auth, return to redemption completion.
- If logged in:
  - validate token/code.
  - bind permanent student access to that logged-in user.
  - prevent invalid/expired/overused code redemption.
  - show success and CTA to student eBooklets dashboard.

Student dashboard:
- `/student/e-booklets` lists permanent redeemed/owned eBooklet access.

Acceptance:
- A student cannot discover private eBooklets from `/e-booklets`.
- A valid direct link/code grants access after login.
- Redeemed access persists in student dashboard.

---

### 4.5 Admin routes

Existing relevant routes:
- `/admin/e-booklet-purchases`
- `/admin/e-booklet-instances`
- `/admin/e-booklet-instances/:instanceId/students`
- `/admin/e-booklet-instances/:instanceId/devices`
- `/admin/e-booklet-analytics`

Required behavior:
- Preserve old detail routes for fallback/deep links.
- Improve `/admin/e-booklet-instances` so it supports the requested nested access model.

---

## 5. Backend/API specification

### 5.1 Public teacher catalog API

Existing candidates:
- `GET /api/v2/e-booklet-store`
- `GET /api/v2/e-booklet-store/instances/:instanceId`

Required changes:
- Public store endpoint returns teacher-buyable eBooklet catalog items.
- It must not return student access records or private codes.
- Detail endpoint should be canonical by template ID if possible.
- Legacy instance detail should resolve to template detail data or provide redirect metadata.

Response fields for listing:
```json
{
  "items": [
    {
      "id": 123,
      "template_id": 123,
      "title": "EBooklet title",
      "description": "Short teacher-facing description",
      "cover_image_url": "/uploads/...",
      "price": 500,
      "currency": "EGP",
      "status": "published",
      "active_version_id": 456,
      "preview_available": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 5.2 EBooklet cart API

Requirement:
- Must support multiple eBooklet items.

Possible implementation options:

Option A — server-side eBooklet cart:
- `GET /api/v2/e-booklet-cart`
- `POST /api/v2/e-booklet-cart/items`
- `DELETE /api/v2/e-booklet-cart/items/:itemId`
- `POST /api/v2/e-booklet-cart/clear`

Option B — client-side eBooklet cart persisted in local/session storage:
- Current eBooklet cart hook can be expanded to multiple items.
- Checkout sends all selected eBooklet items.

Preferred:
- Server-side cart if authenticated teacher checkout requires robust multi-device persistence.
- Client-side cart is acceptable if normal Store cart parity does not require server persistence.

Cart item fields:
```json
{
  "id": "template:123",
  "template_id": 123,
  "template_version_id": 456,
  "title": "EBooklet title",
  "cover_image_url": "/uploads/...",
  "unit_price": 500,
  "quantity": 1,
  "line_total": 500,
  "currency": "EGP"
}
```

### 5.3 EBooklet checkout API

Existing:
- `POST /api/v2/e-booklet-checkout`

Required behavior:
- Accept multiple eBooklet items.
- Accept same manual payment proof fields as normal Store checkout.
- Create an eBooklet purchase/order with status pending/admin review.
- Snapshot prices at purchase time.
- Do not grant teacher code/access management until admin approval.

Request fields:
```ts
items: Array<{
  template_id: number;
  template_version_id: number;
  quantity?: number;
}>;
payment_method_id?: number;
numberTransferredFrom?: string;
paymentScreenshot?: File;
notes?: string;
terms_accepted: boolean;
terms_version: string;
```

Response fields:
```json
{
  "purchase": {
    "id": 9001,
    "purchase_serial": "EBK-2026-0001",
    "status": "pending",
    "subtotal": 1000,
    "discount": 0,
    "total": 1000,
    "currency": "EGP",
    "items": []
  },
  "next_url": "/e-booklet-orders/9001"
}
```

### 5.4 Admin purchase approval API

Existing admin eBooklet purchase/status/deliver routes should support:
- Approve payment.
- Reject/return payment.
- Mark paid if separate.
- Deliver/unlock teacher access if separate.

Required approval behavior:
- On approved/confirmed payment:
  - create or activate teacher-owned eBooklet access/instance records for each purchased item.
  - set initial student seat/code quota according to purchase/item rules.
  - enable teacher code/link management.
- On rejected/returned payment:
  - do not create/activate teacher management access.
  - keep order visible in dedicated eBooklet orders page.

### 5.5 Teacher code generation API

Teacher after approval can:
- Generate one student code/link.
- Bulk-generate N codes/links.
- View generated/redeemed code status.

Admin can also:
- Generate/control codes for approved teacher eBooklet purchases.

Required fields:
```json
{
  "code": "ABC123",
  "token": "secure-token",
  "redeem_url": "https://kalima-edu.com/e-booklet-invite/secure-token",
  "status": "unused|redeemed|expired|revoked",
  "created_at": "...",
  "redeemed_at": null,
  "redeemed_by_user_id": null
}
```

### 5.6 Student access/redemption API

Required behavior:
- Validate code/token.
- Require login/signup before binding access.
- Bind permanent access to authenticated student.
- Block duplicate redemption where code is single-use.
- Respect free shared code vs paid seat rules already defined in product memory.

Access record fields:
```json
{
  "id": 1,
  "instance_id": 10,
  "template_id": 123,
  "student_user_id": 55,
  "status": "active",
  "access_source": "code|invite|admin|purchase",
  "granted_at": "...",
  "expires_at": null
}
```

---

## 6. Frontend component architecture

### 6.1 Shared checkout adapter

Normal Store checkout currently uses components wired to `CartContext`.

Required refactor:
- Extract a shared checkout shell/wizard that can receive a cart adapter.
- Normal Store keeps current behavior through a normal Store adapter.
- EBooklet checkout uses an eBooklet adapter.

Adapter shape:
```ts
type CheckoutAdapter = {
  cart: {
    cart_items: Array<any>;
    subtotal: number;
    discount: number;
    total: number;
    currency?: string;
  };
  loading: boolean;
  error?: unknown;
  loadCart: () => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (formData: FormData) => Promise<any>;
  getPaymentMethods: () => Promise<any[]>;
  mapItemsForSummary: (cart: any) => Array<{
    id: string | number;
    name: string;
    type: string;
    price: number;
    discount: number;
    quantity: number;
    image: string;
  }>;
  labels?: {
    emptyBrowsePath: string;
    ordersPath: string;
    cartPath: string;
  };
};
```

### 6.2 Components to reuse

Must reuse/adapt:
- `WizardStepper`
- `CartStep`
- `PaymentStep`
- `PaymentMethod`
- `OrderSummary`
- `PrintableReceipt`
- `EmptyCartState`

Allowed changes:
- Add props for adapter/data mapping.
- Add label overrides for eBooklet wording.
- Add route overrides for success/back/browse CTAs.

Not allowed:
- Copy-pasting a second full checkout UI for eBooklets.
- Diverging visual behavior from normal Store checkout.

### 6.3 EBooklet cart UI

Requirements:
- Multiple items.
- Remove item.
- Clear cart.
- Proceed to payment.
- Same layout as normal Store cart.
- Empty state browse CTA routes to `/e-booklets`.

### 6.4 EBooklet payment UI

Requirements:
- Same payment method selector behavior.
- Same proof upload behavior.
- Same transfer number validation behavior.
- Same notes behavior.
- Same receipt/success modal behavior, but with eBooklet labels and eBooklet purchase data.

---

## 7. Dedicated eBooklet orders page spec

Page should mirror normal orders page.

Required sections:
- Header: `EBooklet Orders` / Arabic equivalent.
- Empty state: no eBooklet purchases yet, CTA to `/e-booklets`.
- Order list/table/cards:
  - purchase serial.
  - created date.
  - status.
  - payment status/review status.
  - total and currency.
  - item count.
  - purchased eBooklet titles.
  - action: view details.
- Detail view if normal orders support detail:
  - payment proof status.
  - admin notes if available.
  - purchased item rows.
  - after approval: link to teacher management page for each approved eBooklet.

Status copy:
- Pending: “Payment proof submitted. Waiting for admin review.”
- Approved: “Approved. Access management is available.”
- Rejected/Returned: “Payment was not approved. Check admin notes or resubmit if supported.”

---

## 8. Teacher post-approval management spec

Teacher dashboard should show approved eBooklet purchases/access only.

For each approved eBooklet:
- title/version.
- purchase/order reference.
- status.
- student seat quota.
- used student seats.
- available seats.
- code/link generation controls.
- analytics summary.

Teacher actions:
- generate one code/link.
- generate bulk codes by quantity.
- copy code/link.
- revoke unused code if supported.
- see redeemed student list.

Pending purchases:
- visible in orders page.
- management controls disabled/hidden.

---

## 9. Admin eBooklet Access page spec

Current page groups by teacher and lists eBooklets under each teacher.

Required updated structure:

```text
Teacher group
  Teacher summary
  EBooklet row
    EBooklet summary + teacher quota/status/actions
    Student rows nested under this eBooklet
      Student identity
      Access status/source/granted date
      Analytics summary
      Device summary
      Inline device management panel/actions
```

### 9.1 Teacher group

Fields:
- teacher name.
- teacher email.
- number of eBooklet instances/access purchases.
- aggregate seats used if available.
- aggregate active devices if available.

### 9.2 EBooklet row

Fields:
- eBooklet title.
- version label/number.
- teacher access status.
- expiry if any.
- student seat quota.
- used student seats.
- used/active devices summary.
- actions:
  - admin view.
  - revoke teacher access.
  - optional deep link to old students/detail route.

### 9.3 Nested student rows

Definition:
- “Students who bought the eBooklet” means actual student access records, not anonymous opens, pending proof submissions, or unredeemed links.

Fields:
- student name.
- student email.
- student user ID fallback.
- access status.
- access source.
- granted date.
- purchase/order reference if tied to a purchase.
- analytics summary.
- device summary.
- device action controls.

### 9.4 Analytics beside each student

Minimum analytics summary per student:
- access created count or flag.
- device bound count.
- page viewed count.
- last seen/opened timestamp if available.
- source: code/invite/admin/purchase.

Privacy requirements:
- Do not show raw IP/user-agent in the parent table by default.
- Raw device details may appear only inside expanded device panel or detail route.

### 9.5 Device management embedded inside student row

Required behavior:
- Beside/inside each student row, admin can manage devices without leaving the page.
- Reuse logic from `AdminEBookletDevicesPage` rather than duplicating API code.
- Recommended implementation:
  - extract reusable `AdminEBookletStudentDevicePanel` component.
  - use it in both:
    - nested row inside access page.
    - existing `/admin/e-booklet-instances/:instanceId/devices` page.

Controls:
- view active devices.
- show device label/status/last seen/bound date.
- set allowed devices.
- add allowance.
- reset devices.
- reason field for audit.

UX:
- Student row has expand/collapse or inline panel.
- Raw device list loads lazily when row expands.
- Summary fields load with the student list.
- Avoid N+1 full device-list calls on initial page load.

### 9.6 Existing detail routes

Keep:
- `/admin/e-booklet-instances/:instanceId/students`
- `/admin/e-booklet-instances/:instanceId/devices`

Behavior:
- These remain as fallback/deep links.
- New main flow should not require leaving the teacher/eBooklet/student nested access page.

---

## 10. Analytics definitions

Do not mix these categories:

1. Anonymous invite opens.
2. Approximate anonymous visitors.
3. Logged-in users who viewed/redeemed attempts.
4. Actual student access records.
5. Admin-approved teacher purchases.
6. Revenue from approved purchases.

For admin access page “students who bought the eBooklet”:
- Use actual access records only.
- Include access source and purchase/order reference when available.

For revenue:
- Count only approved/admin-confirmed purchases.
- Snapshot effective price at purchase/approval so later price changes do not rewrite history.

---

## 11. Data lifecycle

### 11.1 Teacher purchase lifecycle

```text
Teacher browses public catalog
  → adds one or more eBooklets to eBooklet cart
  → submits checkout + payment proof
  → eBooklet order is pending admin review
  → admin approves payment
  → teacher access/management unlocks
  → teacher generates student codes/links
  → students redeem privately
  → student dashboard shows permanent access
```

### 11.2 Student redemption lifecycle

```text
Student receives private code/link
  → opens redemption route
  → logs in/signs up if needed
  → code is validated
  → access record is created/bound to student
  → student opens /student/e-booklets
  → viewer access checks student access record
```

---

## 12. Acceptance criteria

### Public store

- `/e-booklets` shows only teacher-buyable eBooklets.
- Public listing does not expose student access records or codes.
- Public detail route is teacher-facing.
- Old `/e-booklets/instances/:instanceId` redirects to new teacher detail route or safe catalog fallback.

### EBooklet cart/checkout

- Multiple eBooklets can be added to cart.
- EBooklet cart mirrors normal cart UI.
- EBooklet checkout mirrors normal checkout UI.
- Payment proof fields match normal Store fields.
- Checkout creates pending eBooklet order.
- Pending order does not unlock management.

### EBooklet orders

- Dedicated eBooklet orders page exists.
- It mirrors normal `/orders` behavior.
- It lists only eBooklet purchases.
- Approved orders link to management/access where appropriate.

### Teacher management

- Teacher cannot generate student codes before admin approval.
- Teacher can generate one code after approval.
- Teacher can bulk-generate codes after approval.
- Teacher can view generated/redeemed code status.

### Student redemption

- Redemption routes are private/direct-link only and hidden from public nav.
- Logged-out student is returned to redemption after login/signup.
- Valid code/link creates permanent student access.
- Redeemed eBooklet appears in `/student/e-booklets`.
- Student viewer checks access record.

### Admin access page

- Admin page groups by teacher.
- Under each teacher, eBooklet rows remain visible.
- Under each eBooklet, student rows are shown.
- Each student row includes analytics summary.
- Each student row includes embedded device management.
- Existing devices page route still works as fallback.

---

## 13. Test plan

### Backend tests

Add/update tests for:
- public eBooklet store returns teacher catalog only.
- legacy instance route resolves/redirects to teacher detail.
- eBooklet cart supports multiple items.
- checkout creates pending eBooklet purchase with multiple items.
- pending purchase does not create/unlock teacher management access.
- admin approval creates/unlocks teacher management access.
- teacher single code generation works only after approval.
- teacher bulk code generation works only after approval.
- student redemption requires auth and preserves return path.
- student redemption binds permanent access.
- duplicate/expired/invalid code handling.
- admin access endpoint returns teacher → eBooklet → students with analytics/device summaries.
- device reset/allowance operations work from embedded panel endpoint calls.

### Frontend tests

Add/update tests for:
- `/e-booklets` renders teacher catalog.
- old instance route redirects.
- adding multiple eBooklets to cart.
- eBooklet cart UI mirrors normal cart component behavior.
- eBooklet checkout submits payment proof.
- eBooklet orders page lists only eBooklet purchases.
- pending order management CTA disabled/absent.
- approved order management CTA visible.
- private redemption flow requires login.
- student dashboard lists redeemed eBooklet.
- admin access page renders nested teacher/eBooklet/student rows.
- expanding a student row loads device panel.
- reset/allow device actions call correct APIs and refresh row state.

### Manual verification

Run:
- backend test suite/build.
- frontend lint/build.
- local browser smoke for:
  - `/e-booklets`
  - new teacher detail route
  - old instance redirect
  - `/e-booklet-cart`
  - `/e-booklet-checkout`
  - dedicated eBooklet orders page
  - `/student/e-booklets`
  - `/admin/e-booklet-instances`
  - embedded device panel

---

## 14. Implementation notes by current files

Known frontend files/routes from current codebase:
- `frontend/src/App.jsx`
- `frontend/src/pages/e-booklets/EBookletStorePage.jsx`
- `frontend/src/pages/e-booklets/EBookletDetailsPage.jsx`
- `frontend/src/pages/e-booklets/EBookletCartPage.jsx`
- `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
- `frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx`
- `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
- `frontend/src/pages/admin/e-booklets/AdminEBookletInstanceStudentsPage.jsx`
- `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`
- `frontend/src/hooks/useEBooklets.js`
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/src/components/checkout/steps/CartStep.jsx`
- `frontend/src/components/checkout/steps/PaymentStep.jsx`
- `frontend/src/components/checkout/PaymentMethod.jsx`
- `frontend/src/components/checkout/OrderSummary.jsx`
- `frontend/src/components/checkout/WizardStepper.jsx`
- `frontend/src/components/checkout/PrintableReceipt.jsx`
- `frontend/src/components/cart/EmptyCartState.jsx`
- `frontend/src/contexts/CartContext.jsx`

Known backend files/routes from current codebase:
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/services/e-booklet.service.ts`
- Prisma/generated eBooklet models under `backend/src/apps/store-api/generated/prisma/`

Implementation should inspect exact current behavior before editing because some earlier work may already partially implement nested students/devices and analytics.

---

## 15. Non-goals

- Do not merge eBooklet purchases into normal Store product tables.
- Do not show student private access in public `/e-booklets`.
- Do not unlock teacher management while payment is pending.
- Do not duplicate checkout UI into a separate custom eBooklet checkout if shared components can be adapted.
- Do not expose raw analytics/device PII in parent tables by default.

---

## 16. Done definition

This feature is done only when:
- Spec decisions above are implemented.
- Tests pass.
- Frontend build/lint pass.
- Backend build/tests pass.
- Local browser smoke confirms the listed routes.
- If deployed, production E2E confirms frontend/backend/database behavior with real auth and admin approval flow.
