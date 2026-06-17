# Handoff: Kalima e-booklet teacher store + invite quota fix

Feature slug: `kalima-e-booklet-teacher-store-invite-quota-fix`
Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima`
Platform root: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`

## Scope to review
Review only the Kalima e-booklet changes for the corrected teacher-specific store + invite quota model. The working tree contains unrelated dirty files from earlier work and local-doc cleanup; do not treat unrelated files as part of this feature unless they affect this flow.

Relevant changed files:
- `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `kalima-platform/backend/src/apps/store-api/dtos/e-booklet.dto.ts`
- `kalima-platform/backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`
- `kalima-platform/backend/src/apps/store-api/prisma/schema.prisma`
- `kalima-platform/backend/src/apps/store-api/prisma/migrations/20260610120000_e_booklet_invite_passcode_ciphertext/migration.sql`
- `kalima-platform/backend/src/apps/store-api/generated/prisma/**`
- `kalima-platform/backend/tests/e-booklet/e-booklet.service.spec.ts`
- `kalima-platform/backend/tests/e-booklet/e-booklet.routes.spec.ts`
- `kalima-platform/frontend/src/App.jsx`
- `kalima-platform/frontend/src/hooks/useEBooklets.js`
- `kalima-platform/frontend/src/pages/e-booklets/EBookletStorePage.jsx`
- `kalima-platform/frontend/src/pages/e-booklets/EBookletDetailsPage.jsx`
- `kalima-platform/frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`
- `kalima-platform/frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
- `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx`
- `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`

## Intended behavior
- Public e-booklet store lists active, unexpired teacher-specific booklet instances, not global reusable admin templates.
- Public e-booklet detail route uses instance identity: `/e-booklets/instances/:instanceId`.
- Public store/detail responses do not expose backend-only `internal_price`.
- Student price shown in store/detail comes from instance `student_marketing_price`.
- Student seats use `invite_quota` minus active access records; quota terminology should mean student seats, not generic invite count.
- Free invite acceptance is allowed when `student_marketing_price` is zero even if `internal_price` is nonzero.
- Teacher-created invite passcodes remain hashed for validation but are also encrypted in `passcode_ciphertext` so teacher UI/API can show/copy them later.
- Invite online purchase UI sends `purchaseId` and optional `paymentProofFileId` to backend instead of calling accept without purchase data.
- Admin delivery UI sends required delivery fields: access expiry, student store price, internal cost, and student seat quota.
- Direct public store checkout is restored as an authenticated instance-scoped route: `POST /api/v2/e-booklet-checkout`. It requires `instance_id`, validates template/version match, creates a normal `purchases` row, one-use invite, and `e_booklet_student_purchase_links` row. It must not create old `e_booklet_purchases` records.
- Frontend checkout now sends `instance_id`; frontend store normalization accepts backend `remaining_seats`.

## Required-fix follow-up from first critique
First critique verdict was `REQUIRED_FIXES` for:
1. `/e-booklet-checkout` route removed while frontend still used it.
2. Backend returns `remaining_seats` while frontend read only `seats_remaining`.

Fixes applied:
- Restored `POST /api/v2/e-booklet-checkout` as authenticated, instance-scoped, using `createPublicCheckoutRequest`.
- Added `instance_id` to checkout DTO and frontend checkout payload.
- Added service tests for direct public checkout creating purchase + one-use invite + student purchase link.
- Updated route test to assert checkout auth + instance-scoped service call and that `createPurchaseRequest` is not called.
- Updated frontend normalization to read `template.seats_remaining ?? template.remaining_seats`.

## Verification already run after fixes
From `kalima-platform/backend`:
- `npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand`
  - Result: PASS, 2 suites, 60 tests.
- `npm run build`
  - Result: PASS.

From `kalima-platform/frontend`:
- `npm run build`
  - Result: PASS. Vite warning only: large chunks / browser externalized crypto from existing embedpdf dependency.

## Known concerns to scrutinize
- Confirm direct public checkout’s new instance-scoped implementation is compatible with existing admin purchase review flow for standard `purchases` rows and with the e-booklet student purchase link approval path.
- Confirm free/zero-price public checkout status behavior (`confirmed`) is acceptable or should still require admin approval.
- `AcceptEBookletInvitePage` currently asks for purchase ID / payment proof file ID manually; this may not be acceptable UX if the intended flow requires real upload/payment creation from that page.
- Check if `access_expires_at` date input sends a date-only string that backend `@IsDateString` and `new Date()` handle correctly in local/prod timezone.
- Check generated Prisma client diffs are expected and complete for `passcode_ciphertext`.
- Check store serialization includes only safe fields and does not leak `internal_price`, share tokens, passcode hashes/ciphertext, or admin-only details.
- Check quota enforcement uses active access records consistently and does not rely on stale `used_invites_count`.

## Review output required
Write review report to:
`/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/critique-report.md`

Verdict format must be one of:
- `APPROVED`
- `REQUIRED_FIXES`

If fixes are required, list concrete required fixes with exact files and expected behavior.
