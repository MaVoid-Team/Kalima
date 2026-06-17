# Student lane QA notes

Scope: Phase 8 browser/static/API-discovery QA only. No source/test/tracker/git edits were made.

Local server/env checks:
- Frontend dev server log: Vite ready at http://127.0.0.1:5173/; process listening on 127.0.0.1:5173 (node PID 34877).
- Backend dev server log: failed during startup with `Error: DATABASE_URL is not set` from `backend/src/libs/db/prisma.ts:13`.
- Port check: no listener on 127.0.0.1:5001.
- Backend env discovery: no `backend/*.env*` file found; only `frontend/.env.local` exists. I listed keys only and did not print values.
- Direct API probe: `curl http://127.0.0.1:5001/api/v2/payment-methods` failed to connect; browser fetch to `http://127.0.0.1:5001/api/v2/e-booklet-store` returned TypeError `Failed to fetch`.

Browser checks:
- `http://127.0.0.1:5173/e-booklet-invite/qa-test-token`: document title loads, but body text is empty and `#root` has no children. Console only showed Vite connect messages plus an empty-message JS exception.
- `http://127.0.0.1:5173/e-booklet-code`: document title loads, but body text is empty and `#root` has no children. Console only showed Vite connect messages plus an empty-message JS exception.
- `http://127.0.0.1:5173/`: same blank-root behavior.
- A browser_vision screenshot was captured of the blank page; the tool did not expose a filesystem path in this CLI session.

Static route/API discovery:
- Frontend routes: `frontend/src/App.jsx:147-149` public `/e-booklets` and details routes; `frontend/src/App.jsx:164-169` protected `/e-booklet-cart` and `/e-booklet-checkout`; `frontend/src/App.jsx:189-190` `/e-booklet-invite/:token` and `/e-booklet-code`; `frontend/src/App.jsx:244-250` student library/viewer routes.
- Logged-out intended UI: `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx:147-156` renders login/register CTA when unauthenticated.
- Invite/code intended endpoints: `frontend/src/hooks/useEBookletAccess.js:321-356` calls `/e-booklet-invites/:token/open`, `/e-booklet-invites/:token/accept`, `/e-booklet-access-codes/redeem`.
- Invite form intended behavior: `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx:72-88` requires terms before code redemption; `:105-130` requires terms and payment proof for online purchase; `:126-129` passes passcode for offline passcode path; `:132-137` online purchase success does not navigate to viewer, while other access paths navigate when instance ID is returned; `:169-212` renders code/passcode/payment/free UI and terms checkbox.
- Checkout intended behavior: `frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx:71-115` distinguishes paid vs free and validates terms/payment proof; `:123-142` posts checkout form and follows `next_url` if returned; `:153-178` shows pending-review success after purchase; `:225-268` shows terms checkbox and paid/free submit notices.
- Backend route discovery: `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts:61-63` store and public checkout; `:154-180` admin purchase list/status/mark-paid/deliver routes; `:219-223` admin student purchase approval route; `:368-386` student e-booklet list, access-code redeem, invite open, invite accept routes.

No test accounts, auth tokens, invite tokens, passcodes, purchase IDs, access IDs, or admin credentials were available in this lane.
