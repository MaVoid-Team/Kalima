You are rerunning only the previously environment-blocked browser-backed proof for Kalima Phase 8.

Repo root: /Users/ziadnasreldin/Documents/GitHub/Kalima
App root: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform
Frontend: http://127.0.0.1:5173
Backend: http://127.0.0.1:5001
Previous report: kalima-platform/.hermes/reviews/phase-8-remaining-proof/report.md
Previous evidence: kalima-platform/.hermes/reviews/phase-8-remaining-proof/evidence.json
Output report: kalima-platform/.hermes/reviews/phase-8-remaining-proof-rerun/report.md
Output evidence JSON if useful: kalima-platform/.hermes/reviews/phase-8-remaining-proof-rerun/evidence.json

Current context:
- Backend was restarted with local dev env and is healthy on 5001.
- Browser-origin fetch from http://127.0.0.1:5173 to http://127.0.0.1:5001/api/v2/health has been manually verified as HTTP 200.
- Previous remaining proof already passed API checks for device binding, viewer/hotspots/expiry, admin view APIs, and partially rendered teacher/admin shells. Its only blocker was browser-tool backend reachability.

Task:
- Do NOT edit source files/package files/migrations/tracker/other reports.
- Use previous fixtures if still valid, or create fresh disposable local fixtures if needed.
- Focus only on closing the prior BLOCKED_BY_ENV items with browser-backed proof:
  1. Teacher authenticated UI/share/access-code proof: delivered e-booklet/share UI, code generation/copy/WhatsApp message if possible.
  2. Viewer/hotspot browser proof: hotspot list/content populates in browser, all hotspot types available; video solo/no-autoplay and multi non-video cards if visible/provable.
  3. Admin view mode browser proof: admin view route populates with Admin View Mode and hotspots/pages.
- Preserve no secrets: never write JWTs/passwords/passcodes/invite/access-code values/tokens/database URLs. Redact sensitive values.
- If browser UI auth setup is impractical but browser-origin backend fetches and API proof cover it, say exactly why. Return REQUIRED_FIX only for reproduced product bugs.

Required report:
# Phase 8 Remaining Proof Rerun Report
Status: PASS | REQUIRED_FIX | BLOCKED_BY_ENV

## Browser backend reachability
- ...

## Teacher authenticated UI/share proof
- Result: ...
- Evidence: ...

## Viewer/hotspot browser proof
- Result: ...
- Evidence: ...

## Admin view mode browser proof
- Result: ...
- Evidence: ...

## Required fixes / blockers
- None, or exact list.
