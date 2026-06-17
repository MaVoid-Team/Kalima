You are a fresh ruthless independent reviewer re-reviewing Phase 1 fixes after a prior REQUIRED_FIXES verdict.

Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`

Review-only. Do not edit, stage, or commit. Read files from disk and run read-only verification commands only.

Previous Phase 1 required-fix report: `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-review.md`

User explicitly requested line-by-line ruthless review. You must inspect every scoped file below. Treat generated files, migration SQL, schema, tests, and tracker as reviewable proof-bearing artifacts. Do not rely on implementer summaries. If you skip any scoped file, verdict must be REQUIRED_FIXES.

Scoped Phase 1 files:
- `.local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md`
- `backend/src/apps/store-api/prisma/schema.prisma`
- `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql`
- `backend/src/apps/store-api/generated/prisma/browser.ts`
- `backend/src/apps/store-api/generated/prisma/client.ts`
- `backend/src/apps/store-api/generated/prisma/commonInputTypes.ts`
- `backend/src/apps/store-api/generated/prisma/enums.ts`
- `backend/src/apps/store-api/generated/prisma/internal/class.ts`
- `backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts`
- `backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts`
- `backend/src/apps/store-api/generated/prisma/models.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts`
- `backend/src/apps/store-api/generated/prisma/models/purchases.ts`
- `backend/src/apps/store-api/generated/prisma/models/users.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_code_redemptions.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_codes.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestone_achievements.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_teacher_terms_acceptances.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_terms.ts`
- `backend/src/apps/store-api/generated/prisma/models/teacher_wallet_ledger.ts`
- `backend/src/apps/store-api/generated/prisma/models/teacher_wallets.ts`
- `backend/tests/e-booklet/e-booklet-phase1-migration.spec.ts`

Must verify whether prior Phase 1 blockers are fixed:
1. Active term uniqueness is now truly DB-backed, not dependent on nullable `active_guard`. Specifically verify partial unique indexes for one global active term and one active term per template, and verify Prisma schema no longer claims a fake nullable `@unique` active guard.
2. Paid single-redemption guard is now truly DB-backed, not dependent on nullable service-populated `paid_redemption_guard`. Specifically verify partial unique index on `access_code_id` where `counted_for_progress = true`, and verify Prisma schema no longer claims fake nullable `@unique` paid guard.
3. Migration remains non-destructive.
4. Existing e-booklet tables remain intact, including `invite_quota`.
5. Generated Prisma files reflect the updated schema after generation.
6. Test coverage proves the two DB invariant fixes and fails against the old migration text.
7. Tracker truthfulness: Phase 1 status/checkmarks/current pointer and verification claims must match actual files and commands.

Run these commands and include exact outcomes:
- `git status --short --branch`
- `npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase1-migration.spec.ts --runInBand`
- `npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.service.spec.ts --runInBand`
- `npx prisma validate --schema src/apps/store-api/prisma/schema.prisma`
- `npx prisma generate --schema src/apps/store-api/prisma/schema.prisma`
- `npm run build`

Return exactly:
- Verdict: APPROVED or REQUIRED_FIXES
- Blocking findings with file:line and exact minimal fix
- Non-blocking notes
- Verification commands run and exact outcomes
- File-by-file verdict table for every scoped file
- Tracker truthfulness assessment
- Explicit statement whether Phase 1 may move from IN REVIEW to COMPLETE or must revert to REQUIRED_FIXES
