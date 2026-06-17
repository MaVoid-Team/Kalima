# Phase 8 Lifecycle E2E Report
Status: PASS

## Summary
- Created disposable local QA fixtures with run id `phase8-20260615112710-8cd2f4` in the existing local/test database.
- Verified all three lifecycle paths against the running backend at `http://127.0.0.1:5001`.
- Verified protected student viewer access via authenticated API metadata/page calls; performed browser-visible protected-route smoke against the frontend at `http://127.0.0.1:5173`.
- Sensitive values were not recorded: JWTs, passwords, passcodes, invite tokens, access codes, and connection strings are omitted.

## Passcode lifecycle
- Result: PASS
- Evidence: Teacher invite API created a passcode invite for disposable instance `30`; wrong passcode attempt returned HTTP 403; correct passcode with terms returned HTTP 200 and created `offline_passcode` access; authenticated student viewer metadata returned HTTP 200.

## Paid purchase lifecycle
- Result: PASS
- Evidence: Before approval, the paid student viewer metadata request returned HTTP 403. Payment-proof checkout returned HTTP 201 with purchase status `pending`; purchase link had no access before approval. Admin approval returned HTTP 200; purchase link then had an access id and approved timestamp; instance used invite count became `1`; authenticated student viewer metadata returned HTTP 200.

## Zero-price lifecycle
- Result: PASS
- Evidence: Terms-only checkout for zero-price instance `32` returned HTTP 201 with purchase status `confirmed`, next URL present, access id present, purchase link access present, approved timestamp present, and authenticated student viewer metadata returned HTTP 200. Viewer page 1 API returned HTTP 200 with render mode `server-page`.

## Browser proof
- Browser navigation to `http://127.0.0.1:5173/student/e-booklets/32` without auth redirected to `http://127.0.0.1:5173/login` and rendered non-empty UI: “Welcome Back”, “Email or Phone Number”, and “Log In”.
- Authenticated final viewer access was verified through backend viewer metadata/page API checks without recording credentials or JWTs.
- Full structured evidence: `kalima-platform/.hermes/reviews/phase-8-lifecycle-e2e/evidence.json`.

## Required fixes / blockers
- None.
