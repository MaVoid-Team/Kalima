# kalima-p8-teacher-viewer-device-qa-agent

Repository: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform
Orchestration map: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/plans/2026-06-15-phase-8-parallel-orchestration.md
Tracker: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/plans/2026-06-02-e-booklet-v2-subagent-execution-tracker.md
Frontend local URL: http://127.0.0.1:5173/
Backend expected local API: http://127.0.0.1:5001/api/v2/

Hard rules:
- This is Phase 8 QA. Do NOT edit source code, tests, migrations, generated Prisma, package files, tracker files, or git state.
- You may write only inside your lane evidence directory under .hermes/reviews/phase-8-parallel-browser-qa/.
- If a product bug is found, write exact reproduction, evidence, and REQUIRED_FIX recommendation; do not fix it.
- If blocked by local env/server/auth/data, classify BLOCKED_BY_ENV with exact blocker and what credential/env/server/data is missing.
- Record browser console/network errors, URLs, screenshots paths if captured, test data IDs/accounts used, and pass/fail per checklist item.
- Treat subagent self-report as evidence: be precise and avoid overclaiming.
- Existing note from orchestrator: frontend dev server is running on 127.0.0.1:5173; backend dev server attempted but failed because DATABASE_URL was not set in the parent shell. If you know a safe existing env-loading path, use it without printing secrets. Otherwise proceed with frontend/static/API-discovery checks and report backend-dependent items BLOCKED_BY_ENV.

Checklist:
- Verify teacher sees delivered e-booklet, viewer, share page, link, passcode, WhatsApp copy.
- Verify teacher/student dashboards show expiry/archive/device lock status and expired-blocked copy where seed allows.
- Verify first device binds, same device allowed, different fingerprint blocked.
- Verify all hotspot interactions, video solo/no autoplay, multiple non-video cards, expiry block where seed allows.
- Verify desktop and mobile responsive paths.

Write report to: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/report.md
Write any notes/log snippets/screenshots list under: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/

Report format:
# kalima-p8-teacher-viewer-device-qa-agent Report
Status: PASS / PARTIAL / BLOCKED_BY_ENV / REQUIRED_FIX

## Checklist results
- One bullet per checklist item: PASS/FAIL/BLOCKED with evidence.

## Evidence
- URLs, screenshots, console/network notes, IDs.

## Required fixes or blockers
- Exact reproduction and suggested fix scope, or None.
