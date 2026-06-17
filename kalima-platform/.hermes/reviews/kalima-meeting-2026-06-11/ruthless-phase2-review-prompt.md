You are a ruthless independent reviewer. Review the implementation work in repo `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`.

This is a REVIEW-ONLY task. Do not edit files. Do not stage files. Do not commit. Read from disk and run read-only verification commands only.

Scope: review every listed file explicitly, line-by-line where handwritten, and include generated/migration/tracker files in the file-by-file verdict. Treat docs/trackers as reviewable proof-bearing artifacts. If you skip any scoped file, verdict must be REQUIRED_FIXES.

User specifically asked for a ruthless background reviewer to review the work and code line by line explicitly.

Changed/created scoped files to review:
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
- `backend/src/apps/store-api/services/e-booklet-access-code.service.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/src/apps/store-api/services/e-booklet-redemption.service.ts`
- `backend/src/apps/store-api/services/e-booklet-terms.service.ts`
- `backend/src/apps/store-api/services/teacher-wallet.service.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`

Also review interactions with existing code where directly relevant:
- `backend/src/apps/store-api/services/e-booklet.service.ts`
- `backend/tests/e-booklet/e-booklet.service.spec.ts` only for regression compatibility, but note it was dirty before this scope.

Review requirements:
1. Read every scoped file from disk. For generated files, verify they correspond to schema/migration and do not expose raw code values or break model exports; you may summarize generated content but every generated file must appear in verdict list.
2. For handwritten service/test files, inspect line-by-line and cite concrete `file:line` findings.
3. Verify business rules:
   - no seat-limit blocker in new access-code redemption flow.
   - paid code is unique, hashed, raw returned only at creation, no raw persistence/logging.
   - paid code binds to first student and rejects other students after redemption.
   - repeat same-student redemption does not increment progress.
   - free shared code tracks entry but excludes milestone progress.
   - milestone progress uses only first successful paid accesses.
   - wallet credit does not expire and supports leftover/partial spend.
   - wallet cannot stack with normal coupon/promo.
   - terms are required before teacher code generation/copy; if not actually enforceable yet because Phase 3 API not done, classify honestly.
4. Verify request/response shape readiness for Phase 3 APIs, auth/role assumptions, error handling, race/idempotency issues, Prisma schema constraints, and migration safety.
5. Run read-only checks if possible:
   - `npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase2-services.spec.ts --runInBand`
   - `npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts --runInBand`
   - `npm run build`
   - `npx prisma validate --schema src/apps/store-api/prisma/schema.prisma`
6. Return a clear verdict: `APPROVED` or `REQUIRED_FIXES`.
7. If REQUIRED_FIXES, list blocking issues only with file:line, exact impact, and suggested minimal fix. Also list non-blocking notes separately.
8. Include a file-by-file verdict table containing every scoped file above.
9. State whether the tracker’s Phase 2 completion claims are truthful based on real files/tests.

Final response format:
- Verdict: APPROVED or REQUIRED_FIXES
- Blocking findings
- Non-blocking notes
- Verification commands run and exact outcomes
- File-by-file verdict table
- Tracker truthfulness assessment
