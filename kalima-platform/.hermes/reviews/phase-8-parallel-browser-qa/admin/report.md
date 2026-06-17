# kalima-p8-admin-qa-agent Report
Status: REQUIRED_FIX

## Checklist results
- Verify admin creates template: PASS. API POST `/api/v2/admin/e-booklet-templates` returned 201 and created template id 24, slug `phase-8-admin-qa-admin-qa-1781520740879`, status `draft`, created_by 67.
- Verify PDF upload succeeds and DOCX rejection is correct: PASS. API POST `/api/v2/admin/e-booklet-files/document` accepted PDF asset id 115 with metadata page_count 2. DOCX upload to the same endpoint returned 400 with message `Invalid document type: application/vnd.openxmlformats-officedocument.wordprocessingml.document. Allowed: PDF only`.
- Verify all hotspot types can be created and version published: PASS by API. Created version id 24, then created hotspots: text id 160, image id 161, audio id 162, uploaded video id 163, YouTube video id 164, file id 165, link id 166, question_answer id 167. Publish endpoint returned 200 and version 24 status `active`, template status visible as `published` in instance listing.
- Verify admin manually creates teacher instance/deal with quota, expiry, marketing price, internal price: PASS by API. Created purchase/deal id 30 for teacher id 75 with marketing_price 160 and internal_price 80, uploaded custom PDF asset id 120, delivered instance id 26 with invite_quota 7, access_expires_at `2026-07-15T10:52:21.008Z`, student_marketing_price 160, internal_price 80, status `active`.
- Verify admin device/access list, reset, new binding/admin allowance controls if enough seed data exists: PARTIAL/PASS with seed data. New instance 26 had no student rows, so student-specific device controls were not applicable there. Existing seeded instance 25 had student user id 76 and one active device. Device list returned 200, reset returned 200 with count 1, and allowance update returned 200 when using DTO field `allowedDevices: 2`. A snake_case probe with `allowed_devices` returned expected validation 422, recorded as API-shape evidence, not a product failure.
- Admin browser rendering/static check: FAIL / REQUIRED_FIX. Navigating to `http://127.0.0.1:5173/admin/e-booklets` and `http://127.0.0.1:5173/` produced a blank page; `#root` stayed empty. Browser console showed only Vite connect messages plus an unnamed JS exception. Manual browser eval `import('/src/main.jsx')` exposed `ReferenceError: $RefreshReg$ is not defined` at `/src/components/ui/loading-spinner.jsx:12:1`. Frontend production build still completed successfully, so this appears specific to local dev browser runtime/HMR setup.

## Evidence
- Backend health: GET `http://127.0.0.1:5001/api/v2/health` returned `{ "status": "ok", "version": "v2 new" }`.
- Frontend checked: `http://127.0.0.1:5173/admin/e-booklets`; browser snapshot empty, element_count 0.
- Backend auth/test account used: JWT signed for admin user id 67 (`phase6-admin-1781478603590@local.test`) with store Admin role. Token value not recorded.
- Test run id: `admin-qa-1781520740879`.
- Primary IDs: template 24, PDF asset 115, version 24, hotspot assets image/audio/video/file 116/117/118/119, hotspots 160-167, purchase 30, custom PDF asset 120, delivered instance 26, teacher 75.
- Device seed IDs: seeded instance 25, student user 76, listed active device id 11 before reset.
- Evidence files:
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/latest-api-results.json`
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/admin-qa-1781520740879-api-results.json`
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/device-controls-api-results.json`
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/device-allowance-retry-results.json`
  - `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/admin/browser-console-notes.md`
  - Fixture PDFs/DOCX under the same directory: `admin-qa-1781520740879-valid.pdf`, `admin-qa-1781520740879-reject.docx`.
- Console/network notes:
  - Vite dev server process was running from `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend`.
  - Browser console on navigation: `[vite] connecting...`, `[vite] connected.`, plus unnamed JS exception.
  - Manual import error: `$RefreshReg$ is not defined` at `/src/components/ui/loading-spinner.jsx:12:1`.
  - No API failures in primary admin API flow; DOCX 400 was expected.
  - Frontend `npm run build` completed successfully; warnings only about chunk size and `crypto` externalized for browser compatibility from `@embedpdf/snippet`.
- Screenshots:
  - Browser visual capture showed a blank white page for the admin route; the browser_vision tool did not expose a filesystem screenshot path in its response.

## Required fixes or blockers
- REQUIRED_FIX: Local frontend dev browser runtime renders a blank page for admin/root routes.
  - Reproduction:
    1. Ensure frontend dev server is running at `http://127.0.0.1:5173/`.
    2. Navigate to `http://127.0.0.1:5173/admin/e-booklets` or `/`.
    3. Observe blank white page; `document.getElementById('root').innerHTML` is empty.
    4. Browser console reports an unnamed JS exception; evaluating `import('/src/main.jsx')` returns `ReferenceError: $RefreshReg$ is not defined` at `/src/components/ui/loading-spinner.jsx:12:1`.
  - Suggested fix scope: inspect Vite React refresh/HMR setup and any custom Vite/Rolldown plugin ordering or preamble injection that can leave transformed JSX modules referencing `$RefreshReg$` before the React refresh preamble is installed. Verify by reloading local dev server in browser and confirming admin/root routes mount non-empty DOM.
- Blocker note: backend was initially reported unavailable because `DATABASE_URL` was unset in the parent shell, but a safe local Postgres env path was found and backend API was verified on `127.0.0.1:5001`. No backend blocker remains for API-level admin checklist.
