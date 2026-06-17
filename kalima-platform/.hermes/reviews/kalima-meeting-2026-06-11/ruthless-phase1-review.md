Verdict: REQUIRED_FIXES

Blocking findings with file:line and exact minimal fix

1. Claimed “unique active-term service/DB guard” is not actually DB-backed against active rows.
   - backend/src/apps/store-api/prisma/schema.prisma:959-966
   - backend/src/apps/store-api/prisma/schema.prisma:983-984
   - backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql:13-14
   - backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql:121
   - .local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md:140-141
   - Problem: `active_guard String? @unique` / `CREATE UNIQUE INDEX ... active_guard` only protects values the service chooses to write. PostgreSQL allows multiple NULLs, so multiple rows can be `status = 'active'` with `active_guard = NULL`. The database does not enforce “one active term” or “one active term per template”.
   - Exact minimal fix: replace/augment this with a real DB invariant in the migration, e.g. a partial unique index on active terms. If the intended rule is one active term globally:
     `CREATE UNIQUE INDEX ux_e_booklet_terms_one_active ON e_booklet_terms ((true)) WHERE status = 'active';`
     If the intended rule is one active term per template plus one global active term, use partial indexes for `template_id IS NOT NULL` and `template_id IS NULL`. Then update schema/tracker wording so the claimed DB guard matches the actual invariant.

2. Claimed “paid code single-redemption guard” is not reliably DB-enforced.
   - backend/src/apps/store-api/prisma/schema.prisma:1159-1167
   - backend/src/apps/store-api/prisma/schema.prisma:1178
   - backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql:107-115
   - backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql:152-153
   - .local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md:142-143
   - Problem: `paid_redemption_guard String? @unique` only works if service code always writes a non-null guard. PostgreSQL allows multiple NULLs. `@@unique([access_code_id, student_id])` prevents duplicate redemption by the same student, but does not prevent two different students from redeeming the same paid code if `paid_redemption_guard` is omitted/null or incorrectly populated. That makes the Phase 1 DB invariant weaker than the tracker claims.
   - Exact minimal fix: add a DB-level uniqueness rule that does not depend on nullable service-populated guard text. Minimal safe option for the current schema:
     `CREATE UNIQUE INDEX ux_e_booklet_paid_code_one_counted_redemption ON e_booklet_access_code_redemptions(access_code_id) WHERE counted_for_progress = true;`
     Better: add a redemption kind snapshot or derive with a trigger, then partial unique on paid redemptions. Update Prisma schema/tracker accordingly.

Non-blocking notes

- Migration is non-destructive in the narrow sense: I found only `CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX`, and `ALTER TABLE ... ADD CONSTRAINT`; no `DROP`, `ALTER COLUMN DROP`, destructive rename, destructive default change, or data backfill.
- Existing e-booklet tables remain intact in schema; `invite_quota` remains present at schema.prisma:996 and generated e_booklet_instances output includes it.
- Generated Prisma files do reflect the new schema after `npx prisma generate`.
- Design risk for Phase 2+: several cross-table consistency rules are still service-only, not DB-enforced:
  - `e_booklet_access_code_redemptions.booklet_instance_id` can disagree with the referenced access code’s instance.
  - `access_id` can point to an access record for a different student/instance.
  - `teacher_wallet_ledger.teacher_id` can disagree with `teacher_wallets.teacher_id`.
  These are not in the explicit Phase 1 claimed constraints, so I am not blocking on them, but Phase 2 services must guard them transactionally.

Verification commands run and exact outcomes

1. `git status --short --branch`
Exit code: 0

```txt
## feat/kalima-meeting-2026-06-11
 M ../.gitignore
 D .hermes/plans/2026-06-02-e-booklet-v2-subagent-execution-tracker.md
 M .hermes/reviews/fekra-e-booklet-v2/handoff.md
 D .hermes/reviews/phase-6-task-12-teacher-invite-share/critique-report.md
 D .hermes/reviews/phase-6-task-12-teacher-invite-share/handoff.md
 M backend/src/apps/store-api/generated/prisma/browser.ts
 M backend/src/apps/store-api/generated/prisma/client.ts
 M backend/src/apps/store-api/generated/prisma/commonInputTypes.ts
 M backend/src/apps/store-api/generated/prisma/enums.ts
 M backend/src/apps/store-api/generated/prisma/internal/class.ts
 M backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts
 M backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts
 M backend/src/apps/store-api/generated/prisma/models.ts
 M backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts
 M backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts
 M backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts
 M backend/src/apps/store-api/generated/prisma/models/purchases.ts
 M backend/src/apps/store-api/generated/prisma/models/users.ts
 M backend/src/apps/store-api/prisma/schema.prisma
 M backend/src/config/corsOptions.ts
 M backend/src/libs/auth/firebase.ts
 M backend/tests/e-booklet/e-booklet.service.spec.ts
 D docs/superpowers/plans/2026-05-06-e-booklet-module.md
 M frontend/src/components/admin/users/CreateUserDialog.jsx
 M frontend/src/components/student/StudentSidebar.jsx
 M frontend/src/layouts/Navbar.jsx
 M frontend/src/locales/ar/student.json
 M frontend/src/locales/en/student.json
 D reports/e-booklet-launch-scale-readiness.md
 D reports/firstlines.csv
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_access_code_redemptions.ts
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_access_codes.ts
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_milestone_achievements.ts
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_teacher_terms_acceptances.ts
?? backend/src/apps/store-api/generated/prisma/models/e_booklet_terms.ts
?? backend/src/apps/store-api/generated/prisma/models/teacher_wallet_ledger.ts
?? backend/src/apps/store-api/generated/prisma/models/teacher_wallets.ts
?? backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/
?? backend/src/apps/store-api/services/e-booklet-access-code.service.ts
?? backend/src/apps/store-api/services/e-booklet-milestone.service.ts
?? backend/src/apps/store-api/services/e-booklet-redemption.service.ts
?? backend/src/apps/store-api/services/e-booklet-terms.service.ts
?? backend/src/apps/store-api/services/teacher-wallet.service.ts
?? backend/tests/e-booklet/e-booklet-phase2-services.spec.ts
```

2. `npx prisma validate --schema src/apps/store-api/prisma/schema.prisma`
Exit code: 0

```txt
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from src/apps/store-api/prisma/schema.prisma.
The schema at src/apps/store-api/prisma/schema.prisma is valid 🚀
```

3. `npx prisma generate --schema src/apps/store-api/prisma/schema.prisma`
Exit code: 0

```txt
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from src/apps/store-api/prisma/schema.prisma.

✔ Generated Prisma Client (7.4.0) to ./src/apps/store-api/generated/prisma in 199ms
```

4. `npm run build`
Exit code: 0

```txt
> backend@1.0.0 build
> tsc
```

File-by-file verdict table for every scoped file

| File | Verdict |
| --- | --- |
| .local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md | REQUIRED_FIXES: Phase 1 claims DB guards that are weaker than actual schema/migration. |
| backend/src/apps/store-api/prisma/schema.prisma | REQUIRED_FIXES: active term and paid single-redemption guards are nullable/service-dependent. |
| backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql | REQUIRED_FIXES: non-destructive, but DB constraints do not enforce two claimed invariants. |
| backend/src/apps/store-api/generated/prisma/browser.ts | OK: generated exports include new models. |
| backend/src/apps/store-api/generated/prisma/client.ts | OK: generated exports include new models. |
| backend/src/apps/store-api/generated/prisma/commonInputTypes.ts | OK: generated enum/filter types present. |
| backend/src/apps/store-api/generated/prisma/enums.ts | OK: required enums present with expected values. |
| backend/src/apps/store-api/generated/prisma/internal/class.ts | OK: generated client delegates include new models. |
| backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts | OK: generated namespace reflects new models/types. |
| backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts | OK: browser namespace reflects new models. |
| backend/src/apps/store-api/generated/prisma/models.ts | OK: exports all new model files. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts | OK: existing access model intact and has redemptions relation. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts | OK: existing instance model intact, `invite_quota` present, new access-code relations present. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts | OK: terms relation present. |
| backend/src/apps/store-api/generated/prisma/models/purchases.ts | OK: redemption and wallet ledger relations present. |
| backend/src/apps/store-api/generated/prisma/models/users.ts | OK: new user relations for terms, codes, redemptions, achievements, wallet, ledger, acceptances present. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_access_code_redemptions.ts | REQUIRED_FIXES: generated file reflects nullable `paid_redemption_guard`; blocker originates in schema/migration. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_access_codes.ts | OK: code hash unique input generated; model reflects schema. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_milestone_achievements.ts | OK: compound unique `(teacher_id, term_id, milestone_id)` generated. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts | OK: milestone model and term/target unique generated. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_teacher_terms_acceptances.ts | OK with note: nullable compound unique allows multiple NULL milestone rows in PostgreSQL; not a stated blocking invariant unless single acceptance per type is required. |
| backend/src/apps/store-api/generated/prisma/models/e_booklet_terms.ts | REQUIRED_FIXES: generated file reflects nullable `active_guard`; blocker originates in schema/migration. |
| backend/src/apps/store-api/generated/prisma/models/teacher_wallet_ledger.ts | OK with note: no idempotency constraint per milestone achievement; service must prevent duplicate credits. |
| backend/src/apps/store-api/generated/prisma/models/teacher_wallets.ts | OK: unique per teacher generated. |

Tracker truthfulness assessment

- Phase 1 status `COMPLETE` at tracker line 127 is not truthful until the two DB-invariant blockers are fixed.
- Tracker line 140-141 claims a unique active-term service/DB guard. Actual DB only has nullable `active_guard` uniqueness, not active-row uniqueness.
- Tracker line 142-143 claims paid code single-redemption guard. Actual DB only has nullable `paid_redemption_guard` uniqueness plus `(access_code_id, student_id)`, which does not guarantee one paid redemption per code.
- Tracker verification lines 150-152 are true for Prisma generate and backend build based on the commands above.
- Tracker line 153 “Migration file reviewed for non-destructive behavior” is true for non-destructiveness, but incomplete because the migration does not enforce all claimed constraints.

Explicit Phase 1 status statement

Phase 1 must be reverted from COMPLETE to REQUIRED_FIXES.

session_id: 20260614_215039_5e20db
