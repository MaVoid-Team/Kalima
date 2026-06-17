# Kalima Phase 6 Admin Terms/Milestones — Re-review Handoff

Scope: Phase 6 admin frontend for Kalima meeting 2026-06-11 implementation tracker, plus backend route/schema support needed by the admin UI.
Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
Branch: `feat/kalima-meeting-2026-06-11`

## User-facing goal
Admin/SubAdmin can manage e-booklet terms and dynamic milestones from the admin dashboard:
- terms table and create/edit form
- set-active term action
- milestones table and create/edit form
- milestone reorder action
- active/inactive controls that remain manageable after deactivation
- pricing/tier fields
- terms/policy fields
- persisted notification recipients field
- reward enabled/disabled behavior
- no admin-authored motivational message field
- achievement/claim status view

## First critique result
Initial ruthless review returned `REQUIRED_FIXES`:
1. Backend admin terms/milestones routes allowed `Moderator` while the frontend route only allows `Admin`/`SubAdmin`.
2. Admin milestone listing reused active-only teacher listing, so inactive milestones disappeared after deactivation.
3. `notificationRecipients` was a fake UI/backend contract and was not persisted.
4. The source contract was too weak to catch these backend/contract issues.

## Fixes applied after critique
- Added `adminManagerAuth` in `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts` for Admin/SubAdmin-only terms/milestones/progress management routes.
- Updated `eBookletController.listMilestones` to detect admin routes and call milestone listing as unscoped admin with `includeInactive=true`; teacher routes remain teacher-scoped and active-only.
- Extended `EBookletMilestoneService.listMilestones(termId, teacherId, includeInactive=false)` so admin can list inactive rows while teacher listings remain active-only with progress enrichment.
- Added persisted `notification_recipients` field to Prisma schema and the terms/milestones migration, regenerated Prisma client, and wired create/update service payloads with validation/defaulting to `admins` or `teacher_and_admins`.
- Strengthened `frontend/tests/e-booklet-phase6-source-check.mjs` to assert backend manager auth, admin milestone list route, admin-vs-teacher list scoping, inactive inclusion, notification persistence, schema, and migration contracts.
- Added/updated backend tests:
  - service test for admin include-inactive milestone listing without teacher progress enrichment
  - service test for notification recipient create/update persistence/defaulting
  - route test that Moderator is forbidden from admin milestone management
  - route assertion that admin milestone list calls `listMilestones(1, undefined, true)` and teacher list calls `listMilestones(undefined, 9, false)`

## Scoped files to review line-by-line
Frontend:
- `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx` (new)
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/src/App.jsx`
- `frontend/src/components/admin/Sidebar.jsx`
- `frontend/src/locales/en/eBooklets.json`
- `frontend/src/locales/ar/eBooklets.json`
- `frontend/src/locales/en/admin.json`
- `frontend/src/locales/ar/admin.json`
- `frontend/tests/e-booklet-phase6-source-check.mjs` (new)

Backend/support:
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/src/apps/store-api/prisma/schema.prisma`
- `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`

## Verification run after fixes
- `cd backend && npx prisma generate --schema src/apps/store-api/prisma/schema.prisma` → passed.
- `cd frontend && node tests/e-booklet-phase6-source-check.mjs` → passed: `Phase 6 admin frontend source contract passed`.
- `cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand` → passed, 2 suites / 41 tests.
- `cd frontend && npm run lint` → passed.
- `cd backend && npm run build` → passed.
- Scoped `git diff --check` over the files listed above → passed.
- `cd frontend && npm run build` → passed. Existing Vite warnings only: externalized `crypto` from embedpdf and large chunks.
- `cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet-phase4-notifications.spec.ts --runInBand` → passed, 4 suites / 52 tests.

## Known limitations / boundaries
- This is source/build/backend-route proof, not a live authenticated browser E2E. Do not approve any tracker row that specifically requires browser visual/E2E proof.
- Working tree has many unrelated dirty files from earlier phases. Review only scoped files above unless a direct regression requires expansion.
- `rewardEnabled=false` maps to `rewardAmountSnapshot: 0`; no separate backend `rewardEnabled` field is persisted. This was explicitly classified as non-blocking by the first reviewer.

## Requested re-review
Read the handoff and every scoped file from disk line-by-line. Verify every prior blocker is actually fixed. Return `APPROVED` only for this scoped Phase 6 implementation if backend/frontend/schema/tests are contractually sound and no blocker remains. Otherwise return `REQUIRED_FIXES` with file:line blockers.
