# Ruthless Line-by-Line Fixup Handoff — 2026-06-15

Scope: Fix REQUIRED_FIXES from `.hermes/reviews/ruthless-line-by-line-2026-06-15/report.md` for Kalima e-booklet admin terms/milestones/access-code/redemption/wallet work.

Current fixes applied:
- Backend terms: effective-window lookup, global fallback, activation-only active status, active terms immutable for policy/date fields, date-window validation, parsed status validation.
- Backend milestones: finite/non-negative numeric validation, integer sort/order validation, non-empty titles, strict boolean handling, notifier failure isolation, notification-recipient policy propagation.
- Backend access codes/redemption: future expiration parsing/validation, trimmed/non-empty code redemption, strict `termsAccepted === true`.
- Backend wallet/email/auth: finite wallet amount validation, positive credit enforcement, protocol-relative email href rejection, Firebase credentials fail closed in production.
- Migration/schema: DB CHECK constraints added for term windows, milestone numeric/range fields, wallet balances/ledger amounts, access-code max/redeemed counts; Prisma comments document DB-only partial indexes/checks.
- Frontend admin/teacher/nav: active terms fields disabled/suppressed in PATCH, access-code generation uses accepted response term id, public e-booklet entry hidden for non-store roles, super-admin-only sidebar item enforced.
- Frontend copy: removed misleading template-scoped terms language.
- Git hygiene: restored previously tracked reviewer/report files and removed `.hermes`/reports/docs ignore entries from parent `.gitignore` so review artifacts can be tracked.

Verification passed:
- Backend: `npm run build && npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet-phase4-notifications.spec.ts`
- Frontend: `node tests/e-booklet-phase5-source-check.mjs && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs && npm run lint && npm run build`

Next step: run fresh ruthless re-review. If it reports REQUIRED_FIXES, patch and repeat until verdict is APPROVED.
