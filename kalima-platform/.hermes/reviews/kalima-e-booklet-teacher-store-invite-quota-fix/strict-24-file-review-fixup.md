# Strict 24-file review fixup: e-booklet invite quota fixes

Overall verdict: APPROVED

Scope re-reviewed line-by-line from disk:
1. `backend/src/apps/store-api/services/e-booklet.service.ts`
2. `backend/tests/e-booklet/e-booklet.service.spec.ts`

Current diff reviewed:
- `git diff -- backend/src/apps/store-api/services/e-booklet.service.ts backend/tests/e-booklet/e-booklet.service.spec.ts`

Focused verification run:
- Command: `cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend && npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts`
- Result: PASS, 1 test suite passed, 50 tests passed, 0 failed.

## File-by-file verdicts

### backend/src/apps/store-api/services/e-booklet.service.ts

Verdict: APPROVED

Findings:
- `updateQuota` now loads the target instance, throws `NotFoundError` when missing, computes reserved seats through `countReservedStudentSeats`, and rejects quota reductions below active student access plus pending unapproved purchase-link reservations. This satisfies the required fix.
- `countReservedStudentSeats` counts active student access rows and pending `e_booklet_student_purchase_links` with `access_id: null` whose invite is active and unexpired. The helper supports `excludePurchaseId` for approval flows, preventing a purchase link from blocking its own approval while still counting other pending reservations.
- `acceptFreeInvite` now uses `serializableTransaction` and calls `assertStudentSeatAvailable` before creating access. The quota decision includes active seats plus pending reservations and happens before `e_booklet_access.create`.
- `acceptInvitePasscode` now uses `serializableTransaction` and calls `assertStudentSeatAvailable` before creating access. It preserves existing max-use and already-has-access behavior while counting pending reservations for new access.
- Legacy `acceptInvite` now uses `serializableTransaction` and calls `assertStudentSeatAvailable` before creating access/redemption. It counts pending reservations through the same helper.
- Existing purchase checkout/approval paths also use the same helper; approval excludes its own purchase id as expected.

No blocking issues found.

### backend/tests/e-booklet/e-booklet.service.spec.ts

Verdict: APPROVED

Findings:
- Mock DB now includes `e_booklet_instances.findUnique`, enabling direct coverage of `updateQuota`'s new instance lookup.
- Added coverage rejects quota reductions below combined active and pending reserved seats.
- Added coverage verifies free invite and passcode invite acceptance reject before access creation when active seats plus pending reservations exhaust quota.
- Added coverage verifies legacy `acceptInvite` rejects when active seats plus pending reservations exhaust quota and does not create access or redemption.
- Existing focused tests continue covering public checkout pending reservation behavior and approval behavior.
- Focused Jest run passed all tests in this spec.

No blocking issues found.

## Notes

The tests meaningfully cover the quota-accounting behavior requested for updateQuota, free invite, passcode invite, and legacy invite paths. Serializable transaction usage for the invite acceptance paths was verified directly in the implementation diff/source during review; the newly added tests focus on behavioral quota protection rather than explicitly asserting `$transaction` options for each invite method.
