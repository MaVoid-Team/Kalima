# Kalima E-booklet Required Blocker Fix Handoff

Scope: Finish the interrupted fixes for the REQUIRED_FIXES listed in `.hermes/reviews/ruthless-line-by-line-2026-06-15/report.md`, focused on e-booklet URL+code redemption, milestone evaluation/progress, reward validation, and frontend redemption navigation.

## Blockers addressed

1. Existing same-student redemption no longer returns a raw stale redemption. `EBookletRedemptionService.redeemCode` now reactivates/upserts viewer access with `grantViewerAccess`, links missing `access_id`, and returns an explicit DTO with `bookletInstanceId`, `accessId`, and `countedForProgress` aliases. Re-review fix: same-student paid re-redemption is allowed when the code is in its normal post-use `redeemed` state and `bound_student_id` matches the student; different students and disabled/expired statuses remain rejected.
2. Redeeming a disabled/revoked/non-active code is rejected before any existing-redemption shortcut via `assertCodeExistsAndRedeemable`.
3. Regular milestone evaluation no longer re-notifies existing achievements; only newly created achievements are placed in `notifyable`, and `awarded` now represents newly awarded achievements.
4. Milestone reward snapshots are required to be positive on create/update and again at award time before creating a claimable achievement.
5. Admin progress now groups counted paid redemptions by teacher and returns `teacherProgress` rows with teacher id/name, paid count, and achievements. Free shared entries are excluded by the query (`counted_for_progress: true` + paid code relation).
6. Student code redemption frontend normalizes both direct payload and `{ data: payload }` shapes and navigates when `bookletInstanceId`/`booklet_instance_id` is present for paid or free code redemptions.

## Files changed in this fix pass

- `backend/src/apps/store-api/services/e-booklet-redemption.service.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`
- `backend/tests/e-booklet/e-booklet-phase4-notifications.spec.ts`
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx` (already patched by interrupted agent; verified here)

## Verification

Backend:

```sh
cd backend && npm run build && npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet-phase4-notifications.spec.ts
```

Result: PASS — 5 suites, 114 tests.

Frontend:

```sh
cd frontend && node tests/e-booklet-phase5-source-check.mjs && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs && npm run lint && npm run build
```

Result: PASS. Vite emitted existing chunk-size/browser-compatibility warnings only.

## Reviewer focus

Please verify the six REQUIRED_FIXES above against live source, not this summary. Confirm tests cover the fixed paths and call out any remaining blocker precisely.
