# Admin/editor/access-management QA rerun
Status: PASS

## Summary
- PASS: `/admin/e-booklets` no longer hits the prior blank-page/React Refresh blocker. Unauthenticated navigation redirects to `/login`, and the login UI renders with non-empty DOM.
- PASS: the specific prior failing React module path no longer throws on dynamic import; Vite-served HTML includes the React Refresh preamble and Vite client.
- PASS: backend is currently reachable, and protected admin endpoints return expected unauthenticated 401s.
- Core admin Phase 8 API evidence was reviewed from the prior lane and not destructively repeated because the rerun target was the browser blocker and the previous API checklist already passed.

## Browser evidence from current fixed frontend
- Navigated to `http://127.0.0.1:5173/admin/e-booklets`.
  - Observed URL: `http://127.0.0.1:5173/login`.
  - Visible UI: `Welcome Back`, `Email or Phone Number`, `Log In`, `Sign Up`.
  - DOM evidence: `#root.innerHTML.length = 30788`, `document.querySelectorAll('*').length = 211`.
  - Console errors after navigation: `0`.
- Navigated to `http://127.0.0.1:5173/`.
  - Visible UI: `Education-first platform for students, teachers, and families`, `Start Learning`, `Visit Marketplace`.
  - DOM evidence: `#root.innerHTML.length = 59057`, `document.querySelectorAll('*').length = 406`.
  - Console errors after navigation: `0`.
- React Refresh regression probe:
  - `import('/src/components/ui/loading-spinner.jsx')` returned `{ ok: true, keys: ['default'] }`; the prior `$RefreshReg$ is not defined` failure did not reproduce.
  - Fetching Vite HTML for `/admin/e-booklets` showed `hasRefreshPreamble: true` and `hasViteClient: true`.

## Backend/API evidence from current backend
- `GET http://127.0.0.1:5001/api/v2/health` returned 200 with `{ "status": "ok", "version": "v2 new" }`.
- `GET /api/v2/admin/e-booklet-templates` without token returned 401 `{ "success": false, "message": "Authorization header required" }`.
- `GET /api/v2/admin/e-booklet-instances` without token returned 401 `{ "success": false, "message": "Authorization header required" }`.

## Core admin Phase 8 API evidence reviewed
Source: `.hermes/reviews/phase-8-parallel-browser-qa/admin/latest-api-results.json` and `.hermes/reviews/phase-8-parallel-browser-qa/admin/report.md`.

- Template create: PASS. Prior API POST `/api/v2/admin/e-booklet-templates` returned 201, template id 24, slug `phase-8-admin-qa-admin-qa-1781520740879`, status `draft`.
- PDF accepted / DOCX rejected: PASS. Prior PDF upload returned 201, asset id 115, metadata `page_count: 2`; DOCX upload returned 400 with `Invalid document type ... Allowed: PDF only`.
- Hotspots/version publish: PASS. Prior version id 24 created hotspots ids 160-167 across the required hotspot types; publish returned 200 with version 24 status `active`.
- Teacher instance/deal fields: PASS. Prior admin deal id 30 delivered instance id 26 with quota 7, expiry `2026-07-15T10:52:21.008Z`, marketing price 160, internal price 80, status `active`.
- Device list/reset/allowance: PASS. Prior seeded instance 25/student 76 returned device list 200, reset 200 with count 1, and allowance update 200 using `allowedDevices: 2`; snake_case validation returned expected 422.

## Reproduction for prior blocker rerun
1. Open `http://127.0.0.1:5173/admin/e-booklets` against the currently running fixed frontend.
2. Expected unauthenticated behavior: redirect to `/login` with visible login form.
3. Actual: redirected to `/login`, `#root` is non-empty, visible login UI renders, and browser console has no JS errors.
4. Probe `import('/src/components/ui/loading-spinner.jsx')`; actual result loads successfully instead of throwing `$RefreshReg$ is not defined`.

## Evidence files
- `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa-rerun/admin/rerun-evidence.json`
- Prior reviewed API evidence:
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/latest-api-results.json`
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/report.md`

## Notes
- No source files were edited.
- No secrets or token values were recorded.
- No REQUIRED_FIX blockers found in this rerun.
