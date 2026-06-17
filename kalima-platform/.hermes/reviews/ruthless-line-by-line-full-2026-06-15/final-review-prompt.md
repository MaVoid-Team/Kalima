You are an independent final ruthless reviewer for Kalima. This is the final re-review after follow-up fixes for the last two blockers. The goal is to decide APPROVED vs REQUIRED_FIXES. Be strict but scoped.

Repository git root: `/Users/ziadnasreldin/Documents/GitHub/Kalima`
App root: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`

Prior reports:
- Initial full review: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/report.md`
- First re-review: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-report.md`
- Follow-up fix report: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/followup-fix-report.md`

Fresh file list:
`/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-files-to-review.txt`

Write final review report to:
`/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-report.md`

Task:
1. Read the first re-review and follow-up fix report.
2. Read every file in final-review-files-to-review.txt from disk and account for every file. Historical review artifacts can be ARTIFACT/OK, generated Prisma can be GENERATED/OK, but source/migration/tests touched by the last two fixes must be inspected carefully.
3. Focus on the two remaining blockers from the first re-review:
   A. Notification idempotency must be DB-backed: migration/schema/test must prove a real nullable-safe unique index for `(user_id, message_key, entity_type, entity_id)` or equivalent; service `createMany(skipDuplicates)` must now have a conflict target.
   B. Disabled rewards must be allowed end-to-end: frontend zero payload, backend create/update/evaluation validation, DB migration constraints, and tests/source guard must all align. Negative rewards must still be rejected.
4. Also sanity-check that the earlier blockers did not regress.
5. Run verification if practical. Parent already ran and passed:
   - backend `npx prisma validate`, `npm run build`, `npm test -- --runInBand tests/e-booklet` => PASS 6 suites / 127 tests
   - frontend phase 5/6/7 checks + lint + build => PASS
   You may rerun focused checks if needed.
6. Do not modify source code. Only write the final review report and temporary review logs.

Report format:
# Final Ruthless Re-Review
Verdict: APPROVED or REQUIRED_FIXES

## Scope and method
- Total files accounted for.

## Remaining blocker status
- Notification DB-backed idempotency: FIXED / STILL BROKEN with evidence.
- Disabled reward end-to-end contract: FIXED / STILL BROKEN with evidence.

## Required fixes
- If none: `None.`
- If any: exact file:line, blocker, user impact, required change, regression test.

## File-by-file matrix
- One entry per file in final list with OK / GENERATED/OK / ARTIFACT/OK / REQUIRED_FIXES / NOT REVIEWED.

## Verification
- Commands run or parent verification accepted, with outcomes.

Fail closed if files are not accounted for or tests/schema are fake.