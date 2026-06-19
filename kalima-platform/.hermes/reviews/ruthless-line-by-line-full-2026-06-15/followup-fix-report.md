# Follow-up Fix Report
Verdict: READY_FOR_FINAL_REVIEW

## Fixed blockers
- [x] Milestone notification DB-backed idempotency — changed `backend/src/apps/store-api/prisma/migrations/20260614210000_e_booklet_milestone_notifications/migration.sql` to dedupe existing non-null recipient/message/entity duplicates and add nullable-safe partial unique index `ux_notifications_user_message_entity`; documented the DB-only partial unique index in `backend/src/apps/store-api/prisma/schema.prisma`; strengthened `backend/tests/e-booklet/e-booklet-phase1-migration.spec.ts` to fail without the unique index. Prisma client regenerated under `backend/src/apps/store-api/generated/prisma`.
- [x] Reward-disabled end-to-end contract — chose the minimal zero-reward contract. Changed `backend/src/apps/store-api/services/e-booklet-milestone.service.ts` so create/update/evaluation accept non-negative reward amounts, including explicit `0`; changed `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql` so milestone and achievement reward constraints allow `>= 0`; added backend create/update/evaluation zero-reward regression tests in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`; strengthened `frontend/tests/e-booklet-phase6-source-check.mjs` to assert the frontend zero payload is backed by backend validation and DB constraints. Prisma client regenerated under `backend/src/apps/store-api/generated/prisma`.

## Verification
- RED captured: `cd backend && npm test -- --runInBand tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts` failed as expected before implementation: missing `ux_notifications_user_message_entity`, old DB reward checks requiring `> 0`, and backend `Invalid reward amount.` for zero create/evaluation.
- GREEN focused: `cd backend && npm test -- --runInBand tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts && cd ../frontend && node tests/e-booklet-phase6-source-check.mjs` — PASS; 2 backend suites / 43 tests passed; Phase 6 source contract passed.
- `cd backend && npx prisma generate --schema=src/apps/store-api/prisma/schema.prisma` — PASS; Prisma Client 7.4.0 generated to `./src/apps/store-api/generated/prisma` in 263ms.
- `cd backend && npx prisma validate --schema=src/apps/store-api/prisma/schema.prisma` — PASS; schema valid.
- `cd backend && npm run build` — PASS (`tsc`).
- `cd backend && npm test -- --runInBand tests/e-booklet` — PASS; 6 suites / 127 tests passed.
- `cd frontend && node tests/e-booklet-phase5-source-check.mjs && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs` — PASS; all three source contracts passed.
- `cd frontend && npm run lint && npm run build` — PASS. Build completed in 661ms; existing warnings only: Node `module.register()` deprecation, browser externalization warning for `crypto` from `@embedpdf/snippet`, and large chunk warning.

## Notes for final reviewer
- Notification idempotency is now DB-backed by a partial unique index on `(user_id, message_key, entity_type, entity_id)` only when the nullable identity columns are non-null, matching the milestone notifier rows while avoiding unintended uniqueness for role/null-entity notifications.
- The notification migration deletes duplicate non-null identity rows before creating the unique index so upgraded databases do not fail if duplicates already exist.
- Disabled rewards now mean `rewardAmountSnapshot: 0` is valid from frontend payload through backend service validation and DB milestone/achievement constraints. Existing positive reward behavior remains valid; negative/NaN rewards still fail.
