# Critique Report: Kalima e-booklet teacher store + invite quota fix

Verdict: APPROVED

## Re-review scope
Reviewed the updated diffs/code for the teacher-specific e-booklet public store, instance-scoped detail/checkout flow, invite quota semantics, passcode ciphertext support, and frontend normalization/checkout updates described in the handoff.

## Prior blockers
1. Restored direct public checkout route: FIXED
   - `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts` now registers `POST /api/v2/e-booklet-checkout` behind authentication.
   - `backend/src/apps/store-api/controllers/e-booklet.controller.ts` routes it to `createPublicCheckoutRequest` instead of the old teacher/admin `createPurchaseRequest` path.
   - `backend/src/apps/store-api/services/e-booklet.service.ts` requires `instance_id`, verifies active/unexpired instance, validates template/version match, creates a normal `purchases` row, one-use invite, and `e_booklet_student_purchase_links` row.
   - Route/service tests cover the restored endpoint and assert the old `createPurchaseRequest` path is not used.

2. Frontend remaining-seat normalization: FIXED
   - `frontend/src/hooks/useEBooklets.js` now normalizes `seatsRemaining` from `template.seats_remaining ?? template.remaining_seats`.
   - Store/detail pages consume the normalized value and route by instance id.

## Additional checks
- Public store list/detail are instance-scoped (`listPublicInstances`, `getPublicInstance`) and filter active, unexpired teacher instances.
- Public serialization removes `internal_price` and strips access record internals while retaining student-facing `student_marketing_price` as normalized `price` on the frontend.
- Seat availability is calculated from active student access records rather than stale `used_invites_count`, consistent with the intended quota model.
- Free invite acceptance now checks only `student_marketing_price`, so zero student price with nonzero internal cost is allowed.
- Invite passcodes are stored hashed for validation and encrypted in `passcode_ciphertext` for teacher list/copy display, with hashes omitted from list responses.
- Frontend checkout sends `instance_id` along with template/version ids.
- Generated Prisma/schema migration changes for `passcode_ciphertext` are present.

## Verification run
From `kalima-platform/backend`:
- `npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand`
  - PASS: 2 suites, 60 tests.
- `npm run build`
  - PASS.

From `kalima-platform/frontend`:
- `npm run build`
  - PASS. Vite emitted only existing/non-blocking warnings about browser-externalized `crypto` from `@embedpdf/snippet` and large chunks.

## Notes / non-blocking observations
- `POST /api/v2/e-booklet-checkout` is authenticated but not role-restricted to Student at the backend route level. The frontend excludes Admin/SubAdmin and the requirement called for an authenticated instance-scoped route, so this is not treated as a blocker for this review.
- Zero-price public checkout creates a confirmed purchase/link but does not immediately grant access; approval/link flow remains consistent with the existing student purchase approval path unless product requirements later decide confirmed free public checkout should auto-provision access.
