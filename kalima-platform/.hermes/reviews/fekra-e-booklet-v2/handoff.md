# Feature Handoff: Fekra/Kalima E-booklet V2 Phase 6-7

## Original request

"before continueing the grill session i want you to run multiple agents to fully imeplement the frontend, backend, database of the v2 that we decided on, run as many agents as you need, start implementing on kalima
if there is old code then override it unless it was useful so keep it and build upon it"

## Implementation summary

Implemented the next V2 batch on top of the existing Kalima e-booklet module instead of rebuilding it.

Built in this batch:
- Phase 6 frontend UI surfaces for teacher invite/share management, student invite access, teacher/student dashboards, and admin access/device controls.
- Phase 7 backend/API/database foundation for expiry archiving and analytics.
- Phase 7 frontend analytics dashboards and admin CSV export controls.
- Fix cycle after independent reviews found required issues in invite terms payloads, public route gating, device routing, dashboard expired behavior, free invite analytics, anonymous tracking, passcode abuse protection, analytics sanitization, and analytics query validation.

Important product decisions reflected:
- Students must login/register before accepting access.
- Offline-paid passcode access remains available and requires terms acceptance.
- Online purchase from invite is fail-closed in the current frontend because there is no safe public invite-preview/payment-proof bridge wired yet; it is shown as unavailable rather than faked.
- Free/zero-price invite acceptance is fail-closed unless backend metadata can prove eligibility; no fake free grant UI.
- Teacher analytics hides internal price, admin notes, raw wrong passcodes, raw IP/user-agent, and per-student financial ledgers.
- Admin analytics can see sanitized security/ops signals and CSV export.

Known limitations / residual risks:
- No browser E2E suite exists in package scripts for this repo; local verification is lint/build/unit-focused.
- Full manual browser QA with real local admin/teacher/student accounts and seeded e-booklet data is still needed before production launch.
- Three unrelated dirty files existed before/through this work and were intentionally not edited: `backend/src/config/corsOptions.ts`, `backend/src/libs/auth/firebase.ts`, `frontend/src/components/admin/users/CreateUserDialog.jsx`.
- Some unrelated untracked reports/plans/context files exist in the worktree and are not part of this implementation.

## Changed files

Backend/API/database:
- `backend/package.json`: added archive-expired e-booklet npm script.
- `backend/scripts/archiveExpiredEBookletInstances.js`: new operational script with structured logs and dry-run support.
- `backend/src/apps/store-api/prisma/schema.prisma`: added e-booklet analytics event model.
- `backend/src/apps/store-api/prisma/migrations/20260605090000_e_booklet_analytics_events/migration.sql`: analytics events table and indexes.
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`: invite-open session cookie handling, analytics filter validation, admin/teacher analytics route handlers, CSV export handling.
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`: added invite-open and analytics routes.
- `backend/src/apps/store-api/services/e-booklet.service.ts`: analytics recording helpers, free/offline/online access events, passcode failure/block analytics, multidimensional passcode protection, teacher/admin analytics summaries, archive support integration.
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`: route tests for analytics/invite-open behavior.
- `backend/tests/e-booklet/e-booklet.service.spec.ts`: service tests for analytics, terms, passcode, free/offline/online access, expiry/archive.

Frontend:
- `frontend/src/App.jsx`: public invite route plus admin/teacher analytics/device routes.
- `frontend/src/components/admin/Sidebar.jsx`: admin e-booklet access/analytics navigation.
- `frontend/src/components/teacher/TeacherSidebar.jsx`: teacher analytics navigation.
- `frontend/src/hooks/admin/useAdminEBooklets.js`: admin instance/device/analytics hooks and CSV export helper.
- `frontend/src/hooks/useEBookletAccess.js`: invite accept payloads, student/teacher access hooks, teacher analytics hook.
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`: login/register gate, terms acceptance payload, offline passcode accept, fail-closed online/free actions.
- `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`: admin teacher/instance access and quota controls.
- `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`: admin device reset/allowance controls using route param plus safe manual fallback.
- `frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx`: admin analytics dashboard and CSV export UI.
- `frontend/src/pages/teacher/e-booklets/TeacherEBookletAnalyticsPage.jsx`: teacher scoped analytics dashboard.
- `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx`: improved invite sharing/passcode/zero-price handling.
- `frontend/src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx`: expiry/device status and analytics action.
- `frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx`: expiry/device status and expired-block behavior.
- `frontend/src/locales/en/admin.json`, `frontend/src/locales/ar/admin.json`: admin nav translations.
- `frontend/src/locales/en/eBooklets.json`, `frontend/src/locales/ar/eBooklets.json`: e-booklet UI translations.
- `frontend/src/locales/en/teacher.json`, `frontend/src/locales/ar/teacher.json`: teacher nav translations.

Planning/review:
- `.hermes/plans/2026-06-02-e-booklet-v2-subagent-execution-tracker.md`: updated Phase 6/7 status with verification notes.
- `.hermes/reviews/fekra-e-booklet-v2/handoff.md`: this handoff.

## How to test

Backend focused tests/build:
```sh
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
```

Frontend lint/build:
```sh
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run lint
npm run build
```

Manual browser QA still needed with real seeded accounts/data:
- Admin: `/admin/e-booklet-instances`, `/admin/e-booklet-instances/:instanceId/devices`, `/admin/e-booklet-analytics`.
- Teacher: `/teacher/e-booklets`, `/teacher/e-booklets/:instanceId/invites`, `/teacher/e-booklet-analytics`.
- Student/public: `/e-booklet-invite/:token`, `/student/e-booklets`, viewer routes.

Expected behavior:
- Logged-out invite visitors see login/register gate instead of backend POST attempt.
- Offline passcode accept sends `termsAccepted: true` and `termsVersion`.
- Online/free invite buttons do not fabricate unavailable flows.
- Admin devices page respects the `:instanceId` route parameter.
- Expired dashboard cards do not navigate into viewer.
- Analytics routes return scoped/sanitized summaries; teacher output excludes internal/admin/security raw fields.

## Tests run

- `cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand && npm run build`: PASS. 2 suites passed, 52 tests passed, TypeScript build passed.
- `cd frontend && npm run lint && npm run build`: PASS. ESLint passed; Vite production build passed with existing crypto externalization and large chunk warnings only.
- `git diff --check -- . ':(exclude)backend/src/config/corsOptions.ts' ':(exclude)backend/src/libs/auth/firebase.ts' ':(exclude)frontend/src/components/admin/users/CreateUserDialog.jsx'`: PASS, no whitespace errors.

## Git info

- Branch: `codex/e-booklet-editor-autodetect`
- Base/HEAD before this batch: `485e1338`
- Commit status: not committed in this session.
- Worktree note: protected unrelated dirty files remain outside this feature batch.

## Frontend/backend/database notes

Frontend routes/components:
- Public invite: `/e-booklet-invite/:token`.
- Admin access/devices/analytics: `/admin/e-booklet-instances`, `/admin/e-booklet-instances/:instanceId/devices`, `/admin/e-booklet-analytics`.
- Teacher analytics: `/teacher/e-booklet-analytics`.

Backend endpoints/services:
- `GET /api/v2/e-booklet-invites/:token/open` records anonymous/logged-in invite opens.
- `POST /api/v2/e-booklet-invites/:token/accept` handles access acceptance paths with terms and security metadata.
- `GET /api/v2/teacher/e-booklet-analytics` returns scoped teacher analytics.
- `GET /api/v2/admin/e-booklet-analytics` returns admin analytics.
- `GET /api/v2/admin/e-booklet-analytics.csv` returns admin CSV export.
- Existing admin instance/device endpoints are used by the admin UIs.

Database:
- New migration: `20260605090000_e_booklet_analytics_events`.
- New table/model: `e_booklet_analytics_events` with indexed event/source/date dimensions and sanitized metadata.

## Reviewer focus areas

Please inspect carefully:
- Student invite auth/terms/passcode flow and fail-closed online/free behavior.
- Admin device page route-param behavior and lack of fake student discovery.
- Analytics auth/scoping: teacher vs admin response fields.
- Raw secret/private data leakage: wrong passcodes, raw IP/user-agent, internal price, admin notes.
- Passcode failure/blocking behavior and analytics recording.
- Migration safety and query validation.
- Whether tracker wording overclaims browser/manual E2E. It should not claim production launch readiness.

## Fix cycle notes

Independent review cycle already completed during this implementation batch:
- Phase 6 first review: `REQUEST_CHANGES`; fixed all required items; re-review result `PASS — APPROVED`.
- Phase 7 backend/API first review: `REQUEST_CHANGES`; fixed all required items; re-review result `PASS / APPROVED`.

Final combined critique result:
- First final combined critique: `REQUEST_CHANGES` with two required fixes.
  - R1 analytics query keys used camelCase while backend expects snake_case.
  - R2 public invite page did not call invite-open analytics endpoint.
- Fixes made after first final critique:
  - Added analytics query-key mapping in frontend hooks so `startDate`, `endDate`, `teacherId`, `instanceId`, and `studentId` are sent as `start_date`, `end_date`, `teacher_id`, `instance_id`, and `student_id` for teacher/admin analytics and CSV export.
  - Added `openInvite(token)` hook and mounted call in `AcceptEBookletInvitePage.jsx` so normal public invite visits hit `GET /e-booklet-invites/:token/open`, recording `invite_opened` and establishing/reusing the anonymous invite cookie.
- Re-ran `cd frontend && npm run lint && npm run build`: PASS.
- Re-ran `git diff --check -- . ':(exclude)backend/src/config/corsOptions.ts' ':(exclude)backend/src/libs/auth/firebase.ts' ':(exclude)frontend/src/components/admin/users/CreateUserDialog.jsx'`: PASS.
- Final re-review requested after these fixes.
