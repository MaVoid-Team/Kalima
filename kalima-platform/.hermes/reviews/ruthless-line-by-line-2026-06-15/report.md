# Ruthless Line-by-Line Review
Verdict: REQUIRED_FIXES

## Dirty files reviewed
Started from `git status --short` as required. I reviewed every dirty path listed, including modified tracked files, deleted `reports/firstlines.csv`, untracked review artifacts, generated Prisma client/model files, migrations, backend services/controllers/routes/tests, frontend routes/hooks/pages/components/locales, and docs/handoff files.

Dirty implementation/test/generated/doc paths reviewed:
- `../.gitignore`
- `.hermes/reviews/fekra-e-booklet-v2/handoff.md`
- `.hermes/reviews/e-booklet-admin-editor-full-browser-proof/handoff.md`
- `.hermes/reviews/e-booklet-auth-e2e-followup/handoff.md`
- `.hermes/reviews/e-booklet-remaining-browser-proof/handoff.md`
- `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/critique-report.md`
- `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/handoff.md`
- `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/ruthless-line-review.md`
- `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/strict-24-file-review-fixup.md`
- `.hermes/reviews/kalima-e-booklet-teacher-store-invite-quota-fix/strict-24-file-review.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/handoff.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/phase-6-admin-terms-milestones-handoff.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-rereview-prompt.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-rereview.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-review-prompt.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase1-review.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-background-review.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-final-rereview-prompt.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-final-rereview.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-rereview-prompt.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-rereview.md`
- `.hermes/reviews/kalima-meeting-2026-06-11/ruthless-phase2-review-prompt.md`
- `.hermes/reviews/kalima-phase-6-admin-terms-milestones/critique-report.md`
- `.hermes/reviews/kalima-phase-6-admin-terms-milestones/handoff.md`
- `.hermes/reviews/phase-7-student-code-redemption/critique-report.md`
- `.hermes/reviews/phase-7-student-code-redemption/handoff.md`
- `.hermes/reviews/ruthless-line-by-line-2026-06-15/handoff.md`
- `.hermes/reviews/ruthless-line-by-line-2026-06-15/prompt.md`
- `.hermes/reviews/ruthless-line-by-line-2026-06-15/report.md`
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/emails/email.service.ts`
- `backend/src/apps/store-api/emails/templates/e-booklet-milestone-achievement.template.ts`
- `backend/src/apps/store-api/emails/templates/index.ts`
- `backend/src/apps/store-api/generated/prisma/browser.ts`
- `backend/src/apps/store-api/generated/prisma/client.ts`
- `backend/src/apps/store-api/generated/prisma/commonInputTypes.ts`
- `backend/src/apps/store-api/generated/prisma/enums.ts`
- `backend/src/apps/store-api/generated/prisma/internal/class.ts`
- `backend/src/apps/store-api/generated/prisma/internal/prismaNamespace.ts`
- `backend/src/apps/store-api/generated/prisma/internal/prismaNamespaceBrowser.ts`
- `backend/src/apps/store-api/generated/prisma/models.ts`
- `backend/src/apps/store-api/generated/prisma/models/*.ts` dirty e-booklet/purchase/user/wallet models
- `backend/src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql`
- `backend/src/apps/store-api/prisma/migrations/20260614210000_e_booklet_milestone_notifications/migration.sql`
- `backend/src/apps/store-api/prisma/schema.prisma`
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `backend/src/apps/store-api/services/e-booklet-access-code.service.ts`
- `backend/src/apps/store-api/services/e-booklet-domain.service.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone-notification.service.ts`
- `backend/src/apps/store-api/services/e-booklet-milestone.service.ts`
- `backend/src/apps/store-api/services/e-booklet-redemption.service.ts`
- `backend/src/apps/store-api/services/e-booklet-terms.service.ts`
- `backend/src/apps/store-api/services/teacher-wallet.service.ts`
- `backend/src/config/corsOptions.ts`
- `backend/src/libs/auth/firebase.ts`
- `backend/tests/e-booklet/*.spec.ts` dirty and untracked phase specs
- `frontend/src/App.jsx`
- `frontend/src/components/admin/Sidebar.jsx`
- `frontend/src/components/admin/users/CreateUserDialog.jsx`
- `frontend/src/components/student/StudentSidebar.jsx`
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/src/hooks/useEBookletAccess.js`
- `frontend/src/layouts/Navbar.jsx`
- `frontend/src/locales/ar/*.json`
- `frontend/src/locales/en/*.json`
- `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx`
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
- `frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx`
- `frontend/src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx`
- `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx`
- `frontend/tests/e-booklet-phase5-source-check.mjs`
- `frontend/tests/e-booklet-phase6-source-check.mjs`
- `frontend/tests/e-booklet-phase7-source-check.mjs`
- `reports/firstlines.csv` deletion

## Blocking findings
1. `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:105-107` — Severity: BLOCKER. Existing-code redemption short-circuits and returns the old redemption row before calling `grantViewerAccess`. That violates the required behavior that redeeming URL+code must grant/open booklet access while logged in. If a student's access row was revoked, deleted, or never linked correctly after an earlier partial/manual state, the same valid code returns success without reopening access. Exact required fix: when `existingForStudent` is found, still upsert/reactivate `e_booklet_access` for `code.booklet_instance_id` and `studentId`, update/link `access_id` if needed, and return a response containing the active access/booklet instance id.

2. `backend/src/apps/store-api/services/e-booklet-redemption.service.ts:102-107` — Severity: BLOCKER. The repeat-redemption path does not re-check `code.status === "active"` before accepting an existing redemption. `assertCodeExistsAndNotExpired` only checks existence and expiry, so a disabled/revoked code can still be used by a prior student to produce a successful redemption response. The business rule is logged-in entry through active URL+code; disabled/expired codes must not open access. Exact required fix: include `status: "active"` in the lookup or explicitly reject any code whose `status` is not `active`, while still separately supporting an already-active access open flow outside code redemption if desired.

3. `backend/src/apps/store-api/services/e-booklet-milestone.service.ts:334-336` and `358-365` — Severity: BLOCKER. Re-evaluating milestones pushes existing achievements into `notifyable`, so every call to `/teacher/e-booklet-milestones/evaluate` can resend milestone notifications for already-awarded milestones. That creates duplicate admin/teacher notifications and emails for the same non-expiring wallet reward. Exact required fix: only push newly created achievements into `notifyable`; existing achievements should be excluded unless there is an explicit missing-notification recovery flag and idempotent notification ledger.

4. `backend/src/apps/store-api/services/e-booklet-milestone.service.ts:340-350` — Severity: BLOCKER. Milestone achievements are awarded with `reward_amount` directly from `reward_amount_snapshot` without validating it is positive. Admin UI and service allow `rewardAmountSnapshot: 0` (`AdminEBookletTermsMilestonesPage.jsx:182`, `EBookletMilestoneService.nonNegativeNumber`), but `claimReward` later calls `TeacherWalletService.creditMilestone`, which rejects `amount <= 0`. Result: teachers can earn a visible claimable milestone that can never be claimed. Exact required fix: either require `reward_amount_snapshot > 0` for active milestones that create claimable rewards, or mark zero-reward milestones as non-claimable and hide/disable reward claim flows for them.

5. `backend/src/apps/store-api/services/e-booklet-milestone.service.ts:211-225` — Severity: BLOCKER. Admin progress returns one global `paidRedemptions` count for the term and raw achievements, not per-teacher progress. The required business context is teacher-specific paid seats/milestones; admins need to track milestones by teacher, and free shared redemptions must not count. Current aggregate count can make the admin page imply all teachers share one milestone progress pool. Exact required fix: group counted paid redemptions by `access_code.teacher_id` and return per-teacher progress rows with teacher id/name, paid count, awarded/claimed milestones; keep free redemptions excluded via `counted_for_progress: true`.

6. `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx:79-90` — Severity: BLOCKER. The page expects `response?.data` to contain `bookletInstanceId`, but `redeemCode` returns the Prisma redemption row with snake_case `booklet_instance_id`, and `redemptionInstanceId` only accepts camel `bookletInstanceId` or snake `booklet_instance_id` from the immediate payload. Depending on `useApiMutation` response shape this can miss the id and leave the student on a success message instead of opening the booklet. Exact required fix: normalize both `{ data: redemption }` and direct redemption shapes consistently, and have the backend return an explicit DTO `{ bookletInstanceId, accessId, countedForProgress }` instead of a raw Prisma row.

## Non-blocking findings
1. `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:27-34` — Severity: MAJOR non-blocking. The Arabic WhatsApp message contains URL and code, but the URL itself is only `/e-booklet-code`; it does not prefill the code. This still satisfies URL+code copy, but it is clunkier and error-prone. Exact required fix: consider returning `${base}/e-booklet-code?code=${encodeURIComponent(code)}` and have the frontend prefill the field.

2. `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx:126-129` — Severity: MAJOR non-blocking. Only paid codes have an Arabic WhatsApp message generation button; free shared code generation is code-only even though free shared codes are also a teacher sharing workflow. Exact required fix: add a free shared WhatsApp URL+code action or make the generated free code card expose/copy the returned WhatsApp message.

3. `backend/src/apps/store-api/services/teacher-wallet.service.ts:163-168` — Severity: MAJOR non-blocking. Applying wallet credit overwrites `e_booklet_purchases.price` with the discounted final total. This loses original price unless recoverable elsewhere and can confuse accounting/audits. Exact required fix: add wallet-credit fields or ledger-only accounting and preserve purchase original price; compute final total in payment/order views.

4. `backend/src/apps/store-api/services/e-booklet-access-code.service.ts:109` and `frontend/src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx:96` — Severity: MINOR. Free codes default to `999999` max redemptions. That is effectively unlimited but not semantically unlimited and can surprise analytics/support if it is ever reached. Exact required fix: allow `max_redemptions` nullable for free shared codes, or label/store the default as an explicit configured cap.

5. `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx:52-56` — Severity: MINOR. Money formatting uses the browser default locale and no currency even though rewards/wallet are EGP. Exact required fix: use `Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EGP' })` or the term/template currency.

## Verification run
- `git status --short` was run first and produced the dirty-file list reviewed above.
- Targeted backend verification run: `cd backend && npm test -- --runInBand tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet.service.spec.ts`.
- Result: PASS — 2 suites passed, 80 tests passed. This confirms existing tests pass but do not cover the blockers above, especially repeated redemption/reactivation and duplicate milestone notifications.

## Review completeness statement
I reviewed every dirty file listed by `git status --short`, including generated Prisma files, migrations, tests, frontend/backend/locales/docs/review artifacts, and the deleted report CSV. No dirty files were intentionally left unreviewed. Verdict is REQUIRED_FIXES because the code redemption and milestone/reward paths have blocking business-rule defects that can ship false successes, duplicate notifications, and unclaimable rewards.
