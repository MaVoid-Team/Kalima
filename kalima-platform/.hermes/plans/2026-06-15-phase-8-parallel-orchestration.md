# Phase 8 Parallel Browser QA Orchestration

Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
Tracker: `.hermes/plans/2026-06-02-e-booklet-v2-subagent-execution-tracker.md`
Phase: Phase 8 — Browser QA and Mobile/Desktop Verification

## Parent/orchestrator owns
- Repo state and dirty-tree protection.
- Dev server lifecycle and readiness checks.
- Shared evidence directory: `.hermes/reviews/phase-8-parallel-browser-qa/`.
- File ownership map and conflict control.
- Central verification after agents finish.
- Any decision to assign code fixes.
- Final Phase 8 handoff and Phase 9 critique gate input.

## Current repo state constraint
The tree already contains large approved Phase 1–7 dirty/uncommitted work and review artifacts. Phase 8 agents must not reset, clean, commit, or broadly refactor. QA agents are read-only with respect to source unless a specific fix-agent is later assigned by the parent.

## Lane rules
- QA agents may use browser/API/manual scripts to create test data and evidence.
- QA agents may write only under `.hermes/reviews/phase-8-parallel-browser-qa/<lane>/`.
- QA agents must not edit source files, migrations, generated Prisma, tests, package files, or tracker files.
- If a QA failure requires code changes, agent writes a blocker report with reproduction steps and stops; parent will assign a fix lane.
- No two edit agents may touch the same source paths. During initial QA there are zero edit agents.

## Phase 8 split

### Lane A — Admin creation/editor/access-management QA
Agent: `kalima-p8-admin-qa-agent`
Writable evidence path only: `.hermes/reviews/phase-8-parallel-browser-qa/admin/`
Checklist:
- Verify admin creates template.
- Verify PDF upload succeeds and DOCX rejection is correct.
- Verify all hotspot types can be created and version published.
- Verify admin manually creates teacher instance/deal with quota, expiry, marketing price, internal price.
- Verify admin device/access list, reset, new binding/admin allowance controls if enough seed data exists.
- Record URLs, ids, screenshots, console errors, and blockers.

### Lane B — Student access/purchase/passcode QA
Agent: `kalima-p8-student-access-qa-agent`
Writable evidence path only: `.hermes/reviews/phase-8-parallel-browser-qa/student/`
Checklist:
- Verify logged-out invite forces login/register.
- Verify priced online purchase creates pending generic purchase and no access until admin approval.
- Verify admin approval auto-creates access and consumes seat.
- Verify wrong passcode blocked without proof/access.
- Verify correct passcode + terms creates access and consumes seat.
- Verify zero-price + terms creates access without proof/passcode.
- Record URLs, ids, screenshots, console errors, and blockers.

### Lane C — Teacher/dashboard/viewer/device/mobile-desktop QA
Agent: `kalima-p8-teacher-viewer-device-qa-agent`
Writable evidence path only: `.hermes/reviews/phase-8-parallel-browser-qa/teacher-viewer-device/`
Checklist:
- Verify teacher sees delivered e-booklet, viewer, share page, link, passcode, WhatsApp copy.
- Verify teacher/student dashboards show expiry/archive/device lock status and expired-blocked copy where seed allows.
- Verify first device binds, same device allowed, different fingerprint blocked.
- Verify all hotspot interactions, video solo/no autoplay, multiple non-video cards, expiry block where seed allows.
- Verify desktop and mobile responsive paths.
- Record URLs, ids, screenshots, console errors, and blockers.

## Integration after lanes
1. Parent reads all lane reports/logs/evidence.
2. Parent classifies results:
   - PASS: evidence sufficient.
   - BLOCKED_BY_ENV: local server/auth/data setup issue.
   - REQUIRED_FIX: reproducible product bug.
3. If REQUIRED_FIX exists, parent creates a scoped fix prompt with exact files and reproduction, then runs focused verification and independent re-review.
4. If all PASS or only accepted limitations remain, parent updates Phase 8 evidence/handoff.

## Initial verification gates
- Backend readiness/API health if available.
- Frontend readiness at `http://127.0.0.1:5173`.
- After QA/fixes: backend focused tests/build and frontend build.

## Start condition
This orchestration file is the required file-ownership map. Only after writing this file may Phase 8 agents start.
