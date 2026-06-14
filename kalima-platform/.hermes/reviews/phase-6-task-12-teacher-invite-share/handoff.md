# Feature Handoff: Phase 6 Task 12 — Teacher invite/share page

## Original request

Continue from `/private/tmp/kalima-e-booklet-v2-handoff-2026-06-02.md` and verify/review/commit Phase 6 Task 12 slice.

Task 12 target from handoff context: teacher invite/share page should show expiry, quota/used seats/devices, support copy invite link, passcode availability/copy behavior, combined copy template, WhatsApp share, and zero-price copy.

## Implementation summary

- Expanded the teacher invite management page with invite quota, used seats, used devices, booklet expiry, and public student price/free-access badges.
- Added invite creation controls for optional max uses, optional expiry, optional passcode, and optional passcode hint.
- Added latest-created invite display with shareable link, safe passcode one-time display/copy when available, combined share text, and WhatsApp share.
- Added existing invite card share actions: same-origin invite link construction, copy link, copy combined message, WhatsApp, open link, invite expiry, remaining per-link uses, and passcode hint/status display.
- Added English/Arabic i18n for the invite/share UX.
- Wired backend `used_devices_count` through teacher/student e-booklet access payloads used by the frontend page.
- Hardened invite persistence:
  - raw invite token remains hashed for redemption lookup;
  - teacher re-share token is stored encrypted at rest in `share_token_ciphertext`;
  - plaintext passcodes are not persisted/re-listed;
  - immediate create response returns generated passcode only once when the backend generated it.
- Hardened frontend invite URL handling to same-origin `/e-booklet-invite/<token>` URLs only.

## Changed files

- `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx`: invite/share UI, passcode and WhatsApp copy flows, safe link construction, quota/used seats/devices display.
- `frontend/src/locales/en/eBooklets.json`: English invite/share copy.
- `frontend/src/locales/ar/eBooklets.json`: Arabic invite/share copy.
- `backend/src/apps/store-api/services/e-booklet.service.ts`: used-device counts; encrypted invite token persistence/re-listing; safe invite payloads without plaintext passcode re-listing.
- `backend/src/apps/store-api/prisma/schema.prisma`: added `share_token_ciphertext` on `e_booklet_invites`.
- `backend/src/apps/store-api/prisma/migrations/20260604130000_e_booklet_invite_share_fields/migration.sql`: migration for encrypted invite share token storage.

## How to test

- Backend focused tests/build:
  - `cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand && npm run build`
- Prisma schema validation:
  - `cd backend && npx prisma validate --schema src/apps/store-api/prisma/schema.prisma`
- Frontend lint/build:
  - `cd frontend && npm run lint && npm run build`
- Diff hygiene:
  - `git diff --check -- frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx frontend/src/locales/en/eBooklets.json frontend/src/locales/ar/eBooklets.json backend/src/apps/store-api/services/e-booklet.service.ts backend/src/apps/store-api/prisma/schema.prisma backend/src/apps/store-api/prisma/migrations/20260604130000_e_booklet_invite_share_fields/migration.sql`

Expected behavior:
- Teacher invite page shows quota, used seats, remaining quota, used devices, booklet expiry, and price/free-access copy.
- Creating an invite yields a copyable `/e-booklet-invite/<token>` same-origin link.
- If backend generates a passcode, it is shown/copyable once in the latest-created panel.
- Existing invites can be re-shared by decrypted token but do not expose persisted plaintext passcodes.
- Existing passcode-protected invites show that passcode is required and use hint/status copy instead of leaking the code.
- Zero-price/free-access copy hides passcode display/copy and says no passcode is needed.

## Tests run

- `npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand && npm run build` from `backend`: PASS — 2 test suites passed, 50 tests passed, backend `tsc` passed.
- `npx prisma validate --schema src/apps/store-api/prisma/schema.prisma` from `backend`: PASS — schema valid.
- `npm run lint && npm run build` from `frontend`: PASS — ESLint passed, Vite production build passed. Warnings only: Node `module.register()` deprecation, embedpdf browser crypto externalization, existing large chunk warning.
- `git diff --check -- <Task 12 files>`: PASS — no whitespace errors.

## Git info

- Branch: `codex/e-booklet-editor-autodetect`
- Base/current HEAD before commit: `8697d281`
- Commit SHA, if committed: pending

## Frontend/backend/database notes

- Frontend route/component: `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx`.
- Backend service: `EBookletService.createInvite`, `listInvites`, `listUserEBooklets`, `revokeStudentAccess`, and student-access list payload mapping.
- Database: `e_booklet_invites.share_token_ciphertext` stores AES-256-GCM ciphertext for teacher re-share token. `token_hash` remains the unique redemption lookup. Plaintext passcodes are not stored.
- Env note: invite token encryption uses `E_BOOKLET_INVITE_TOKEN_SECRET`, falling back to `JWT_SECRET`, then dev fallback.

## Reviewer focus areas

- Confirm no `token_hash` or plaintext passcode leaks in teacher invite list responses.
- Confirm encrypted token storage/re-share behavior is acceptable for the product need to re-copy existing invite links.
- Confirm zero-price copy/passcode behavior.
- Confirm used-device count is wired to the endpoint/hook used by the teacher page.
- Confirm same-origin invite URL hardening is sufficient.

## Fix cycle notes

- Earlier review requested: wire `used_devices_count`; make `has_passcode` reflect hash, not only display; ensure zero-price latest share/copy hides passcode; avoid plaintext passcode/token storage and unsafe absolute invite URLs.
- First critique report verdict was `REQUEST_CHANGES` for missing teacher ownership enforcement in `revokeStudentAccess`.
- Fixes applied:
  - `used_devices_count` mapped from active devices.
  - `has_passcode` derives from `passcode_hash`.
  - plaintext passcode persistence/re-listing removed.
  - share token persistence changed from plaintext `share_token` to encrypted `share_token_ciphertext`.
  - invite links restricted to same-origin `/e-booklet-invite/` paths.
  - `revokeStudentAccess` now verifies `e_booklet_instances.findFirst({ id, teacher_id: actorUserId })` before audit/update and throws `Teacher e-booklet not found` without side effects when ownership is missing.
  - Added two focused service tests for cross-teacher revoke denial and successful owner revoke.
  - all verification commands above re-run after final fixes.
