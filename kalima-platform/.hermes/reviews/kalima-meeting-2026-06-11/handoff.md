# Kalima Meeting 2026-06-11 — Phase 5 Teacher Frontend Handoff

Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
Branch: `feat/kalima-meeting-2026-06-11`
Date: 2026-06-15

## Scope

Phase 5 teacher frontend: teacher milestone progress, access-code generation, terms gates, free-code tracking copy, reward claim terms modal, and wallet balance UI.

## Files changed in this phase

- `frontend/src/hooks/useEBookletAccess.js`
- `frontend/src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx`
- `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx`
- `frontend/src/locales/en/eBooklets.json`
- `frontend/src/locales/ar/eBooklets.json`
- `frontend/tests/e-booklet-phase5-source-check.mjs`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`
- `backend/tests/e-booklet/e-booklet-phase1-migration.spec.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`
- `backend/tests/e-booklet/e-booklet-phase4-notifications.spec.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone-notification.service.ts`
- `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql`
- `backend/src/apps/store-api/prisma/schema.prisma`
- `.local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md`

## Requirements covered

- Replaced old invite quota / remaining seats UI on teacher e-booklet list with milestone progress summary.
- Added milestone timeline section with achieved/current/remaining states.
- Shows remaining paid redemptions to the next milestone.
- Shows claimable reward amount/CTA when achievement metadata is present.
- Shows system motivational copy, active term name/date range, and teacher wallet balance.
- Refactored teacher invite management page into access-code management.
- Removed code-generation disablement based on old `remaining <= 0` seat count.
- Added code-generation terms modal before any paid/free code action.
- Added paid WhatsApp-message generation; each click calls backend `POST /teacher/e-booklets/:instanceId/access-codes` with `kind: "paid"`.
- Added paid code-only generation; each click calls backend and copies the returned raw code.
- Added free shared tracking code generation with explicit “tracking-only / no paid milestone progress” copy.
- Added reward claim terms modal; claiming calls `/teacher/e-booklet-milestone-achievements/:achievementId/claim`, then refreshes wallet and milestone state.
- Added EN/AR copy for new milestone/wallet/code-generation UI.

## Verification run

From `frontend/`:

```bash
node tests/e-booklet-phase5-source-check.mjs
npm run lint
npm run build
```

Result:
- Source contract passed.
- Backend e-booklet service suite passed: 19 tests.
- Focused backend e-booklet suite passed: 4 suites / 50 tests.
- Backend TypeScript build passed.
- ESLint passed.
- Vite production build passed.

## Ruthless review fixes applied

The user-requested ruthless review overturned the earlier approval with `REQUIRED_FIXES`. Fixes now applied:
- Milestone notification retry no longer resends teacher/admin emails when notification rows already exist; emails are only sent for newly created notification recipients.
- Backend reward claim now requires explicit `termsAccepted: true`; controller rejects direct POST bypass before calling the domain service.
- Frontend reward claim hook now sends `{ termsAccepted: true }` after the modal is accepted.
- Code-generation modal now renders backend `code_generation_terms`, not nonexistent `terms_text`.
- Reward-claim modal now renders backend `reward_claim_terms` with locale fallback.
- Terms acceptance DB uniqueness now uses partial unique indexes for code-generation NULL-achievement acceptances and reward-claim non-NULL achievement acceptances; the nullable composite Prisma uniqueness was removed.

Additional RED coverage added:
- Notification retry must not resend milestone emails when all notification rows already exist.
- Reward claim service and route require explicit terms acceptance.
- Migration must include separate partial unique indexes for `code_generation` and `reward_claim` terms acceptance.
- Frontend source contract asserts `code_generation_terms` and `reward_claim_terms` are used.

## Re-review fix

First critique returned `REQUIRED_FIXES` because `GET /teacher/e-booklet-milestones` returned raw milestones without teacher-scoped progress, achievement IDs, claim status, or reward data expected by the Phase 5 frontend.

Fix applied:
- `EBookletMilestoneService.listMilestones(termId, teacherId)` now enriches milestones with `progress_count`, `paid_redemptions_snapshot`, `achievement`, `achievement_id`, `milestone_achievement_id`, `claimed_at`, `reward_terms_accepted_at`, and `reward_amount`.
- Teacher controller now passes `currentUserId(req)` to `listMilestones`.
- Added regression test: `milestone service lists teacher-scoped progress and claimable achievement data`.

Earlier RED:
- `node tests/e-booklet-phase5-source-check.mjs` failed before implementation on missing milestone summary/timeline and old quota UI.

## Known verification gap

No live browser E2E proof has been captured yet for authenticated teacher flows because the current frontend repo has no Playwright/Vitest harness and no fixture/login setup was established in this phase. Reviewer should treat browser-proof checklist as pending unless they can stand up local full-stack fixtures.

## Review focus

Please review strictly for:

1. Product correctness:
   - No old seat/quota blocker remains in teacher code-generation UI.
   - Free shared codes are clearly tracking-only and excluded from paid milestone language.
   - Paid message/code buttons create new backend codes on every click.
   - Terms modal blocks code generation until acceptance.
   - Reward claim path is terms-gated and refreshes wallet.

2. Backend contract correctness:
   - Hook endpoints match Phase 3 backend routes.
   - Payloads use accepted backend fields: `kind`, `termId`, `maxRedemptions`.
   - Response handling matches `sanitizeAccessCodeResponse` shape (`data.code`, `data.whatsappMessage`, `data.record`).

3. UI/runtime safety:
   - No null-crashes when terms/milestones/wallet are absent.
   - Locale keys are valid in EN/AR.
   - Build output remains clean enough to ship.

4. Testing adequacy:
   - Source contract is useful but not a substitute for browser proof.
   - Identify required browser/E2E blockers if this cannot be accepted without live flow proof.

## Current verdict requested

Final ruthless re-review after the payload fix returned `APPROVED`.

Return `APPROVED` or `REQUIRED_FIXES`.
