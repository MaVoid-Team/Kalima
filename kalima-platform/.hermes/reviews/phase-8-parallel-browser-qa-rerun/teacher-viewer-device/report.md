# Teacher/viewer/device/mobile-desktop QA rerun

Status: PASS

Scope: rerun teacher/viewer/device lane against the already-running fixed frontend at http://127.0.0.1:5173 and backend at http://127.0.0.1:5001. No source files edited. No secrets/tokens recorded.

## Backend health/API evidence

Command evidence collected with curl against backend:

- GET http://127.0.0.1:5001/health -> 200 application/json; body: {"status":"ok"}
- GET http://127.0.0.1:5001/api/v2/health -> 200 application/json; body: {"status":"ok","version":"v2 new"}
- GET http://127.0.0.1:5001/api/v2/e-booklet-store -> 200 application/json; public store API returned success:true and data array.
- GET http://127.0.0.1:5001/api/v2/teacher/e-booklets -> 401 application/json; body: {"success":false,"message":"Authorization header required"}
- GET http://127.0.0.1:5001/api/v2/teacher/e-booklet-analytics -> 401 application/json; body: {"success":false,"message":"Authorization header required"}
- GET http://127.0.0.1:5001/api/v2/e-booklet-viewer/1/metadata -> 401 application/json; body: {"success":false,"message":"Authorization header required"}
- GET http://127.0.0.1:5001/api/v2/e-booklet-viewer/1/pages/1 -> 401 application/json; body: {"success":false,"message":"Authorization header required"}
- GET http://127.0.0.1:5001/api/v2/admin/e-booklet-instances/1/users/1/devices -> 401 application/json; body: {"success":false,"message":"Authorization header required"}
- GET http://127.0.0.1:5001/api/v2/admin/e-booklet-viewer/1/metadata -> 401 application/json; body: {"success":false,"message":"Authorization header required"}

The protected API behavior is an expected auth fixture limitation, not a blank-page/frontend blocker.

## Browser route evidence

Desktop browser route smoke checks:

- http://127.0.0.1:5173/ rendered normally. Evidence: title "منصة كلمة التعليمية | طريقك للتميز والنجاح", root text length 2489, visible landing copy beginning "A complete school success ecosystem" and "Education-first platform for students, teachers, and families".
- http://127.0.0.1:5173/e-booklets rendered normally. Evidence: root text length 3088, visible E-booklet store copy including "E-booklets built for branded classroom delivery", "Template plus teacher PDF", and search box "Search e-booklet templates".
- http://127.0.0.1:5173/teacher/e-booklets redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: root text length 434, visible "Welcome Back", "Email or Phone Number", "Password", "Log In", and "Google".
- http://127.0.0.1:5173/teacher/e-booklet-analytics redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: hasLogin=true, root text length 434.
- http://127.0.0.1:5173/teacher/e-booklets/1 redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: root text length 434 and visible login form text.
- http://127.0.0.1:5173/teacher/e-booklets/1/invites redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: root text length 434 and visible login form text.
- http://127.0.0.1:5173/admin/e-booklet-instances/1/view redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: visible login form with "Welcome Back" and credential fields.
- http://127.0.0.1:5173/admin/e-booklet-instances/1/devices redirected to http://127.0.0.1:5173/login, rendered login UI. Evidence: hasLoginHeading=true, root text length 434.

Browser console evidence after the route smoke: console_messages=[], js_errors=[], total_errors=0.

## Mobile/desktop rendering note

- Desktop viewport evidence: browser reported viewport 1280x577 and the login page visibly rendered as a centered card with header nav and footer; it was not blank.
- Mobile-specific emulation was limited by the available browser tool, but the rendered document includes a mobile viewport meta tag: `width=device-width, initial-scale=1.0, maximum-scale=5.0`. Protected mobile route smoke is therefore limited to confirming the same route renders non-blank in the available browser viewport and is configured for responsive scaling.

## Blank-page blocker verdict

No route tested reproduced the prior blank root / missing React Refresh preamble failure. Public routes render content, protected teacher/viewer/device/admin routes render the expected login redirect UI when unauthenticated, backend health is available, and protected backend APIs return expected 401 JSON without exposing or requiring tokens.
