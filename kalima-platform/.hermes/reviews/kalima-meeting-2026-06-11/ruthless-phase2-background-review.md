Verdict: REQUIRED_FIXES

Blocking findings

1. Phase 2 services use field/model names that do not exist in the actual Prisma schema/generated client, so the implementation will fail at runtime despite passing mocked tests.
   - `backend/src/apps/store-api/services/e-booklet-terms.service.ts:14-35`
     - Uses `scope`, `version`, `body`.
     - Actual `e_booklet_terms` fields are `template_id`, `name`, `description`, `status`, `active_guard`, `starts_at`, `ends_at`, `code_generation_terms`, `reward_claim_terms`.
     - Minimal fix: rewrite terms service around the real schema fields and active term guard.
   - `backend/src/apps/store-api/services/e-booklet-terms.service.ts:51-59`
     - Uses `terms_id`.
     - Actual acceptance table uses `term_id`, `acceptance_type`, optional `milestone_achievement_id`.
     - Minimal fix: persist `term_id` and `acceptance_type: "code_generation"` or `"reward_claim"`.
   - `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:46-52`
     - Uses `code_type`, `terms_id`, `metadata_json`.
     - Actual access-code fields are `kind`, `term_id`, no `metadata_json`.
     - Minimal fix: map `paid_single_use/free_shared` to schema enum `paid/free`, write `term_id`, remove unsupported fields.
   - `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:40`
     - Calls `tx.e_booklet_code_redemptions`.
     - Actual generated model is `e_booklet_access_code_redemptions`.
     - Minimal fix: rename all Prisma delegate calls.
   - `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:45,57,77,80,83,84`
     - Uses `code_type`, `teacher_id`, `terms_version`, `first_paid_access`, `counts_for_milestones`.
     - Actual schema has `kind`, no redemption `teacher_id`, no `terms_version`, no `first_paid_access`, and uses `counted_for_progress`.
     - Minimal fix: align create/count/update payloads with generated model.
   - `backend/src/apps/store-api/services/e-booklet-milestone.service.ts:13,17,18,23,24,31,34,44,45,46,51,54`
     - Uses nonexistent delegate/fields: `e_booklet_code_redemptions`, `teacher_id` on redemption, `counts_for_milestones`, `first_paid_access`, milestone `status`, `threshold`, achievement compound key `teacher_id_milestone_id_booklet_instance_id`, `booklet_instance_id`, `paid_first_access_count`, `reward_amount`.
     - Actual generated fields are visible in generated model files:
       - `e_booklet_access_code_redemptions.ts:238-249` has no `teacher_id`, no `first_paid_access`, no `counts_for_milestones`.
       - `e_booklet_milestones.ts:248-258` has `target_paid_redemptions`, `milestone_price`, `reward_amount_snapshot`, `active`, no `threshold/status/reward_amount`.
     - Minimal fix: count `counted_for_progress: true` redemptions joined through access_code/instance/term or denormalize teacher_id intentionally in schema; use `target_paid_redemptions`, `active`, and schema achievement key `(teacher_id, term_id, milestone_id)`.
   - `backend/src/apps/store-api/services/teacher-wallet.service.ts:21-25,58-60,66`
     - Uses nonexistent ledger fields `entry_type`, `milestone_id`, `description`, `expires_at`, and nonexistent purchase field `wallet_credit_applied`.
     - Actual ledger fields are `wallet_id`, `teacher_id`, `type`, `source`, `amount`, `balance_after`, `milestone_achievement_id`, `purchase_id`, `notes`.
     - Minimal fix: create ledger rows using actual enum fields and `balance_after`; do not update nonexistent purchase columns unless migration adds them.

2. Tests are proving the wrong contract and mask the schema/runtime failure.
   - `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts:9-18`
     - Mock DB defines `e_booklet_code_redemptions`, but actual generated delegate is `e_booklet_access_code_redemptions`.
   - `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts:29-37,46-52,57-84,86-98,103-111`
     - Assertions expect old/nonexistent fields: `scope`, `version`, `terms_id`, `code_type`, `counts_for_milestones`, `first_paid_access`, `threshold`, `reward_amount`, `entry_type`, `expires_at`.
   - Impact: all phase 2 tests can pass while production Prisma calls fail.
   - Minimal fix: rewrite tests against generated Prisma schema names and include at least one Prisma payload-shape validation/integration-style test using generated types/client.

3. Paid code redemption is not concurrency-safe and does not enforce single paid redemption at the DB level.
   - `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:40-48`
     - Checks existing redemption with a read-before-write.
   - `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:73-90`
     - Creates redemption then increments count, but does not set `bound_student_id`, does not set status to `redeemed`, and does not set a non-null `paid_redemption_guard`.
   - `backend/src/apps/store-api/prisma/schema.prisma:1166`
     - `paid_redemption_guard String? @unique` is nullable; PostgreSQL allows multiple nulls, so it does not prevent two paid redemptions.
   - Impact: two students can concurrently redeem the same paid code before either transaction observes the other, creating multiple accesses/progress increments.
   - Minimal fix: perform redemption in a serializable transaction or conditional update on `e_booklet_access_codes` where active/unbound; set `bound_student_id`, status/redeemed_count atomically; set non-null paid guard for paid codes; catch unique conflicts.

4. Terms acceptance before teacher code generation is claimed but not enforced.
   - `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:22-30`
     - `generateCode` accepts `termsId` but does not verify active term or teacher acceptance.
   - `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:41-54`
     - Creates a code directly.
   - Tracker claims this is done at `.local-workdocs/...tracker.md:48`.
   - Impact: teachers can generate/copy paid/free codes without terms acceptance once an API calls this service.
   - Minimal fix: require a valid active `term_id`, check `e_booklet_teacher_terms_acceptances` for `(teacher_id, term_id, code_generation)`, and fail closed.

5. Milestone progress cannot work as implemented and does not use the active term correctly.
   - `backend/src/apps/store-api/services/e-booklet-milestone.service.ts:13-24`
     - Counts nonexistent fields and selects milestones by nonexistent `status/threshold`.
   - `backend/src/apps/store-api/prisma/schema.prisma:1025-1045`
     - Milestones are term-scoped with `target_paid_redemptions` and `active`.
   - Impact: paid progress/milestone achievement will not execute correctly in production.
   - Minimal fix: derive active term, count first successful paid redemptions for that teacher/term using schema-valid fields, compare against `target_paid_redemptions`, create achievements with required snapshots.

6. Wallet credit cannot persist correctly under the actual schema.
   - `backend/src/apps/store-api/services/teacher-wallet.service.ts:12-27`
     - Upserts wallet but creates ledger without required `wallet_id`, `type`, `source`, `balance_after`.
   - `backend/src/apps/store-api/prisma/schema.prisma:1106-1128`
     - Those fields are required.
   - Impact: milestone credit claims will fail at runtime; ledger is unusable.
   - Minimal fix: after upsert/update, create ledger with `wallet_id`, `type: "credit"`, `source: "milestone_reward"`, positive amount, and correct `balance_after`.

7. Wallet partial spend/no-stacking is not Phase 3/API-ready and writes nonexistent purchase state.
   - `backend/src/apps/store-api/services/teacher-wallet.service.ts:31-72`
     - Rejects `couponApplied`, debits balance, writes ledger, then updates `purchases.wallet_credit_applied`.
   - `backend/src/apps/store-api/prisma/schema.prisma:520-564`
     - `purchases` has no `wallet_credit_applied`.
   - Impact: checkout integration will fail unless Phase 3/8 migration adds purchase wallet fields or stores this only in ledger.
   - Minimal fix: either add a purchase wallet-credit field/migration or rely on ledger + existing `discount/total` fields consistently; enforce no-stacking at API/service boundary.

8. New code flow says “free shared code tracks entry” but service currently grants no access for free code.
   - `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:57-71`
     - For `free_shared`, `isPaid` false, so no `e_booklet_access` record is created.
   - Requirement says free shared code “tracks entry” and Kalima memory/spec says students get URL + unique/one-time code binding for paid; free shared e-booklets track entry. If free code is supposed to let the student enter/view the e-booklet, this implementation does not grant access.
   - Minimal fix: confirm product decision. If free shared code should open the booklet, create access with `counted_for_progress: false`. If it is only analytics tracking, document that explicitly and make API/UI behavior clear.

9. Existing public checkout seat-limit flow remains active and directly contradicts any claim that seat-limit blockers are removed globally.
   - `backend/src/apps/store-api/services/e-booklet.service.ts:969-974`
     - `assertStudentSeatAvailable` still throws “student seat limit”.
   - `backend/src/apps/store-api/services/e-booklet.service.ts:1153-1155`
     - Public checkout still calls that blocker.
   - Tracker says at line 44 old quota UI is hidden/deprecated and not used as blocker in new access-code redemption. If the scope is only the new access-code redemption flow, this is acceptable; if Phase 2 claims old invite/checkout was delegated or no longer blocks, it is false.
   - Minimal fix: clarify in tracker: old public checkout remains seat-limited; new access-code redemption must not call this path.

Non-blocking notes

- `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:7-12`: hash secret falls back to hardcoded dev secrets. For production, fail closed if no real secret is configured.
- `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:15-16`: code entropy is only 4 random bytes / 32 bits (`KLM-XXXXXXXX`). Consider 10-16 random bytes or a longer Crockford/base32 code.
- Migration is additive/non-destructive, but because service code does not match it, “migration reviewed” is not enough proof of Phase 2 correctness.
- Generated files appear to correspond to the schema/migration and do not expose raw code values. They correctly export the new models, but their generated field names expose the handwritten service mismatch.
- `backend/tests/e-booklet/e-booklet.service.spec.ts` is dirty outside this scope. I only used it for regression compatibility as requested.

Verification commands run and exact outcomes

- `git status --short --branch`
  - Exit 0.
  - Branch: `feat/kalima-meeting-2026-06-11`.
  - Scoped files are dirty/untracked; unrelated dirty files also exist, matching tracker’s warning.

- `npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase2-services.spec.ts --runInBand`
  - Exit 0.
  - PASS `tests/e-booklet/e-booklet-phase2-services.spec.ts`
  - 1 suite passed, 6 tests passed.
  - Important: these tests are not reliable because mocks/assertions use non-schema fields.

- `npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts --runInBand`
  - Exit 0.
  - PASS both suites.
  - 2 suites passed, 57 tests passed.
  - Important: does not prove schema compatibility.

- `npm run build`
  - Exit 0.
  - `tsc` passed.
  - Important: handwritten services use `db: any`, so TypeScript does not catch invalid Prisma fields.

- `npx prisma validate --schema src/apps/store-api/prisma/schema.prisma`
  - Exit 0.
  - “The schema at src/apps/store-api/prisma/schema.prisma is valid 🚀”

File-by-file verdict table

| File | Verdict |
| --- | --- |
| `.local-workdocs/hermes/plans/2026-06-14-kalima-meeting-2026-06-11-implementation-tracker.md` | REQUIRED_FIXES: Phase 2 completion claims are not truthful; services/tests do not match schema. |
| `backend/src/apps/store-api/prisma/schema.prisma` | APPROVED with notes: schema validates and contains intended new models; service code does not match it. |
| `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql` | APPROVED with notes: additive migration; nullable paid guard is insufficient for single paid redemption. |
| `backend/src/apps/store-api/generated/prisma/browser.ts` | APPROVED: generated exports include new models/enums; no raw code exposure found. |
| `backend/src/apps/store-api/generated/prisma/client.ts` | APPROVED: generated client entry exports models/enums. |
| `backend/src/apps/store-api/generated/prisma/commonInputTypes.ts` | APPROVED: generated input/filter types. |
| `backend/src/apps/store-api/generated/prisma/enums.ts` | APPROVED: generated new enums present. |
| `backend/src/apps/store-api/generated/prisma/internal/class.ts` | APPROVED: generated runtime model includes new schema; no raw code exposure found. |
| `backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts` | APPROVED: generated namespace includes new model types. |
| `backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts` | APPROVED: generated browser namespace includes new model types. |
| `backend/src/apps/store-api/generated/prisma/models.ts` | APPROVED: barrel exports include new model files. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts` | APPROVED: generated relation to code redemptions present. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts` | APPROVED: generated relations to access codes/redemptions present. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts` | APPROVED: generated relation to terms present. |
| `backend/src/apps/store-api/generated/prisma/models/purchases.ts` | APPROVED: generated relation to code redemptions/wallet ledger present; no `wallet_credit_applied`. |
| `backend/src/apps/store-api/generated/prisma/models/users.ts` | APPROVED: generated user relations to new models present. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_code_redemptions.ts` | APPROVED: generated fields confirm actual schema; exposes mismatch with service. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_codes.ts` | APPROVED: generated fields confirm `kind/term_id`, no raw code value. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestone_achievements.ts` | APPROVED: generated term/milestone/teacher achievement model. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts` | APPROVED: generated `target_paid_redemptions/active`; exposes mismatch with service. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_teacher_terms_acceptances.ts` | APPROVED: generated `term_id/acceptance_type`; exposes mismatch with terms service. |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_terms.ts` | APPROVED: generated active-term model; no `scope/version/body`. |
| `backend/src/apps/store-api/generated/prisma/models/teacher_wallet_ledger.ts` | APPROVED: generated required ledger fields; exposes wallet service mismatch. |
| `backend/src/apps/store-api/generated/prisma/models/teacher_wallets.ts` | APPROVED: generated wallet model. |
| `backend/src/apps/store-api/services/e-booklet-access-code.service.ts` | REQUIRED_FIXES: wrong schema fields; no terms enforcement; weak fallback secret/entropy. |
| `backend/src/apps/store-api/services/e-booklet-milestone.service.ts` | REQUIRED_FIXES: wrong model/field names; active-term and milestone logic broken. |
| `backend/src/apps/store-api/services/e-booklet-redemption.service.ts` | REQUIRED_FIXES: wrong delegate/fields; race-prone paid redemption; no bound student/status update. |
| `backend/src/apps/store-api/services/e-booklet-terms.service.ts` | REQUIRED_FIXES: built for a different terms schema. |
| `backend/src/apps/store-api/services/teacher-wallet.service.ts` | REQUIRED_FIXES: ledger/purchase writes do not match schema. |
| `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts` | REQUIRED_FIXES: tests validate fake/mismatched DB contract. |
| `backend/src/apps/store-api/services/e-booklet.service.ts` | OUT-OF-SCOPE COMPAT NOTE: existing checkout still seat-limited; acceptable only if new code-redemption flow is isolated. |
| `backend/tests/e-booklet/e-booklet.service.spec.ts` | OUT-OF-SCOPE COMPAT NOTE: dirty before scope; regression tests pass but still cover old seat-limit checkout. |

Tracker truthfulness assessment

The tracker’s Phase 2 completion claims are not truthful.

What is truthful:
- The listed test commands currently pass.
- Backend build currently passes.
- Prisma schema validates.
- Generated files exist and match the schema.

What is not truthful:
- “Phase 2 — Backend services COMPLETE” is false because the services do not match the Prisma schema and will fail at runtime.
- “Terms are required before teacher code generation/copy” is false at the service layer.
- “Implement active-term progress calculation” is false; milestone service uses nonexistent `status/threshold` fields and does not derive active term.
- “Implement milestone achievement detection” is false against the actual schema.
- “Implement wallet credit creation on claim” is false against the actual wallet ledger schema.
- “Unit tests for raw-code-on-create-only / paid bind / free exclusion / milestone / wallet” are not meaningful proof because they mock nonexistent fields and delegates.
- Phase 2 should remain `REQUIRED_FIXES`, not `COMPLETE`.

session_id: 20260614_213456_a50bab
