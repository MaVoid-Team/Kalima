Repo root: /Users/ziadnasreldin/Documents/GitHub/Kalima
App root: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform
Frontend: http://127.0.0.1:5173
Backend: http://127.0.0.1:5001

Context: Phase 8 browser QA previously found a shared blank-page blocker caused by Vite React Refresh missing preamble under ambient NODE_ENV=production. The fix in frontend/vite.config.js has been independently APPROVED. Rerun your lane against the currently running fixed frontend/backend. Do not edit source files. Use browser/API as needed. Do not record secrets/tokens.

Output a report.md in your lane folder with Status: PASS | REQUIRED_FIX | BLOCKED_BY_ENV. Include concrete evidence and exact reproduction for any blocker.

Lane: Teacher/viewer/device/mobile-desktop QA rerun. Verify teacher/viewer/device-related routes no longer fail due to blank root, backend health is available, and smoke mobile/desktop rendering where possible. If auth fixtures block a protected route, record redirect/login UI evidence and any API/device checks possible without editing source. Output: kalima-platform/.hermes/reviews/phase-8-parallel-browser-qa-rerun/teacher-viewer-device/report.md
