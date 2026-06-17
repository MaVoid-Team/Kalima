# Phase 8 parallel browser QA rerun — student purchase/passcode/zero-price
Status: PASS

## Scope
Reran the student lane against the currently running fixed frontend/backend:
- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:5001
- No source files edited.
- No secrets, auth tokens, passcodes, or invite tokens recorded.

## Rendering rerun evidence
- PASS — `/e-booklet-invite/qa-test-token` now renders non-empty logged-out invite UI instead of the previous blank root.
  - Browser URL: `http://127.0.0.1:5173/e-booklet-invite/qa-test-token`
  - Evidence: `#root.innerHTML.length = 21339`; visible text includes `E-Booklet Invite`, `Login or register as a student before accepting this e-booklet invite.`, `Login`, `Register`.
  - Browser console after render: no captured JS errors.
- PASS — `/e-booklet-code` now renders non-empty logged-out code redemption UI instead of the previous blank root.
  - Browser URL: `http://127.0.0.1:5173/e-booklet-code`
  - Evidence: `#root.innerHTML.length = 21311`; visible text includes `Redeem E-Booklet Code`, `Login`, `Register`.
- PASS — protected student routes render non-empty login UI via auth redirect instead of blanking.
  - Browser URL requested: `http://127.0.0.1:5173/student/e-booklets`; final URL `http://127.0.0.1:5173/login`.
  - Evidence: `#root.innerHTML.length = 30792`; visible text includes `Welcome Back`, `Email or Phone Number`, `Password`, `Log In`.
  - Browser URL requested: `http://127.0.0.1:5173/student/e-booklets/22`; final URL `http://127.0.0.1:5173/login`.
  - Evidence: `#root.innerHTML.length = 30795`; visible login UI rendered.
- PASS — public e-booklet store/detail routes render non-empty UI with live backend data.
  - Browser URL: `http://127.0.0.1:5173/e-booklets`; evidence: `#root.innerHTML.length = 101917`; visible store cards include a zero-price fixture (`EGP 0`) and paid fixtures.
  - Browser URL: `http://127.0.0.1:5173/e-booklets/instances/22`; evidence: `#root.innerHTML.length = 34392`; visible text includes `Smoke E-Booklet zero smoke-1781458293495`, `TEMPLATE PRICE`, `EGP 0`, `Add to e-booklet cart`.
- PASS — served Vite HTML has the React Refresh preamble before Vite/client and app entry.
  - Terminal probe of `/e-booklet-invite/qa-test-token`: HTML size `3667` bytes; snippet contained `import { injectIntoGlobalHook } from "/@react-refresh"`, `window.$RefreshReg$ = () => {};`, then `src="/@vite/client"`; `/@vite/client` appears before `/src/main.jsx`.

## Backend/API evidence
- Backend health: `GET http://127.0.0.1:5001/api/v2/health` returned HTTP 200 with JSON health payload.
- Store API: `GET http://127.0.0.1:5001/api/v2/e-booklet-store?limit=3` returned HTTP 200 and 3 items, including public instance IDs 26, 22, and 21.
- Unauthenticated protected lifecycle APIs correctly require auth:
  - `GET /api/v2/student/e-booklets` returned HTTP 401 with `Authorization header required`.
  - `POST /api/v2/e-booklet-invites/qa-test-token/accept` returned HTTP 401 with `Authorization header required`.
  - `POST /api/v2/e-booklet-access-codes/redeem` returned HTTP 401 with `Authorization header required`.
- Public invite probe for the supplied placeholder token:
  - `GET /api/v2/e-booklet-invites/qa-test-token/open` returned HTTP 404 with `E-booklet invite not found`.
  - This does not affect the rendering rerun: the logged-out invite page renders before authenticated acceptance and shows the correct login/register gate.

## Fixture-dependent lifecycle checks
Not executed as end-to-end lifecycle checks in this lane because the available running environment did not provide a usable authenticated student/admin fixture, valid invite token, passcode, or access code for this rerun.

What was available:
- Live public e-booklet fixtures exist in the store API/browser, including zero-price and paid instances.
- The supplied browser token `qa-test-token` is a route placeholder for rendering and is not a valid backend invite token (`open` returned 404).

What remains fixture-dependent, not a rendering-fix failure:
- Passcode lifecycle: wrong passcode blocked; correct passcode + terms grants access and opens `/student/e-booklets/:instanceId`.
- Paid purchase lifecycle: payment proof submission creates pending purchase; admin approval creates access/consumes seat; student can open viewer after approval.
- Zero-price lifecycle: terms-only free invite/checkout grants access without payment proof/passcode.

## Required fixes / blockers
- Required fixes: none for the Phase 8 blank-page rendering blocker. The rerun confirms the student invite/code/protected routes mount non-empty UI after the Vite React Refresh fix.
- Environment/fixture dependency: full passcode/purchase/zero-price lifecycle requires a disposable authenticated student, admin approval fixture, and valid invite/access-code fixtures. No exact blocker reproduction is available from this rerun because the rendering blocker is resolved and lifecycle data was not provided.
