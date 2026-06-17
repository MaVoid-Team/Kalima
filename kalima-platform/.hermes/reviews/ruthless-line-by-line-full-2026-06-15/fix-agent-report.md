# Fix Agent Report
Verdict: READY_FOR_REVIEW

## Checklist
- [x] Free-code redemption concurrency over-increments capacity — FIXED in `backend/src/apps/store-api/services/e-booklet-redemption.service.ts`; regression coverage in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts` verifies unique-create races release reserved capacity.
- [x] Teacher route can mint `free` access codes — FIXED in `backend/src/apps/store-api/controllers/e-booklet.controller.ts`; teacher requests still validate the requested kind but `free` is forced to `paid`. Covered in `backend/tests/e-booklet/e-booklet.routes.spec.ts`.
- [x] Admin free-code generation wrongly requires teacher terms acceptance — FIXED in `backend/src/apps/store-api/services/e-booklet-access-code.service.ts`; adminActorId uses active-term validation plus audit log without teacher acceptance. Covered in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`.
- [x] Redemption route forwards unparsed `purchaseId` — FIXED in `backend/src/apps/store-api/controllers/e-booklet.controller.ts`; optional positive int parsing added. Covered in `backend/tests/e-booklet/e-booklet.routes.spec.ts`.
- [x] Teacher wallet idempotent retry returns wrong `finalTotal` — FIXED in `backend/src/apps/store-api/services/teacher-wallet.service.ts`; retries use structured `final_payable_price` when present. Covered in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`.
- [x] Wallet application destructively overwrites canonical purchase price — FIXED in `backend/src/apps/store-api/services/teacher-wallet.service.ts`, `backend/src/apps/store-api/prisma/schema.prisma`, generated Prisma client, and migration `backend/src/apps/store-api/prisma/migrations/20260615120000_e_booklet_purchase_wallet_amounts/migration.sql`; canonical `price` is preserved and `wallet_credit_applied` / `final_payable_price` are stored separately. Covered in phase 1/2 tests.
- [x] Terms acceptance race — FIXED in `backend/src/apps/store-api/services/e-booklet-terms.service.ts`; P2002 conflict re-reads existing acceptance. Covered in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`.
- [x] Active terms creation race — FIXED in `backend/src/apps/store-api/services/e-booklet-terms.service.ts`; P2002 during active create is translated to a clean BadRequest conflict. Covered in `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`.
- [x] Milestone admin notification race — FIXED in `backend/src/apps/store-api/services/e-booklet-milestone-notification.service.ts`; admin rows use `createMany(..., skipDuplicates: true)` and socket/email fanout only happens for confirmed created rows. Covered in `backend/tests/e-booklet/e-booklet-phase4-notifications.spec.ts`.
- [x] Firebase auth fail-closed gap outside exact production — FIXED in `backend/src/libs/auth/firebase.ts`; missing credentials now throw unless `FIREBASE_AUTH_LOCAL_DEV_BYPASS=true` is explicitly set in local/test/dev. Covered in `backend/tests/e-booklet/e-booklet-security-config.spec.ts`.
- [x] Credentialed CORS allows `file://` — FIXED in `backend/src/config/corsOptions.ts`; `file://` removed. Covered in `backend/tests/e-booklet/e-booklet-security-config.spec.ts`.
- [x] SMTP disables TLS cert verification — FIXED in `backend/src/apps/store-api/emails/email.service.ts`; removed `tls.rejectUnauthorized=false`. Covered in `backend/tests/e-booklet/e-booklet-security-config.spec.ts`.
- [x] Public `/e-booklets` nav hidden behind `hasStoreAccess` — FIXED in `frontend/src/layouts/Navbar.jsx`; desktop, mobile, and command-palette e-booklet nav entries are public.
- [x] Admin `rewardEnabled` UI is fake/unused — FIXED in `frontend/src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx`; real checkbox added, reward amount input disables when unchecked, and payload sends `rewardAmountSnapshot: 0` when disabled.
- [x] Phase 6 source check too weak — FIXED in `frontend/tests/e-booklet-phase6-source-check.mjs`; now asserts rendered checkbox, bound state, state update handler, disabled amount input, and explicit zero payload behavior.
- [x] Missing listed artifact `kalima-platform/reports/firstlines.csv` — FIXED by restoring the tracked artifact at `reports/firstlines.csv` from HEAD. It is currently an empty tracked CSV artifact; no obsolete review-list edit was needed.

## Tests / verification
- RED capture before fixes: `npm test -- --runInBand backend/tests/e-booklet/e-booklet-phase2-services.spec.ts backend/tests/e-booklet/e-booklet-phase4-notifications.spec.ts backend/tests/e-booklet/e-booklet.routes.spec.ts backend/tests/e-booklet/e-booklet-security-config.spec.ts` from `backend` failed as expected: CORS `file://`, SMTP TLS bypass, Firebase fallback, teacher free-code route, unparsed purchaseId, admin free-code terms requirement, redemption capacity race, terms races, wallet amount overwrite/idempotency, and notification skipDuplicate expectations all failed.
- Prisma client generation: `npx prisma generate --schema=src/apps/store-api/prisma/schema.prisma` — PASS; generated Prisma Client 7.4.0 to `backend/src/apps/store-api/generated/prisma`.
- Backend focused regression: `npm test -- --runInBand tests/e-booklet/e-booklet-phase1-migration.spec.ts tests/e-booklet/e-booklet-phase2-services.spec.ts tests/e-booklet/e-booklet-phase4-notifications.spec.ts tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet-security-config.spec.ts` — PASS; 5 suites, 72 tests passed.
- Backend e-booklet suites: `npm test -- --runInBand tests/e-booklet` — PASS; 6 suites, 123 tests passed.
- Prisma validate: `npx prisma validate --schema=src/apps/store-api/prisma/schema.prisma` — PASS; schema valid.
- Backend build: `npm run build` from `backend` — PASS; `tsc` completed.
- Frontend source checks: `node tests/e-booklet-phase5-source-check.mjs && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs` — PASS; all three source contracts passed.
- Frontend lint/build: `npm run lint && npm run build` from `frontend` — PASS; ESLint passed and Vite built successfully. Build emitted existing warnings: Node `module.register()` deprecation, browser externalization warning for `crypto` from `@embedpdf/snippet`, and large chunk-size warnings.

## Notes for reviewer
- Teacher-generated access codes are now always paid, even if the teacher posts `kind: "free"`; invalid kinds still 400 so clients cannot silently pass arbitrary values.
- Admin free-code generation is intentionally the audited override path: active term + matching instance validation remain, but teacher acceptance is not required for admin-issued free codes.
- Wallet credit is non-coupon-stackable and now preserves canonical purchase price. New structured columns are `wallet_credit_applied` and `final_payable_price`.
- Free shared codes still grant/open access and record redemption but do not count for paid progress; paid codes remain counted for progress.
- `reports/firstlines.csv` was restored exactly from HEAD and is empty; it appears to be a tracked placeholder/listed artifact rather than meaningful report data.
