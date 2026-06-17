# Kalima Phase 6 Admin Terms/Milestones — Handoff

Scope: Phase 6 admin frontend for Kalima meeting 2026-06-11 implementation tracker, plus backend route/schema support needed by the admin UI.
Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
Branch: `feat/kalima-meeting-2026-06-11`

Admin/SubAdmin can manage e-booklet terms and dynamic milestones from the admin dashboard: terms table/forms, set-active, milestones table/forms, reorder, active/inactive controls, pricing/tier fields, terms/policy fields, persisted notification recipients, reward enabled/disabled behavior, no motivational-message field, and achievement/claim status view.

First critique returned REQUIRED_FIXES for Moderator route access, inactive milestones disappearing from admin listing, non-persisted notificationRecipients, and weak source contracts. Fixes applied:
- Added Admin/SubAdmin-only `adminManagerAuth` for terms/milestones/progress management routes.
- Admin milestone listing now calls `listMilestones(termId, undefined, true)`; teacher listing remains `listMilestones(termId, teacherId, false)`.
- `EBookletMilestoneService` supports includeInactive and persists validated `notification_recipients`.
- Prisma schema/migration/generated client updated for `notification_recipients`.
- Source contract strengthened to check backend auth/scoping/schema/migration contracts.
- Backend service/route tests added for inactive admin listing, notification recipient persistence, Moderator denial, and admin/teacher list calls.

Scoped files:
- `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx`
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/src/App.jsx`
- `frontend/src/components/admin/Sidebar.jsx`
- `frontend/src/locales/en/eBooklets.json`
- `frontend/src/locales/ar/eBooklets.json`
- `frontend/src/locales/en/admin.json`
- `frontend/src/locales/ar/admin.json`
- `frontend/tests/e-booklet-phase6-source-check.mjs`
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/src/apps/store-api/prisma/schema.prisma`
- `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`

Verification:
- `npx prisma generate --schema src/apps/store-api/prisma/schema.prisma` passed.
- `frontend && node tests/e-booklet-phase6-source-check.mjs` passed.
- `backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand` passed, 2 suites / 41 tests.
- `frontend && npm run lint` passed.
- `backend && npm run build` passed.
- Scoped `git diff --check` passed.
- `frontend && npm run build` passed with existing Vite warnings.
- `backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet-phase4-notifications.spec.ts --runInBand` passed, 4 suites / 52 tests.

Boundary: no live authenticated browser E2E was run.