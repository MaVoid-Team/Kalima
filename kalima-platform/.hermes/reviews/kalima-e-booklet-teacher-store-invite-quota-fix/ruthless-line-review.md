# Ruthless line-by-line review: commit 5cf506fb

Verdict: REQUIRED_FIXES

Commit reviewed: 5cf506fb3639205802f7395dd663909cb48e1247 (Fix Kalima e-booklet teacher instance store)
Repo: /Users/ziadnasreldin/Documents/GitHub/Kalima
Platform root: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform

## Verification performed

I read the commit diff and the current files from disk for the changed backend controller/DTO/routes/service/schema/migration/tests and frontend routes/hooks/pages/admin/checkout/invite/store/details surfaces. I specifically checked backend route -> controller -> service -> DTO -> Prisma schema/generated/test shapes; frontend hook/cart serialization -> store/details/checkout routes; auth/role boundaries; secret exposure; pricing/quota/payment/invite flows.

Commands run:

- `git show --stat --oneline 5cf506fb` from `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
- `git show --find-renames --find-copies --stat --patch 5cf506fb -- ...changed paths...` from `/Users/ziadnasreldin/Documents/GitHub/Kalima`
- `npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts` from backend: PASS, 2 suites, 60 tests
- `npm run build` from backend: PASS (`tsc`)
- `npm run build` from frontend: PASS (Vite build; existing chunk-size warning only)

Passing tests/build do not clear the blockers below.

## Blockers

### 1) Public checkout is authenticated but not role-restricted; non-students can create student checkout purchases and invite links

File: `kalima-platform/backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:57`

Current code:

```ts
router.post("/e-booklet-checkout", authenticateToken, eBookletController.createPublicCheckout);
```

Why this is wrong:

The route accepts any authenticated user and passes `currentUserId(req)` into `createPublicCheckoutRequest` as `studentId` (`controllers/e-booklet.controller.ts:191-198`). The service then creates a generic `purchases` row, an `e_booklet_invites` row, and an `e_booklet_student_purchase_links` row with `student_id: studentId` (`services/e-booklet.service.ts:1076-1110`). There is no backend role check that this user is a Student.

Frontend attempts to exclude Admin/SubAdmin from `/e-booklet-checkout`, but frontend route guards are not security. Teachers, Moderators, Admins, or any authenticated account with no intended student store access can call the API directly and create student purchase links/invites. This violates the auth/role boundary and can pollute purchase/admin approval flows with non-student users.

Expected behavior:

Only Student users should be able to create public e-booklet student checkout requests, consistent with the downstream `e_booklet_student_purchase_links.student_id` semantics and the student invite acceptance/access model.

Minimal fix:

Use the existing student auth middleware on the checkout route, and add/adjust tests that a non-student token is rejected:

```ts
router.post(
  "/e-booklet-checkout",
  ...studentAuth,
  eBookletController.createPublicCheckout,
);
```

If the product intentionally allows any account to buy as a student, then the service/schema naming and access-approval code must be redesigned to represent buyer vs student explicitly. As written, it is a student purchase flow and must be student-restricted.

### 2) Public checkout seat quota check is race-prone and can oversell seats

File: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:1066-1070`

Current code:

```ts
const activeStudentAccessCount = await this.db.e_booklet_access.count({
  where: { booklet_instance_id: instance.id, role: "student", status: "active" },
});
if (activeStudentAccessCount >= Number(instance.invite_quota ?? 0)) {
  throw new ForbiddenError("This e-booklet has reached its student seat limit.");
}
```

Why this is wrong:

This check is outside the transaction that creates the purchase, invite, and purchase link (`services/e-booklet.service.ts:1076-1134`). It also checks only active access records, not pending checkout/purchase links or already-created one-use invites. Multiple students can concurrently submit checkouts when one seat remains. Every request sees the same active access count, every request creates a pending purchase and active one-use invite, and admin approval later has to deal with oversubscription. For zero-price instances this is worse because the service marks the purchase `confirmed` immediately (`services/e-booklet.service.ts:1080`) while still creating only a pending-style purchase link.

Expected behavior:

The quota must be enforced atomically against the thing being reserved/consumed. A successful checkout should reserve a seat, or approval should be the only place that consumes seats and must reject all over-quota approvals atomically. Public store inventory must not advertise/accept seats that can already be consumed by pending one-use links.

Minimal fix:

Move quota enforcement inside the transaction and count active student accesses plus unapproved/non-cancelled `e_booklet_student_purchase_links` or active one-use invites for the instance, under a row lock/serializable transaction where supported. Alternatively add a database-backed reservation counter and atomically increment it only when below `invite_quota`. Also add a concurrency test or at least a service test that pending links are counted toward remaining seats.

### 3) Storefront remaining seats and checkout quota use only active access records, ignoring pending purchases/invites created by the new checkout flow

Files:

- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:936-948`
- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:978-992`
- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:1066-1070`

Current behavior:

`serializePublicInstance()` computes `used_seats` from `instance.access_records.length` and `remaining_seats = invite_quota - usedSeats`. The public list/detail queries include only active student `e_booklet_access` rows. The checkout quota gate uses the same active access count.

Why this is wrong:

The new checkout flow creates `e_booklet_invites` and `e_booklet_student_purchase_links` at checkout time (`services/e-booklet.service.ts:1088-1110`), but those reservations are invisible to `remaining_seats` and invisible to the checkout gate. A class with quota 30 can show 30 remaining even after 30 students have submitted pending paid checkout requests. Additional students can keep submitting pending requests. Admin approval or support then becomes the point where the broken inventory model surfaces.

Expected behavior:

The public store should show and enforce available purchasable seats, not just already-approved access. Pending/unapproved checkout links that can become access should either reserve capacity and reduce `remaining_seats`, or checkout should not create durable purchase/invite records until capacity is guaranteed at payment/approval time.

Minimal fix:

Define a single seat accounting function. For public checkout availability, count active student accesses plus active/pending student purchase links/invites that reserve a seat, excluding rejected/cancelled/expired records. Use that function in `serializePublicInstance()`, `listPublicInstances()`, `getPublicInstance()`, and `createPublicCheckoutRequest()`.

### 4) Zero-price public checkout creates a confirmed purchase and hidden invite but does not grant access or return an accept token; the student cannot open the booklet

File: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:1076-1133`

Relevant lines:

```ts
status: price > 0 ? "pending" : "confirmed",
...
share_token_ciphertext: encryptInviteShareToken(shareToken),
...
return {
  id: purchase.id,
  purchase_id: purchase.id,
  status: purchase.status,
  total: price,
  currency: "EGP",
  student_purchase_link_id: link.id,
  booklet_instance_id: instance.id,
};
```

Why this is wrong:

For `student_marketing_price = 0`, the service marks the purchase `confirmed`, but it still only creates an invite and student purchase link. It does not create `e_booklet_access`, does not increment usage, and does not return the invite token. The token is encrypted in `share_token_ciphertext` but never exposed to the buyer. The frontend checkout success page only displays a generic success and clears the cart (`frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx:143-177`), so the student has no way to accept the invite/open the booklet. The existing `acceptFreeInvite` path requires the raw invite token; public checkout intentionally hides it.

Expected behavior:

A zero-price public checkout should either immediately grant student access and return/open the instance, or return a one-time invite/accept URL/token and direct the user through the free accept flow. A confirmed zero-price purchase must not leave the student stranded with no access path.

Minimal fix:

For `price === 0`, inside the same transaction create the `e_booklet_access` row, update invite/instance usage, set the purchase link `approved_at/access_id`, and return enough data for the frontend to navigate to `/student/e-booklets/:instanceId`. Alternatively return the generated invite token/accept URL and have the checkout UI consume it immediately. Add a service and route test for the zero-price checkout access path.

### 5) Admin purchase approval can approve the same public checkout link multiple times / race into duplicate access errors because it does not lock or check existing approved link/access before creating access

File: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts:2200-2235`

Current behavior:

The approval flow creates an `e_booklet_access` row, increments invite and instance counters, then updates the purchase link with `access_id` and `approved_at`. There is no visible guard in the shown approval block that rejects a link already approved, and no transaction-level lock preventing two approval requests for the same purchase from both trying to create access.

Why this is wrong:

Public checkout creates durable purchase links (`services/e-booklet.service.ts:1100-1110`) that admins later approve. A duplicate approval click/request can race or retry. Because `e_booklet_access` has `@@unique([booklet_instance_id, user_id])` (`schema.prisma:1028`), the second attempt may fail with a database uniqueness error after counters may have been incremented in an unlucky flow, or produce an unhandled 500 instead of an idempotent success/clear conflict. This is part of the payment/invite/quota boundary introduced by this commit.

Expected behavior:

Approval should be idempotent or should fail cleanly before side effects if the purchase link is already approved. It should also enforce quota atomically at approval time.

Minimal fix:

Inside the approval transaction, fetch the link with a lock/serializable isolation, reject or return existing approval when `approved_at` or `access_id` is already set, check quota atomically, then create access and update counters. Add tests for duplicate approval and over-quota approval.

## Additional risks / non-blocking but should be fixed

### A) The checkout DTO remains shared between teacher deal creation and public checkout, so public checkout requires teacher branding fields that are unrelated to student purchase

File: `kalima-platform/backend/src/apps/store-api/dtos/e-booklet.dto.ts:221-259`

`EBookletCheckoutDto` requires `branding_json` even for `/e-booklet-checkout`. The frontend currently sends a teacher-style branding payload from `EBookletCheckoutPage.jsx:133-140`, which works mechanically but keeps public student checkout coupled to teacher custom booklet purchase fields. This is fragile and confusing. Minimal fix: introduce a separate `EBookletPublicCheckoutDto` requiring only `instance_id`, `template_id`, `template_version_id`, terms/contact/payment fields as needed.

### B) Passcodes are now reversibly encrypted and returned in plaintext to teacher list responses

Files:

- `schema.prisma:973-976` adds `passcode_ciphertext`
- `services/e-booklet.service.ts:1372` stores encrypted passcode
- `services/e-booklet.service.ts:1428-1432` returns `passcode: decryptInvitePasscode(...)`

This may be a product requirement so teachers can recover generated passcodes, but it is a security regression from hash-only storage. If this is intentional, document it and use a strong mandatory secret in production. The current fallback chain includes `"dev-e-booklet-invite-passcode-secret"` (`services/e-booklet.service.ts:220-229` area), which must never be accepted in production. Minimal fix: fail fast in production if no passcode/share-token encryption secret is configured, and consider returning passcodes only once at creation time.

### C) Public store list/detail expose raw instance/template relation shapes broadly

File: `services/e-booklet.service.ts:936-948`

`serializePublicInstance()` deletes `internal_price` and `access_records`, but otherwise returns the full included instance object, including nested `template`, `template_version`, cover file metadata, and any future columns added to the include. This is safer than exposing internal price but still broad. Minimal fix: explicitly whitelist public fields rather than delete a couple of sensitive fields.

## Cross-boundary notes

- Backend route/controller/service names are still partly `Template` while now returning instances (`listStoreTemplates`, `getStoreTemplate`). This is not a runtime blocker but increases shape confusion.
- Frontend route migration from `/e-booklets/:slug` to `/e-booklets/instances/:instanceId` is internally consistent in `App.jsx`, `EBookletStorePage.jsx`, `EBookletDetailsPage.jsx`, and `useEBooklets.js`.
- Cart serialization now stores `instance_id`, `template_id`, and `template_version_id`, and checkout sends those fields. That shape matches the new service checks.
- Prisma schema/migration for `passcode_ciphertext` is nullable and generated client appears updated. I did not find a migration mismatch blocker in the reviewed diff.

## Final verdict

REQUIRED_FIXES

The commit compiles and the narrow tests pass, but it is not safe to approve. The public checkout path has backend role-boundary issues, non-atomic quota/seat accounting, a broken zero-price access path, and approval/idempotency risks. These are real production risks across auth, pricing/quota/payment/invite flows and must be fixed before approval.

---

# Ruthless re-review: current working tree after required fixes

Re-review performed: 2026-06-10 11:51:44 EEST

Verdict: APPROVED

## Verification performed

I inspected the current working tree diff against `HEAD` and read the affected code from disk for the public checkout route, public store/detail seat serialization, checkout transaction/quota flow, zero-price checkout path, admin approval path, frontend checkout navigation, and focused tests.

Commands run from `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform` unless noted:

- `git status --short && git diff --name-only HEAD && git diff --stat HEAD`
- `git diff HEAD -- backend/src/apps/store-api/routes/v2/e-booklet.routes.ts backend/src/apps/store-api/services/e-booklet.service.ts frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx backend/tests/e-booklet/e-booklet.service.spec.ts backend/tests/e-booklet/e-booklet.routes.spec.ts`
- `npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts` from `backend`: PASS, 2 suites, 63 tests

## Required-fix checks

### 1) `/e-booklet-checkout` is Student-only

Fixed. `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:25-28` defines `studentAuth` with `authenticateToken` and `requireRole([role_enum.Student])`; `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:57` now registers `router.post("/e-booklet-checkout", ...studentAuth, eBookletController.createPublicCheckout);`. The route test also covers Teacher rejection.

### 2) Public store/detail and checkout seat accounting count pending reservation links

Fixed. `backend/src/apps/store-api/services/e-booklet.service.ts:948-963` counts active student access plus pending unapproved purchase links whose invite is active and unexpired. Public list/detail includes those links at `backend/src/apps/store-api/services/e-booklet.service.ts:1028-1038` and `backend/src/apps/store-api/services/e-booklet.service.ts:1079-1089`; serialization subtracts them from remaining seats and returns `reserved_seats` at `backend/src/apps/store-api/services/e-booklet.service.ts:974-987`. Checkout uses the same helper at `backend/src/apps/store-api/services/e-booklet.service.ts:1123-1124`.

### 3) Checkout quota check happens inside a serializable transaction

Fixed. Checkout now enters `serializableTransaction` before asserting seat availability at `backend/src/apps/store-api/services/e-booklet.service.ts:1123-1124`. The helper wraps Prisma `$transaction` with `{ isolationLevel: "Serializable" }` and retries Prisma `P2034` once at `backend/src/apps/store-api/services/e-booklet.service.ts:311-324`.

### 4) Zero-price checkout creates access and returns/navigates to usable student booklet route

Fixed. For `price === 0`, checkout creates active student access, approves the purchase link, increments invite/instance usage, and returns `access_id` plus `next_url: /student/e-booklets/:instanceId` at `backend/src/apps/store-api/services/e-booklet.service.ts:1160-1210`. The frontend consumes `next_url` and navigates after clearing the cart at `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx:66-69` and `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx:141-149`. The route is present at `frontend/src/App.jsx:246`.

### 5) Admin approval is idempotent and quota-checked before side effects

Fixed. Approval now runs in a serializable transaction at `backend/src/apps/store-api/services/e-booklet.service.ts:2246-2249`, returns immediately for already approved/access-linked purchase links at `backend/src/apps/store-api/services/e-booklet.service.ts:2253-2255`, checks quota before access creation/counter increments at `backend/src/apps/store-api/services/e-booklet.service.ts:2265-2270`, and excludes the current pending purchase from its own reservation count. Side effects occur only after those checks at `backend/src/apps/store-api/services/e-booklet.service.ts:2270-2317`. Focused tests cover idempotent approved-link handling and over-quota approval rejection.

## Remaining notes

The working tree contains unrelated dirty/deleted files outside this e-booklet fix set. I did not review or approve those unrelated changes. No remaining blockers were found for the required fixes listed in the original ruthless review.

## Re-review verdict

APPROVED
