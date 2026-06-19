You are an independent ruthless re-reviewer for Kalima Phase 7/8 REQUIRED_FIXES. Do not trust prior summaries. Verify from disk and tool output.

Repo root: /Users/ziadnasreldin/Documents/GitHub/Kalima
App root: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform

Original review report:
- kalima-platform/.hermes/reviews/phase-7-8-ruthless-line-review/report.md

Fixes to verify line-by-line:
1. Page views shown in analytics are now actually recorded when `getViewerPage` serves a valid page.
   - Review `backend/src/apps/store-api/services/e-booklet.service.ts` around viewer page logic.
   - Verify event fields are useful and sanitized: no raw tokens/passcodes/private storage keys.
2. Device-bound metric shown in analytics is now actually recorded when a viewer device is newly created or reactivated.
   - Review `bindViewerDevice` logic in the same service.
   - Ensure no raw fingerprint is written into analytics metadata.
3. Admin analytics and CSV export no longer allow Moderator.
   - Review `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts` and route tests.
4. Teacher analytics scoping no longer trusts denormalized analytics `teacher_id` alone for `instanceId` filtering.
   - Review `getTeacherAnalytics` line by line.
   - Confirm it derives owned instance IDs from source-of-truth `e_booklet_instances` before aggregating analytics and blocks unauthorized requested instance IDs.

Tests to inspect:
- `backend/tests/e-booklet/e-booklet.service.spec.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`

Required commands:
- `cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend && npm run build && npm test -- --runInBand tests/e-booklet`
- `cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend && npm run lint && npm run build`

Output file:
- Write your report to `kalima-platform/.hermes/reviews/phase-7-8-required-fixes-rereview/report.md`

Report format:
# Phase 7/8 Required Fixes Re-review

Verdict: APPROVED or REQUIRED_FIXES

## Line-by-line findings
For each relevant file, cite exact line ranges reviewed and whether each original blocker is fixed.

## Required fixes
List only blocking issues. If none, write `None`.

## Verification
Include exact commands run and pass/fail results.

Important:
- No edits.
- Do not approve unless all four blockers are fixed and tests pass.
- If you cannot inspect a referenced file/line, verdict must be REQUIRED_FIXES.
