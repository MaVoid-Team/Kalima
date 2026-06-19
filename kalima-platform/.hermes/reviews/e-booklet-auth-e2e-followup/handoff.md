# E-booklet authenticated E2E follow-up handoff

## Scope
Continue the Kalima e-booklet V2 finish tracker by validating remaining authenticated admin/teacher/student browser flows and fixing any confirmed blocker found during that verification.

## Changed files for this follow-up
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
  - `listInstanceStudents` now passes `undefined` teacher scope for `/admin/...` requests so the admin devices page can list students for an instance. Teacher route still scopes to the current teacher.
- `.local-workdocs/hermes/plans/2026-06-10-kalima-e-booklet-finish-tracker.md`
  - Updated evidence/status checklist with authenticated desktop verification results.
- `.hermes/reviews/e-booklet-auth-e2e-followup/handoff.md`
  - Captures this follow-up review handoff and verification summary.

## Confirmed bug fixed
Admin devices page `/admin/e-booklet-instances/4/devices` called `GET /api/v2/admin/e-booklet-instances/4/students`; controller reused teacher-scoped `listInstanceStudents(instanceId, currentUserId(req))`, causing admin user id to be treated as teacher id and returning `Teacher e-booklet not found`. Patch scopes only non-admin paths to the current teacher.

## Verification run
- `cd backend && npm test -- --runInBand tests/e-booklet`
  - PASS: 2 suites, 67 tests.
- `cd backend && npm run build`
  - PASS: `tsc` completed.
- `cd frontend && npm run build`
  - PASS: Vite build completed; existing chunk-size warnings only.

## Browser/E2E evidence summary
Authenticated browser/context checks completed against local full stack:
- Admin instances page rendered quota/used/devices and Admin View/Devices actions.
- Teacher e-booklets page rendered delivered e-booklet with active status, quota, used seats, expiry/open/manage/students actions.
- Teacher invite pages rendered share URL, Copy link, Copy message, WhatsApp, and priced invite Copy passcode/passcode hint.
- Logged-out invite page forced Login/Register gate.
- Wrong passcode produced invalid-passcode error; correct passcode + terms granted access and redirected to viewer.
- Online purchase path created pending student purchase link; admin approval created access; student viewer loaded approved priced instance.
- Viewer showed hotspot reference numbers/shapes and multiple non-video hotspot cards opened.
- Device lock: different fingerprint returned 403 before reset/allowance; admin reset and allowance=2 allowed two new fingerprints.

## Local environment notes
Local DB was behind source schema during verification; patched local-only drift for columns used by source Prisma/schema (`e_booklet_invites.passcode_ciphertext`, `payment_methods.is_deleted`, `purchases.is_deleted`) to continue E2E. No secrets should be included in reports.

## Known limitations still not fully closed
- Mobile browser proof is still not recorded; Hermes browser viewport could not be resized.
- Full admin editor creation of every hotspot type and PDF/DOCX upload remains not browser-completed in this follow-up; backend route tests cover many validations.
- Video hotspot solo/no-autoplay was not verified because the local fixture used for viewer proof did not include a video hotspot.
