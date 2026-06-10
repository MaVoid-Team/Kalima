# Fekra/Kalima E-booklet V2 Finish — Critique Handoff

## Scope
Finish confirmed gaps from coverage/browser evidence for Kalima e-booklet V2:
- Invite online purchase flow should use real payment fields + screenshot upload, not raw purchase/proof IDs.
- Public e-booklet checkout should be student purchase/access flow, not teacher customization/onboarding form.
- Admin devices page should provide launch-grade student selector, not manual student user ID only.
- Admin View Mode should allow Admin/SubAdmin to preview delivered e-booklet instance without consuming student seat or binding device.
- Public store browser layout should not show clipped/broken featured card.

## Repo / branch
- Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
- Branch: `codex/e-booklet-editor-autodetect`

## Files intentionally changed in this slice
Backend:
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/dtos/e-booklet.dto.ts`
- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- `backend/src/apps/store-api/services/e-booklet.service.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts`
- `backend/tests/e-booklet/e-booklet.service.spec.ts`

Frontend:
- `frontend/src/App.jsx`
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/src/hooks/useEBookletAccess.js`
- `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`
- `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
- `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`
- `frontend/src/pages/e-booklets/EBookletStorePage.jsx`
- `frontend/src/pages/e-booklets/EBookletViewerPage.jsx`

## Unrelated/pre-existing dirty worktree paths to ignore unless they affect this slice
Do not review as this slice unless referenced above:
- `../.gitignore`
- deleted `.hermes/plans/...`, `.hermes/reviews/...`, docs/reports files
- `backend/src/config/corsOptions.ts`
- `backend/src/libs/auth/firebase.ts`
- `frontend/src/components/admin/users/CreateUserDialog.jsx`
- `frontend/src/components/student/StudentSidebar.jsx`
- `frontend/src/layouts/Navbar.jsx`
- `frontend/src/locales/ar/student.json`
- `frontend/src/locales/en/student.json`

## Verification already run
- `cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand`
  - PASS: 2 suites, 67 tests.
- `cd backend && npm run build`
  - PASS: `tsc` exited 0.
- `cd frontend && npm run build`
  - PASS: Vite build exited 0. Existing warning: large chunks; existing crypto externalization warning from `@embedpdf/snippet`.
- Browser QA via Hermes browser:
  - `/e-booklets` loads public store with 3 active API-returned instances (`/api/v2/e-booklet-store` returned `total: 3`).
  - First store card layout was initially visually broken/clipped; fixed in `EBookletStorePage.jsx`; follow-up screenshot shows uniform usable cards.
  - `/e-booklets/instances/3` loads public detail with template, teacher, price, pages, hotspots, access info.
  - `/e-booklet-checkout` unauthenticated redirects to login, as expected.

## Known limitation / reviewer focus
- Authenticated browser QA with fake localStorage session did not persist in the Hermes browser context, so Admin View Mode was verified by route tests/build rather than full browser login. If credentials/session are available, reviewer should run a real authenticated admin browser pass.
- Please inspect Admin View Mode security carefully: it must require Admin/SubAdmin routes and must not consume student seats or bind devices.
- Please inspect multipart payment proof plumbing carefully: paid flows should require screenshot/payment method/transfer source; zero-price flows should not require payment proof.

## Requested verdict format
Return one of:
- `APPROVED`
- `REQUIRED_FIXES`

If `REQUIRED_FIXES`, list blockers only, with exact file/path and why it blocks launch.
