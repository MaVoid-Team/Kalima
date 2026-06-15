# Phase 7/8 Ruthless Line-by-Line Review
Verdict: REQUIRED_FIXES

## Scope accounting
- Total files listed: 168
- In-scope files reviewed: 65
- Out-of-scope files: 109
- Files added by reviewer: 6
- Disk-read accounting path: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-7-8-ruthless-line-review/disk-read-accounting.tsv

## Executive summary
- Required build/test gates passed, but Phase 7 analytics is not truthful enough to approve: page-view and device-bound metrics displayed/claimed by the UI are never recorded into the analytics table.
- CSV/admin analytics role boundaries are too broad for exported student, anonymous-session, purchase, and internal-price fields.
- Phase 8 blank-page build fix is build-clean. QA evidence files were read and treated as evidence, not proof of correctness where contradicted by source.
- Verdict is fail-closed REQUIRED_FIXES because evidence/UI claims PASS for analytics dimensions unsupported by code.

## Required fixes
1. backend/src/apps/store-api/services/e-booklet.service.ts:2021-2056 and frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx:106-107 / frontend/src/pages/teacher/e-booklets/TeacherEBookletAnalyticsPage.jsx:105
   - Reproduction/why it fails: Viewer page views are only written to `e_booklet_audit_logs` at service lines 2031-2039. There is no `recordAnalyticsEvent(... event_type: "page_viewed" ...)`, yet both analytics UIs include `page_viewed` in their operational/open metrics. Reproduction: call `GET /viewer/e-booklet-instances/:id/pages/:pageNumber`; audit row is created but `e_booklet_analytics_events` remains unchanged, so launch analytics undercount page engagement and the UI metric is false.
   - Impact: Phase 7 launch analytics and Phase 8 PASS evidence are overstated.
   - Required fix: Record a sanitized `page_viewed` analytics event with teacher/template/instance/access/student/source after `assertViewerAccess`, and add service/route tests asserting analytics row creation.
2. backend/src/apps/store-api/services/e-booklet.service.ts:1695-1784 and frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx:106
   - Reproduction/why it fails: Device binding never records `device_bound` analytics. The admin analytics card reads `eventCount(analytics, "device_bound")`, but `bindViewerDevice` only creates/updates `e_booklet_devices` and never calls `recordAnalyticsEvent`. Reproduction: bind a new viewer device; the device table changes, analytics `events.device_bound` stays zero.
   - Impact: Launch/device-security analytics are false and cannot support Phase 7 operational claims.
   - Required fix: Emit a sanitized `device_bound` event only on first successful active device creation/reactivation (not every heartbeat update), include instance/student/teacher/template dimensions, and test both new and existing-device paths.
3. backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:16-18 and 224-232; backend/src/apps/store-api/services/e-booklet.service.ts:2303-2337
   - Reproduction/why it fails: Admin analytics and CSV export use `adminAuth`, which includes Moderator. The CSV includes `student_id`, `anonymous_session_id`, `purchase_id`, `marketing_price_snapshot`, and `internal_price_snapshot`. Reproduction: authenticate as Moderator and request `/api/v2/admin/e-booklet-analytics.csv`; route authorization allows it.
   - Impact: Privacy/financial leakage beyond the tracker claim of admin-only analytics/export and weaker role boundary than terms/milestones admin-manager routes.
   - Required fix: Gate admin analytics and CSV behind Admin/SubAdmin (`adminManagerAuth`) or a dedicated analytics-export permission, and add negative route tests for Moderator.
4. backend/src/apps/store-api/services/e-booklet.service.ts:2276-2287
   - Reproduction/why it fails: Teacher analytics accepts `instanceId` and filters by denormalized analytics event `teacher_id`. If historical/malformed analytics rows carry a valid teacher_id with a mismatched instance id, groupBy includes them; ownership is not joined to `e_booklet_instances` before aggregation.
   - Impact: Teacher analytics scoping depends on write-time denormalization integrity instead of source-of-truth instance ownership.
   - Required fix: For teacher analytics, first resolve allowed instance IDs from `e_booklet_instances` owned by the current teacher and constrain analytics to those IDs; reject/filter unauthorized `instanceId` explicitly.

## Verification output
- Backend build/tests: PASS: `npm run build && npm test -- --runInBand tests/e-booklet` in backend. tsc passed; Jest PASS 6 suites / 127 tests.
- Frontend lint/build: PASS: `npm run lint && npm run build` in frontend. ESLint passed; Vite production build passed with non-fatal warnings: module.register deprecation, @embedpdf crypto externalized, chunks >1600 kB.

## File-by-file verdict matrix
| File | Scope | Lines reviewed | Verdict | Notes |
| --- | --- | --- | --- | --- |
| `.hermes/plans/2026-06-02-e-booklet-v2-subagent-execution-tracker.md` | IN_SCOPE | 1-410 | APPROVED | scope/control artifact for Phase 7/8 review |
| `.hermes/plans/2026-06-15-phase-8-parallel-orchestration.md` | IN_SCOPE | 1-77 | APPROVED | scope/control artifact for Phase 7/8 review |
| `.hermes/reviews/e-booklet-admin-editor-full-browser-proof/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/e-booklet-auth-e2e-followup/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/e-booklet-remaining-browser-proof/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/fekra-e-booklet-v2/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-required-blocker-fix/critique-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-required-blocker-fix/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/critique-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/ruthless-line-review.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/strict-24-file-review-fixup.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/strict-24-file-review.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/phase-6-admin-terms-milestones-handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-rereview-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-rereview.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-review-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-review.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-background-review.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-final-rereview-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-final-rereview.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-rereview-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-rereview.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-review-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-phase-6-admin-terms-milestones/critique-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/kalima-phase-6-admin-terms-milestones/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/phase-7-8-ruthless-line-review/files-to-review.txt` | IN_SCOPE | 1-169 | APPROVED | scope/control artifact for Phase 7/8 review |
| `.hermes/reviews/phase-7-8-ruthless-line-review/prompt.md` | IN_SCOPE | 1-78 | APPROVED | scope/control artifact for Phase 7/8 review |
| `.hermes/reviews/phase-7-student-code-redemption/critique-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/phase-7-student-code-redemption/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/phase-8-blank-page-fix/critique-prompt.md` | IN_SCOPE | 1-27 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-blank-page-fix/critique-report.md` | IN_SCOPE | 1-23 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-blank-page-fix/handoff.md` | IN_SCOPE | 1-36 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-final-evidence.md` | IN_SCOPE | 1-30 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-lifecycle-e2e/evidence.json` | IN_SCOPE | 1-97 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-lifecycle-e2e/prompt.md` | IN_SCOPE | 1-49 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-lifecycle-e2e/qa-lifecycle.mjs` | IN_SCOPE | 1-300 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-lifecycle-e2e/report.md` | IN_SCOPE | 1-28 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/admin/prompt.md` | IN_SCOPE | 1-10 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/admin/report.md` | IN_SCOPE | 1-53 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/admin/rerun-evidence.json` | IN_SCOPE | 1-50 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/student/prompt.md` | IN_SCOPE | 1-10 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/student/report.md` | IN_SCOPE | 1-55 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/teacher-viewer-device/prompt.md` | IN_SCOPE | 1-10 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa-rerun/teacher-viewer-device/report.md` | IN_SCOPE | 1-45 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/admin-qa-1781520740879-api-results.json` | IN_SCOPE | 1-1090 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/admin-qa-1781520740879-reject.docx` | IN_SCOPE | 1-1 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/admin-qa-1781520740879-valid.pdf` | IN_SCOPE | 1-44 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/browser-console-notes.md` | IN_SCOPE | 1-11 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/device-allowance-retry-results.json` | IN_SCOPE | 1-19 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/device-controls-api-results.json` | IN_SCOPE | 1-788 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/latest-api-results.json` | IN_SCOPE | 1-1090 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/prompt.md` | IN_SCOPE | 1-39 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/admin/report.md` | IN_SCOPE | 1-43 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa/student/notes.md` | IN_SCOPE | 1-26 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/student/prompt.md` | IN_SCOPE | 1-40 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/student/report.md` | IN_SCOPE | 1-27 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/console-network-notes.md` | IN_SCOPE | 1-46 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/prompt.md` | IN_SCOPE | 1-39 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/report.md` | IN_SCOPE | 1-28 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-remaining-proof-rerun/evidence.json` | IN_SCOPE | 1-132 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-remaining-proof-rerun/prompt.md` | IN_SCOPE | 1-47 | APPROVED | Phase 8 QA/evidence/blank-page artifact |
| `.hermes/reviews/phase-8-remaining-proof-rerun/report.md` | IN_SCOPE | 1-27 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-remaining-proof/evidence.json` | IN_SCOPE | 1-199 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/phase-8-remaining-proof/report.md` | IN_SCOPE | 1-47 | REQUIRED_FIX | evidence/pass status is not fully supported by analytics source code findings |
| `.hermes/reviews/ruthless-line-by-line-2026-06-15/handoff.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-2026-06-15/prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-2026-06-15/report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/file-accounting.tsv` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/files-to-review.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-disk-read-accounting.tsv` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-files-to-review.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/final-review-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/fix-agent-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/fix-agent-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/followup-fix-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/followup-fix-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-disk-read-accounting.tsv` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-files-to-review.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-matrix.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-prompt.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/rereview-report.md` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-1.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-10.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-11.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-12.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-13.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-14.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-2.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-3.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-4.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-5.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-6.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-7.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-8.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `.hermes/reviews/ruthless-line-by-line-full-2026-06-15/source-bundle-9.txt` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/controllers/e-booklet.controller.ts` | IN_SCOPE | 1-1157 | APPROVED | Phase 7/8 central API contract surface |
| `backend/src/apps/store-api/emails/email.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/emails/templates/e-booklet-milestone-achievement.template.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/emails/templates/index.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/browser.ts` | IN_SCOPE | 1-354 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/client.ts` | IN_SCOPE | 1-374 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/commonInputTypes.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/enums.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/internal/class.ts` | IN_SCOPE | 1-863 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts` | IN_SCOPE | 1-7276 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts` | IN_SCOPE | 1-1189 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/models.ts` | IN_SCOPE | 1-78 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_code_redemptions.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access_codes.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_access.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_instances.ts` | IN_SCOPE | 1-4357 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestone_achievements.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_milestones.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_purchases.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_teacher_terms_acceptances.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_templates.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_terms.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/purchases.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/teacher_wallet_ledger.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/teacher_wallets.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/generated/prisma/models/users.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/prisma/migrations/20260614210000_e_booklet_milestone_notifications/migration.sql` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/prisma/migrations/20260615120000_e_booklet_purchase_wallet_amounts/migration.sql` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/prisma/schema.prisma` | IN_SCOPE | 1-1483 | APPROVED | Phase 7 Prisma schema for archive/analytics |
| `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts` | IN_SCOPE | 1-459 | REQUIRED_FIX | admin analytics/CSV route allows Moderator via adminAuth |
| `backend/src/apps/store-api/services/e-booklet-access-code.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/e-booklet-domain.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/e-booklet-milestone-notification.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/e-booklet-milestone.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/e-booklet-redemption.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/e-booklet-terms.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/apps/store-api/services/teacher-wallet.service.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/config/corsOptions.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/src/libs/auth/firebase.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/tests/e-booklet/e-booklet-phase1-migration.spec.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/tests/e-booklet/e-booklet-phase4-notifications.spec.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/tests/e-booklet/e-booklet-security-config.spec.ts` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `backend/tests/e-booklet/e-booklet.routes.spec.ts` | IN_SCOPE | 1-847 | REQUIRED_FIX | tests/source checks do not catch missing page_viewed/device_bound analytics or Moderator CSV access |
| `backend/tests/e-booklet/e-booklet.service.spec.ts` | IN_SCOPE | 1-1627 | REQUIRED_FIX | tests/source checks do not catch missing page_viewed/device_bound analytics or Moderator CSV access |
| `frontend/src/App.jsx` | IN_SCOPE | 1-305 | APPROVED | Phase 7/8 route/navigation exposure |
| `frontend/src/components/admin/Sidebar.jsx` | IN_SCOPE | 1-196 | APPROVED | Phase 7/8 route/navigation exposure |
| `frontend/src/components/admin/users/CreateUserDialog.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/components/student/StudentSidebar.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/hooks/admin/useAdminEBooklets.js` | IN_SCOPE | 1-597 | APPROVED | Phase 7 analytics frontend API hook |
| `frontend/src/hooks/useEBookletAccess.js` | IN_SCOPE | 1-366 | APPROVED | Phase 7 analytics frontend API hook |
| `frontend/src/layouts/Navbar.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/locales/ar/admin.json` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/locales/ar/eBooklets.json` | IN_SCOPE | 1-731 | APPROVED | Phase 7/8 UI copy/evidence-visible labels |
| `frontend/src/locales/ar/student.json` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/locales/en/admin.json` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/locales/en/eBooklets.json` | IN_SCOPE | 1-731 | APPROVED | Phase 7/8 UI copy/evidence-visible labels |
| `frontend/src/locales/en/student.json` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/tests/e-booklet-phase5-source-check.mjs` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/tests/e-booklet-phase6-source-check.mjs` | OUT_OF_SCOPE | N/A | OUT_OF_SCOPE | not Phase 7 expiry/analytics or Phase 8 browser QA/blank-page scope |
| `frontend/tests/e-booklet-phase7-source-check.mjs` | IN_SCOPE | 1-48 | REQUIRED_FIX | tests/source checks do not catch missing page_viewed/device_bound analytics or Moderator CSV access |
| `frontend/vite.config.js` | IN_SCOPE | 1-58 | APPROVED | Phase 8 blank-page build fix |
| `backend/scripts/archiveExpiredEBookletInstances.js` | IN_SCOPE | 1-29 | APPROVED | Phase 7 archive/analytics schema artifact |
| `backend/src/apps/store-api/prisma/migrations/20260605090000_e_booklet_analytics_events/migration.sql` | IN_SCOPE | 1-32 | APPROVED | Phase 7 archive/analytics schema artifact |
| `backend/src/apps/store-api/generated/prisma/models/e_booklet_analytics_events.ts` | IN_SCOPE | 1-1522 | APPROVED | generated Prisma surface containing Phase 7 archive/analytics model fields |
| `frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx` | IN_SCOPE | 1-136 | REQUIRED_FIX | UI displays page_viewed/device_bound metrics not backed by analytics events |
| `frontend/src/pages/teacher/e-booklets/TeacherEBookletAnalyticsPage.jsx` | IN_SCOPE | 1-145 | REQUIRED_FIX | UI includes page_viewed in engagement metrics not backed by analytics events |
| `frontend/src/components/teacher/TeacherSidebar.jsx` | IN_SCOPE | 1-169 | APPROVED | Phase 7/8 route/navigation exposure |

## Detailed findings
- REQUIRED_FIX 1: backend/src/apps/store-api/services/e-booklet.service.ts:2021-2056 and frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx:106-107 / frontend/src/pages/teacher/e-booklets/TeacherEBookletAnalyticsPage.jsx:105
  - Reproduction/why it fails: Viewer page views are only written to `e_booklet_audit_logs` at service lines 2031-2039. There is no `recordAnalyticsEvent(... event_type: "page_viewed" ...)`, yet both analytics UIs include `page_viewed` in their operational/open metrics. Reproduction: call `GET /viewer/e-booklet-instances/:id/pages/:pageNumber`; audit row is created but `e_booklet_analytics_events` remains unchanged, so launch analytics undercount page engagement and the UI metric is false.
  - Impact: Phase 7 launch analytics and Phase 8 PASS evidence are overstated.
  - Required fix: Record a sanitized `page_viewed` analytics event with teacher/template/instance/access/student/source after `assertViewerAccess`, and add service/route tests asserting analytics row creation.
- REQUIRED_FIX 2: backend/src/apps/store-api/services/e-booklet.service.ts:1695-1784 and frontend/src/pages/admin/e-booklets/AdminEBookletAnalyticsPage.jsx:106
  - Reproduction/why it fails: Device binding never records `device_bound` analytics. The admin analytics card reads `eventCount(analytics, "device_bound")`, but `bindViewerDevice` only creates/updates `e_booklet_devices` and never calls `recordAnalyticsEvent`. Reproduction: bind a new viewer device; the device table changes, analytics `events.device_bound` stays zero.
  - Impact: Launch/device-security analytics are false and cannot support Phase 7 operational claims.
  - Required fix: Emit a sanitized `device_bound` event only on first successful active device creation/reactivation (not every heartbeat update), include instance/student/teacher/template dimensions, and test both new and existing-device paths.
- REQUIRED_FIX 3: backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:16-18 and 224-232; backend/src/apps/store-api/services/e-booklet.service.ts:2303-2337
  - Reproduction/why it fails: Admin analytics and CSV export use `adminAuth`, which includes Moderator. The CSV includes `student_id`, `anonymous_session_id`, `purchase_id`, `marketing_price_snapshot`, and `internal_price_snapshot`. Reproduction: authenticate as Moderator and request `/api/v2/admin/e-booklet-analytics.csv`; route authorization allows it.
  - Impact: Privacy/financial leakage beyond the tracker claim of admin-only analytics/export and weaker role boundary than terms/milestones admin-manager routes.
  - Required fix: Gate admin analytics and CSV behind Admin/SubAdmin (`adminManagerAuth`) or a dedicated analytics-export permission, and add negative route tests for Moderator.
- REQUIRED_FIX 4: backend/src/apps/store-api/services/e-booklet.service.ts:2276-2287
  - Reproduction/why it fails: Teacher analytics accepts `instanceId` and filters by denormalized analytics event `teacher_id`. If historical/malformed analytics rows carry a valid teacher_id with a mismatched instance id, groupBy includes them; ownership is not joined to `e_booklet_instances` before aggregation.
  - Impact: Teacher analytics scoping depends on write-time denormalization integrity instead of source-of-truth instance ownership.
  - Required fix: For teacher analytics, first resolve allowed instance IDs from `e_booklet_instances` owned by the current teacher and constrain analytics to those IDs; reject/filter unauthorized `instanceId` explicitly.
- Key checks performed for every in-scope file: route auth/role middleware, teacher/admin analytics filter mapping, CSV escaping/field selection, analytics metadata redaction, archive status transitions, Prisma schema/migration/generated-client consistency, frontend filter/query contracts, Vite blank-page fix/build behavior, source-check/evidence report plausibility, and locale/navigation wiring.
