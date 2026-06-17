You are a focused follow-up fixer agent for Kalima. The fresh re-review still found exactly two REQUIRED_FIXES after the first fixer agent. Your sole task is to fix ONLY these two blockers, with meaningful tests, then write a report. Do not touch unrelated code.

Repository git root: `/Users/ziadnasreldin/Documents/GitHub/Kalima`
App root: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`

Fresh re-review report:
`/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-report.md`

Write final follow-up fix report to:
`/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/followup-fix-report.md`

Fix exactly these blockers:

1. Milestone admin notification idempotency is not DB-backed.
   - Problem: `e-booklet-milestone-notification.service.ts` uses `createMany({ skipDuplicates: true })`, but Prisma schema/migration has no unique notification identity constraint, so duplicates can still race through.
   - Required: add a real DB unique key/index for per-recipient notification identity, e.g. `(user_id, message_key, entity_type, entity_id)` with nullable-safe handling suitable for this schema; update Prisma schema, migration SQL, generated client if needed, and tests.
   - Tests: add/strengthen a schema/migration invariant test that fails without the unique index; keep or improve service test so createMany skipDuplicates is backed by real schema proof.

2. Reward-disabled UI sends a backend-invalid payload.
   - Problem: frontend sends `rewardAmountSnapshot: 0` when rewards disabled, but backend service `positiveNumber` and migration DB constraint require `reward_amount_snapshot > 0`.
   - Required: implement a real end-to-end contract. Preferred minimal contract: allow zero reward amounts end-to-end for disabled rewards. Update backend create/update validation, Prisma schema/check constraints/migrations/generated client if needed, frontend/source check, and tests. If choosing explicit `reward_enabled`, align all layers instead; do not leave frontend/backend mismatch.
   - Tests: add backend service tests for create/update milestone with disabled/zero reward payload. Add/strengthen migration/source invariant so reward zero is allowed by DB contract and the frontend source check is not merely string-based.

Hard rules:
- Follow RED -> GREEN where practical: write/strengthen focused failing tests first, run them and capture failure, then implement, rerun pass.
- Do not weaken existing tests.
- Do not modify unrelated files except generated Prisma artifacts required by schema change.
- Run at minimum after fixes:
  - `cd backend && npx prisma generate --schema=src/apps/store-api/prisma/schema.prisma` if schema changed
  - `cd backend && npx prisma validate --schema=src/apps/store-api/prisma/schema.prisma`
  - `cd backend && npm run build`
  - `cd backend && npm test -- --runInBand tests/e-booklet`
  - `cd frontend && node tests/e-booklet-phase5-source-check.mjs && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs`
  - `cd frontend && npm run lint && npm run build` if frontend/source check changed

Final report format:
# Follow-up Fix Report
Verdict: READY_FOR_FINAL_REVIEW or BLOCKED

## Fixed blockers
- [x]/[ ] Milestone notification DB-backed idempotency — files changed, tests
- [x]/[ ] Reward-disabled end-to-end contract — files changed, tests

## Verification
- Commands run and exact outcomes

## Notes for final reviewer
- Any schema/migration/generation details and intentional contract decisions
