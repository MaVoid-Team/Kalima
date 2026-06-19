# Phase 8 Blank Page Runtime Fix Handoff

## Scope
Fix the Phase 8 QA blocker where local Vite dev browser routes rendered a blank page with an empty React root.

## Root cause evidence
- Phase 8 admin/student/teacher QA lanes all reproduced empty `#root` on local frontend routes.
- Browser manual import failed with `ReferenceError: $RefreshReg$ is not defined` at `src/components/ui/loading-spinner.jsx`.
- The running frontend dev process inherited ambient `NODE_ENV=production` from the parent shell.
- Served `src/components/ui/loading-spinner.jsx` contained React Refresh registration calls (`$RefreshReg$`) while `index.html` lacked the React Refresh preamble before the fix.
- After the fix and dev-server restart, `index.html` includes the React Refresh preamble and routes mount non-empty DOM.

## Change made
- `frontend/vite.config.js`
  - Converted static config to command-aware `defineConfig(({ command }) => ...)`.
  - For `command === "serve"`, forces `process.env.NODE_ENV = "development"` when the shell inherited a different value.
  - Leaves production build behavior unchanged.

## Verification run
- `npm run lint` in `frontend`: PASS.
- `npm run build && node tests/e-booklet-phase6-source-check.mjs && node tests/e-booklet-phase7-source-check.mjs` in `frontend`: PASS.
- Backend health: `GET http://127.0.0.1:5001/api/v2/health` returned `{ "status": "ok", "version": "v2 new" }`.
- Local dev frontend restarted on `http://127.0.0.1:5173/`.
- Browser route `/`: mounted non-empty DOM and visible landing content.
- Browser route `/e-booklet-invite/qa-test-token`: mounted non-empty DOM and visible logged-out invite CTA (`Login`, `Register`).
- Browser route `/admin/e-booklets`: redirected to `/login` and mounted visible login UI instead of blank page.

## Review focus
Please verify:
1. The fix is narrowly scoped and correct for ambient `NODE_ENV=production` dev-server launches.
2. It does not alter production build mode.
3. The verification evidence is enough to close the Phase 8 blank-page REQUIRED_FIX.
4. Identify any REQUIRED_FIX if this should instead be handled in package scripts or another Vite config location.

## Verdict requested
Return `APPROVED` or `REQUIRED_FIXES` in `.hermes/reviews/phase-8-blank-page-fix/critique-report.md`.
