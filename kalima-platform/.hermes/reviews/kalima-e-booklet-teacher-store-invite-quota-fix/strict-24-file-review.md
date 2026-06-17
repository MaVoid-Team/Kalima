# Strict 24-file review: e-booklet teacher store invite/quota fix

Review scope: all 24 files explicitly requested, including generated Prisma files and migration file.

Repository inspected from disk: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`.

Verification run:

```text
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts
PASS tests/e-booklet/e-booklet.routes.spec.ts
PASS tests/e-booklet/e-booklet.service.spec.ts
Test Suites: 2 passed, 2 total
Tests: 63 passed, 63 total
```

Note: an attempted lean-ctx shell test invocation ran from the outer `/Users/ziadnasreldin/Zoid` git/workspace context and failed on unrelated Zoid tests; the real backend test command above was rerun with the exact backend workdir and passed.

Overall verdict: REQUIRED_FIXES

The core public store/detail/checkout path is mostly implemented and targeted tests pass, but I found quota-enforcement gaps in the legacy/direct invite acceptance paths. These paths still count only active access and do not count pending student purchase reservations, violating the stated requirement that student seat quota counts active access plus pending reservations. Those paths also use the non-serializable transaction helper/count-create pattern, leaving oversubscription risk under concurrent accepts. I also found that `updateQuota` allows admins to reduce quota below already reserved seats, creating impossible negative-capacity state.

## File-by-file verdicts

### 1. `backend/src/apps/store-api/generated/prisma/models/e_booklet_analytics_events.ts`
Verdict: APPROVED

Inspected generated model contents. The generated analytics model includes the intended fields used by the service, including `marketing_price_snapshot` and `internal_price_snapshot`, plus relation/filter/order/create/update input types consistent with `schema.prisma`. No required fixes in this generated file.

### 2. `backend/src/apps/store-api/prisma/migrations/20260610120000_e_booklet_invite_passcode_ciphertext/migration.sql`
Verdict: APPROVED

Inspected lines 1-2:

- `ALTER TABLE "e_booklet_invites"`
- `ADD COLUMN "passcode_ciphertext" TEXT;`

This migration matches the incremental schema/generated change for recoverable encrypted passcodes. Earlier migration `20260604130000_e_booklet_invite_share_fields` already adds `share_token_ciphertext`, so this migration does not need to repeat it. No required fixes.

### 3. `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
Verdict: APPROVED

Inspected the public checkout and invite acceptance controller paths. Public checkout validates `EBookletCheckoutDto` and delegates to `createPublicCheckoutRequest` (lines 191-197). Invite acceptance requires an explicit `accessPath` and dispatches to free/passcode/online-purchase handlers (lines 609-632). Student-only enforcement is handled in routes, and the controller does not leak passcodes/tokens directly. No controller-local required fixes.

### 4. `backend/src/apps/store-api/dtos/e-booklet.dto.ts`
Verdict: APPROVED

Inspected DTOs for public checkout, delivery, invite creation, quota, and accept flows. `DeliverEBookletDto` contains `student_marketing_price` and `internal_price` (lines 298-306). `CreateEBookletInviteDto` validates 6-digit passcodes and hint length (lines 319-331). `AcceptEBookletInviteDto` requires enumerated `accessPath` when used by controller dispatch and validates passcode shape (lines 340-370). No DTO-local required fixes.

### 5. `backend/src/apps/store-api/generated/prisma/browser.ts`
Verdict: APPROVED

Inspected generated Prisma browser export surface. It is consistent with the regenerated client surface and does not contain hand-authored business logic. No required fixes.

### 6. `backend/src/apps/store-api/generated/prisma/client.ts`
Verdict: APPROVED

Inspected generated Prisma client export surface. It is consistent with `schema.prisma` and generated model files, including e-booklet models and enums used by the service/routes. No required fixes.

### 7. `backend/src/apps/store-api/generated/prisma/internal/class.ts`
Verdict: APPROVED

Inspected generated internal Prisma class metadata. It is generated code and aligns with the regenerated model/client files. No required fixes.

### 8. `backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts`
Verdict: APPROVED

Inspected generated Prisma namespace types. The namespace includes generated input/output types for the e-booklet schema changes. No required fixes.

### 9. `backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts`
Verdict: APPROVED

Inspected generated browser namespace file. It is generated code consistent with the browser/client generated outputs. No required fixes.

### 10. `backend/src/apps/store-api/generated/prisma/models.ts`
Verdict: APPROVED

Inspected generated aggregate model exports. It includes the regenerated e-booklet model files and is consistent with the schema. No required fixes.

### 11. `backend/src/apps/store-api/generated/prisma/models/e_booklet_invites.ts`
Verdict: APPROVED

Inspected generated invite model. It includes both `share_token_ciphertext` and `passcode_ciphertext` in payload/select/create/update/filter types (for example lines 50-52 and 250-253), matching schema and service usage. No required fixes.

### 12. `backend/src/apps/store-api/prisma/schema.prisma`
Verdict: APPROVED

Inspected schema fields relevant to the feature. `e_booklet_purchases` has marketing/internal price separation (lines 889-891), `e_booklet_instances` has `student_marketing_price` and `internal_price` (lines 924-925), `e_booklet_invites` has `share_token_ciphertext` and `passcode_ciphertext` (lines 973-976), and analytics snapshots include marketing/internal price snapshots (lines 1124-1125). Schema aligns with migrations and generated client. No schema-local required fixes.

### 13. `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
Verdict: APPROVED

Inspected public, admin, teacher, and student route declarations. Public store/detail are unauthenticated (lines 55-56), public checkout is student-authenticated (line 57), invite accept is rate-limited and student-authenticated (lines 264-268), and teacher/admin APIs are role-gated. No route-local required fixes.

### 14. `backend/src/apps/store-api/services/e-booklet.service.ts`
Verdict: REQUIRED_FIXES

Required fixes:

1. `backend/src/apps/store-api/services/e-booklet.service.ts:1410-1414` — `updateQuota` blindly writes any new `invite_quota` without checking current active student access plus pending reservations. This lets an admin reduce quota below seats already consumed/reserved, after which public store/detail can show zero remaining but the database contains more reservations than capacity. Fix by counting `countReservedStudentSeats` (or equivalent active+pending reservation count) inside a transaction and rejecting quotas below current reserved seat count.

2. `backend/src/apps/store-api/services/e-booklet.service.ts:2606-2614` — `acceptFreeInvite` enforces quota using only `e_booklet_access.count(...)`. It does not count pending `e_booklet_student_purchase_links` reservations, violating the intended quota rule that student seats count active access plus pending reservations. Fix by replacing this count with `assertStudentSeatAvailable(tx, instance)` or equivalent active+pending logic.

3. `backend/src/apps/store-api/services/e-booklet.service.ts:2565` and `backend/src/apps/store-api/services/e-booklet.service.ts:2606-2616` — `acceptFreeInvite` uses the normal `transaction` helper and a count-then-create quota check. Under concurrent free invite accepts, two transactions can both see the same active count and create access, oversubscribing quota. The public checkout path uses `serializableTransaction`; this path should do the same and should retry/handle serialization failures consistently.

4. `backend/src/apps/store-api/services/e-booklet.service.ts:2743-2755` — legacy/direct `acceptInvite` enforces quota using only active student access, not pending purchase reservations. Even if currently not wired by the route dispatcher for explicit `accessPath`, it remains a live service method and can be called by tests or future code. It violates the active+pending quota rule and can grant seats when pending reservations have filled capacity. Fix by using `assertStudentSeatAvailable(tx, bookletInstance)` or removing/deprecating the method if no longer used.

5. `backend/src/apps/store-api/services/e-booklet.service.ts:2687` and `backend/src/apps/store-api/services/e-booklet.service.ts:2743-2757` — legacy/direct `acceptInvite` uses `$transaction` with count-then-create, not the serializable quota-protected transaction helper. Concurrent accepts can oversubscribe invite quota. Fix with the same serializable active+pending reservation enforcement used by public checkout/approval.

Positive notes: public store serialization removes `internal_price` (lines 974-987); public checkout uses instance-first IDs and server-side instance price, creates pending purchase links, reserves seats, and grants zero-price access (lines 1096-1212); approval excludes its own pending purchase reservation before granting access (line 2269); encrypted invite/passcode helpers use AES-GCM and hash lookup (lines 215-270, 1434-1514).

### 15. `backend/tests/e-booklet/e-booklet.routes.spec.ts`
Verdict: APPROVED

Inspected route tests and ran them. They pass and meaningfully cover role-gated routing for public checkout/invite paths and route/controller integration. No required fixes in this file.

### 16. `backend/tests/e-booklet/e-booklet.service.spec.ts`
Verdict: REQUIRED_FIXES

Required fixes:

1. `backend/tests/e-booklet/e-booklet.service.spec.ts:416-440` — the test suite covers public checkout rejecting when pending checkout links reserve all seats, but there is no equivalent regression test for free invite acceptance or legacy/direct invite acceptance. Because the service currently has real bugs at `services/e-booklet.service.ts:2606-2614` and `2743-2755`, add tests proving `acceptFreeInvite` and any retained `acceptInvite` path count pending reservations and reject when active+pending reaches quota.

2. `backend/tests/e-booklet/e-booklet.service.spec.ts:442-470` — the zero-price checkout test verifies access creation, but it does not cover a full-seat-with-pending-reservation scenario for zero-price/free grant. Add/extend tests to assert zero-price/free access cannot bypass pending seat reservations.

The existing tests are meaningful and pass, but coverage misses the exact quota paths that are currently broken.

### 17. `frontend/src/App.jsx`
Verdict: APPROVED

Inspected route registration. Store/detail routes are public, checkout is under the existing non-admin role wrapper, invite acceptance route is registered, and admin e-booklet pages are wired. Backend remains the source of truth for student-only checkout. No required fixes.

### 18. `frontend/src/hooks/useEBooklets.js`
Verdict: APPROVED

Inspected normalization and API hooks. `normalizeEBookletTemplate` correctly maps instance-first API data to UI shape, including `student_marketing_price` -> `price`, `remaining_seats`, instance/template/version IDs, and cover/category data (lines 36-70). Cart item construction preserves instance IDs (lines 91-107). Checkout posts to `/e-booklet-checkout` (lines 293-303). No required fixes.

### 19. `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
Verdict: APPROVED

Inspected admin instance UI. It uses seat/quota terminology and exposes update/revoke/device-management operations without exposing internal price to public/student flows. No required fixes.

### 20. `frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx`
Verdict: APPROVED

Inspected admin purchase/delivery UI. Delivery form includes `student_marketing_price`, `internal_price`, invite quota, expiry, custom document and display title handling, matching service DTO and marketing/internal price separation. No required fixes.

### 21. `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
Verdict: APPROVED

Inspected accept invite page. It sends `accessPath`, passcode, payment proof/purchase data as applicable and navigates after success. Backend enforces student auth, passcode validation, and quota. No frontend-local required fixes.

### 22. `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`
Verdict: APPROVED

Inspected checkout page. It submits `instance_id`, `template_id`, `template_version_id`, branding/contact fields, and uses cart-normalized price for display only while backend prices from the selected instance (lines 126-142). It handles zero-price `next_url` redirect (lines 144-149). No required fixes.

### 23. `frontend/src/pages/e-booklets/EBookletDetailsPage.jsx`
Verdict: APPROVED

Inspected details page. It consumes normalized instance-first template data and displays price/currency from normalized `student_marketing_price`, plus instance details before carting checkout. No required fixes.

### 24. `frontend/src/pages/e-booklets/EBookletStorePage.jsx`
Verdict: APPROVED

Inspected store page. It lists normalized public e-booklet instances, displays normalized price/currency, and routes users to instance-detail/checkout flow. No required fixes.
