You are a fresh ruthless independent reviewer reviewing Phase 1 only: Database/domain model migration.

Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`

Review-only. Do not edit, stage, or commit. Read files from disk and run read-only verification commands only.

User explicitly requested a ruthless line-by-line Phase 1 review. You must inspect every scoped file below. Treat generated files, migration SQL, schema, and tracker as reviewable proof-bearing artifacts. Do not rely on implementer summaries. If you skip any scoped file, verdict must be REQUIRED_FIXES.

Phase 1 goal from tracker:
- Add explicit domain objects for terms, codes, redemptions, milestones, achievements, and wallet credit.
- Keep existing e-booklet tables intact.
- Do not drop `invite_quota` yet.
- Generate Prisma client.
- Migration must be non-destructive.

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

Also inspect these existing relations only as needed to validate schema integrity; include any blocker with file:line:
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts`
- `backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts`
- `backend/src/apps/store-api/generated/prisma/models/purchases.ts`
- `backend/src/apps/store-api/generated/prisma/models/users.ts`

Must verify line-by-line:
1. Migration is non-destructive: no drops/renames of existing production tables/columns, no destructive default changes, no dangerous backfill assumptions.
2. Existing e-booklet tables remain intact, including `invite_quota`.
3. New models exist for terms, access codes, redemptions, milestones, achievements, teacher wallet, wallet ledger, and teacher terms acceptance.
4. Enums exist and match intended domain: term status, access-code kind/status, teacher terms acceptance type, wallet ledger type/source.
5. Constraints/indexes actually enforce domain invariants where Phase 1 claims them:
   - active term uniqueness guard is realistic and DB-backed where claimed.
   - unique code hash.
   - paid code single-redemption guard or equivalent DB-level uniqueness exists.
   - achievement unique `(teacher_id, term_id, milestone_id)`.
   - teacher wallet unique per teacher.
6. Relations are valid and generated client files reflect schema.
7. Naming is consistent between schema, migration, and generated Prisma files.
8. Tracker truthfulness: Phase 1 status/checkmarks and verification claims must match actual files and commands.
9. Identify any schema design blockers that will cause Phase 2+ services/APIs to be impossible or unsafe, even if build passes.

Run these commands and include exact outcomes:
- `git status --short --branch`
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
- Explicit statement whether Phase 1 may remain COMPLETE or must be reverted to REQUIRED_FIXES
