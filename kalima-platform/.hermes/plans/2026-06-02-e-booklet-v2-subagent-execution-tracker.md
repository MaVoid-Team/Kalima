# Kalima E-Booklet V2 Subagent Execution Tracker

Source plan: `.hermes/plans/2026-05-31_192729-fekra-e-booklet-v2.md`
PRD summary: `.hermes/plans/fekra-e-booklet-v2-prd-summary.md`
Repo: `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`
Branch: `codex/e-booklet-editor-autodetect`

## Operating Model

- Parent Hermes is the orchestrator: repo state, phase boundaries, task context, verification, tracker updates, commits, and user reporting.
- Each phase starts with a fresh implementation subagent. If a phase is too large, split into fresh task subagents inside that phase.
- Every implementation phase has two independent review agents:
  1. Spec compliance reviewer: PASS or exact gaps.
  2. Code quality/security reviewer: APPROVED or REQUEST_CHANGES.
- Required fixes use a fresh fix agent scoped only to reviewer findings.
- Do not run parallel implementation agents against shared backend files, especially:
  - `backend/src/apps/store-api/services/e-booklet.service.ts`
  - `backend/src/apps/store-api/prisma/schema.prisma`
  - `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
  - `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- Parallel agents are allowed only for read-only discovery/review or clearly isolated frontend pages.
- A phase is not done until parent verification has run and the review status is recorded here.
- The full feature is not complete until `.hermes/reviews/fekra-e-booklet-v2/critique-report.md` verdict is `APPROVED`.

## Exact Phase Todo List

### Phase 0 — Pre-flight and Orchestration Setup

Status: In progress

Tasks:
- [ ] Verify git branch/status and preserve unrelated dirty files.
- [ ] Read source plan and PRD summary.
- [ ] Create/update this tracker.
- [ ] Confirm baseline backend/frontend commands.
- [ ] Create first phase handoff context for the fresh Phase 1 agent.

Agent assignment:
- Owner: Parent Hermes orchestrator.
- No implementation subagent until repo state is verified.

Verification gate:
- `git status --short --branch`
- Backend/frontend package scripts inspected.

---

### Phase 1 — Schema + DTO Foundation

Status: Completed — spec review PASS, quality/security review APPROVED on 2026-06-02.

Source plan tasks:
- Task 1: Add backend tests for V2 schema/business rules.
- Task 2: Add Prisma schema and migration.
- Task 3: Implement backend DTO validation.
- Task 4: Enforce PDF-only backend upload.

Detailed todo:
- [x] Add failing backend tests for PDF-only documents, hotspot validation, reference auto-assignment, device first-bind/block, admin reset/additional allowance, online/offline/free access, pricing, terms, and expiry.
- [x] Run focused e-booklet tests and record expected failures.
- [x] Modify Prisma schema for V2 hotspot fields, shape/video enums, device binding, expiry/archive, instance pricing, and purchase bridge.
- [x] Create migration SQL: `backend/src/apps/store-api/prisma/migrations/20260602120000_e_booklet_v2/migration.sql`.
- [x] Run `npx prisma generate --schema src/apps/store-api/prisma/schema.prisma`.
- [x] Extend DTO validation for hotspot V2 payloads, pricing, access policy, passcode, terms/payment proof, and devices.
- [x] Enforce PDF-only backend document uploads in middleware and service guard.
- [x] Run focused backend tests and backend build; no remaining focused failures.

Fresh agent plan:
- `kalima-p1-foundation-dev`: implements Tasks 1–4 serially using TDD.
- `kalima-p1-spec-reviewer`: verifies the implementation matches Tasks 1–4 and product decisions.
- `kalima-p1-quality-reviewer`: reviews code quality, migration safety, validation coverage, and security/privacy boundaries.
- `kalima-p1-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
```

---

### Phase 2 — Backend Hotspot V2 + Authorized Media Access

Status: Completed — parent verification PASS on 2026-06-02; independent reviewer retry blocked by provider 429, parent performed focused spec/quality inspection.

Source plan tasks:
- Task 5: Implement hotspot V2 service normalization and validation.
- Task 6: Add authorized file download/media access for viewer hotspots.

Detailed todo:
- [x] Add `normalizeLegacyHotspotContent` helper.
- [x] Add `validateHotspotContent` helper.
- [x] Update create/update hotspot service methods for V2 blocks and reference assignment.
- [x] Normalize old and new hotspots in list/viewer/content responses.
- [x] Add authorized viewer asset route: `GET /e-booklet-viewer/hotspots/:hotspotId/assets/:assetId`.
- [x] Check user active access and expiry/archive before serving asset.
- [x] Return private/no-store file stream or metadata.
- [x] Add hotspot media/file audit events.
- [x] Frontend hook not changed; backend authorized streaming route was sufficient for Phase 2 scope.
- [x] Run focused tests: 43 e-booklet tests passed; backend build passed.

Fresh agent plan:
- `kalima-p2-hotspots-media-dev`: implements Tasks 5–6.
- `kalima-p2-spec-reviewer`: checks hotspot behavior, old-data compatibility, and private media access rules.
- `kalima-p2-quality-reviewer`: checks service design, auth boundaries, streaming/no-store behavior, and test coverage.
- `kalima-p2-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
```

---

### Phase 3 — Backend Commercial Access, Passcodes, Purchase Bridge, Devices

Status: Completed — spec review PASS and quality/security review APPROVED on 2026-06-02.

Source plan tasks:
- Task 7: Implement teacher deal, pricing, terms, and expiry backend rules.
- Task 8: Implement invite passcode and student purchase bridge backend flows.
- Task 9: Implement device binding backend flows.

Detailed todo:
- [x] Treat `e_booklet_purchases` as Teacher E-booklet Deal/admin onboarding, not teacher checkout.
- [x] Snapshot effective marketing/internal price on admin-created instance.
- [x] Validate `internal_price <= effective marketing_price`.
- [x] Require access expiry date for delivered instances.
- [x] Enforce expiry in all viewer access paths.
- [x] Implement `archiveExpiredInstances` service method.
- [x] Generate and store recoverable six-digit invite passcodes where required.
- [x] Implement online purchase bridge to existing generic purchase/manual screenshot flow.
- [x] Auto-create access after admin purchase approval and store `marketing_price_snapshot`.
- [x] Implement offline-paid passcode access with terms, seat consumption, and snapshot.
- [x] Implement zero-price access with terms, no proof/passcode.
- [x] Audit passcode failures/successes, purchase-link creation, access creation, device reset/allowance.
- [x] Implement device first-bind, same-device allow, different-device block.
- [x] Implement admin device list/reset/additional allowance routes.
- [x] Run focused tests and backend build: 48 e-booklet tests passed; backend build passed.

Fresh agent plan:
- `kalima-p3-access-commerce-dev`: implements Tasks 7–9 serially. No parallel backend implementers because this touches shared service/controller/route files.
- `kalima-p3-spec-reviewer`: checks commercial rules, access paths, terms, price snapshots, passcode location, and device behavior.
- `kalima-p3-quality-reviewer`: checks transaction safety, authorization, audit coverage, test coverage, and no accidental payment gateway/teacher checkout.
- `kalima-p3-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
```

---

### Phase 4 — Admin Editor V2 Frontend

Status: Completed — spec review PASS and quality/security review APPROVED on 2026-06-02.

Source plan task:
- Task 10: Update admin editor frontend for hotspot V2.

Detailed todo:
- [x] Add V2 hotspot form defaults.
- [x] Add shape selector and geometry controls.
- [x] Add reference number display.
- [x] Add content blocks editor.
- [x] Add 5-font text selector.
- [x] Add file upload block.
- [x] Add link URL block.
- [x] Add Q&A editor.
- [x] Add uploaded video vs YouTube selector.
- [x] Add audio autoplay only; do not add video autoplay.
- [x] Add image auto-expand/expand-on-click toggle.
- [x] Make canvas hotspots draggable.
- [x] Add resize/minimize controls.
- [x] Add large hotspot list column sorted by `created_at`.
- [x] Ensure save payload sends `content_json` and `interaction_json`.
- [x] Update Arabic/English translations.
- [x] Run frontend build.

Fresh agent plan:
- `kalima-p4-admin-editor-dev`: implements Task 10.
- `kalima-p4-spec-reviewer`: checks all authoring controls and payload compatibility.
- `kalima-p4-quality-reviewer`: checks UI state design, accessibility, i18n, and build safety.
- `kalima-p4-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run build
```

---

### Phase 5 — Viewer V2 Frontend

Status: Next

Source plan task:
- Task 11: Update viewer frontend for hotspot V2.

Detailed todo:
- [ ] Add device fingerprint generation/storage helper.
- [ ] Send fingerprint when fetching/opening viewer metadata.
- [ ] Render hotspot reference numbers and quick reference toggle.
- [ ] Render circle/rectangle/square/triangle/oval shapes.
- [ ] Support multiple open hotspots where allowed.
- [ ] Render text with selected font.
- [ ] Render audio with autoplay toggle handling.
- [ ] Render uploaded video and YouTube video.
- [ ] Pause other videos when one starts.
- [ ] Render authorized file download buttons.
- [ ] Render external links.
- [ ] Render Q&A block and celebration effect on correct answer.
- [ ] Preserve watermark/no-download behavior.
- [ ] Update translations.
- [ ] Run frontend build.

Fresh agent plan:
- `kalima-p5-viewer-dev`: implements Task 11.
- `kalima-p5-spec-reviewer`: checks viewer interaction requirements and device fingerprint integration.
- `kalima-p5-quality-reviewer`: checks UI complexity, media lifecycle, accessibility, and build safety.
- `kalima-p5-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run build
```

---

### Phase 6 — Teacher, Student, and Admin Access UIs

Status: Pending

Source plan tasks:
- Task 12: Update teacher invite/share page.
- Task 13: Build admin devices/access management UI.
- Task 14: Update student invite access / purchase frontend.
- Task 15: Update teacher/student dashboard pages.

Detailed todo:
- [ ] Teacher share page: expiry, quota/used seats/devices, invite link, passcode, combined copy, WhatsApp, zero-price copy.
- [ ] Admin devices/access UI: instances/devices route, teacher instances, student/device list, drawer, reset with reason, additional-device allowance, quota editor, Admin View Mode banner/exit.
- [ ] Student invite access/purchase: login/register gate, effective price/expiry, online purchase path, offline passcode path, zero-price path, terms acceptance, hide internal price.
- [ ] Teacher/student dashboards: expiry date, archived/expired status, device lock status, active opens viewer, expired blocked copy.
- [ ] Update translations.
- [ ] Run frontend build.

Fresh agent plan:
- `kalima-p6-teacher-student-admin-ui-dev`: implements Tasks 12–15. If the phase is too large after inspection, split into these fresh task agents:
  - `kalima-p6a-teacher-share-dev` for Task 12.
  - `kalima-p6b-admin-devices-dev` for Task 13.
  - `kalima-p6c-student-access-dev` for Task 14.
  - `kalima-p6d-dashboards-dev` for Task 15.
- `kalima-p6-spec-reviewer`: checks role boundaries and all UI flows.
- `kalima-p6-quality-reviewer`: checks routing, state, i18n, accessibility, and no leakage of internal price/admin data.
- `kalima-p6-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run build
```

---

### Phase 7 — Expiry Operations + Launch Analytics

Status: Pending

Source plan tasks:
- Task 16: Add operational expiry archive job/script.
- Task 17: Implement basic access analytics and CSV export.

Detailed todo:
- [ ] Add archive expired e-booklets script matching project conventions.
- [ ] Add npm script if appropriate.
- [ ] Document production scheduler/cron usage.
- [ ] Add `e_booklet_analytics_events` schema/migration.
- [ ] Add event recording helper for invite, purchase, passcode, access, viewer, and device flows.
- [ ] Track anonymous invite opens separately from logged-in users and access records.
- [ ] Track share/open source labels as attribution hints only.
- [ ] Add failed passcode rate limit and neutral blocked copy.
- [ ] Keep online purchase funnel states separate; revenue only after approval/access.
- [ ] Snapshot marketing price for online/offline access revenue.
- [ ] Add teacher analytics API scoped to own instances.
- [ ] Add admin analytics API filters and admin-only CSV export.
- [ ] Add teacher dashboard analytics cards/table and admin analytics UI/export.
- [ ] Hide raw wrong passcodes, raw IP/user-agent, Internal Price, admin notes, and global revenue from teachers.
- [ ] Run backend tests, backend build, frontend build.

Fresh agent plan:
- `kalima-p7-ops-analytics-dev`: implements Tasks 16–17 serially because analytics touches schema, service, routes, controllers, and UI.
- `kalima-p7-spec-reviewer`: checks analytics definitions, privacy boundaries, snapshots, and export scope.
- `kalima-p7-quality-reviewer`: checks schema/migration safety, data retention, aggregation logic, CSV security, and UI leakage.
- `kalima-p7-fix-agent`: only if reviewers request changes.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run build
```

---

### Phase 8 — Browser QA and Mobile/Desktop Verification

Status: Pending

Source plan task:
- Task 18: Browser QA and mobile/desktop verification.

Detailed todo:
- [ ] Verify admin creates template, uploads PDF, rejects DOCX.
- [ ] Verify admin creates all hotspot types and publishes version.
- [ ] Verify admin manually creates teacher instance/deal with quota, expiry, marketing price, internal price.
- [ ] Verify teacher sees delivered e-booklet, viewer, share page, link, passcode, WhatsApp copy.
- [ ] Verify logged-out student forced to login/register from invite.
- [ ] Verify priced online purchase path creates pending generic purchase, no access until admin approval.
- [ ] Verify admin approval auto-creates access and consumes seat.
- [ ] Verify wrong passcode blocked without proof/access.
- [ ] Verify correct passcode + terms creates access and consumes seat.
- [ ] Verify zero-price + terms creates access without proof/passcode.
- [ ] Verify first device binds, same device allowed, different fingerprint blocked.
- [ ] Verify all hotspot interactions, video solo/no autoplay, multiple non-video cards, expiry block.
- [ ] Verify admin device list, reset, new binding, additional device allowance, Admin View Mode.
- [ ] Record URLs, accounts, screenshots/videos where useful, and pass/fail notes.

Fresh agent plan:
- `kalima-p8-browser-qa-agent`: runs browser QA and records evidence; no broad code edits unless explicitly assigned as fix-only.
- `kalima-p8-fix-agent`: fresh agent only for specific reproducible QA failures.
- `kalima-p8-regression-reviewer`: confirms fixes do not break covered flows.

Verification gate:
- Backend focused tests + backend build.
- Frontend build.
- Browser desktop/mobile evidence recorded in final handoff.

---

### Phase 9 — Final Feature Critique Gate

Status: Pending

Source plan task:
- Task 19: Feature critique gate.

Detailed todo:
- [ ] Create `.hermes/reviews/fekra-e-booklet-v2/handoff.md`.
- [ ] Include requirements coverage matrix.
- [ ] Include changed files.
- [ ] Include exact test/build/browser outputs.
- [ ] Include known limitations/blockers.
- [ ] Include screenshots/videos by path if available.
- [ ] Trigger independent critique-agent review.
- [ ] Fix every Required issue with fresh fix agent.
- [ ] Re-run impacted tests/build/browser checks.
- [ ] Re-review until verdict is `APPROVED`.
- [ ] Only then report feature complete.

Fresh agent plan:
- `kalima-p9-handoff-agent`: drafts final handoff from verified evidence.
- `kalima-p9-critique-agent`: independent review agent; writes/updates critique report.
- `kalima-p9-fix-agent`: fresh agent for Required fixes only.
- Parent Hermes: verifies final report and approval before declaring complete.

Verification gate:
```bash
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts tests/e-booklet/e-booklet.routes.spec.ts --runInBand
npm run build
cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend
npm run build
```

Final gate:
- `.hermes/reviews/fekra-e-booklet-v2/critique-report.md` verdict: `APPROVED`.

## Commit Boundaries

Recommended commits after parent verification:

1. `test: add e-booklet v2 backend coverage`
2. `feat: add e-booklet v2 schema foundation`
3. `feat: support e-booklet v2 hotspot backend`
4. `feat: add e-booklet access purchase passcode and device rules`
5. `feat: update admin e-booklet editor for v2 hotspots`
6. `feat: update e-booklet viewer for v2 interactions`
7. `feat: add e-booklet sharing access management and dashboards`
8. `feat: add e-booklet expiry operations and analytics`
9. `test: verify e-booklet v2 browser flows`
10. `docs: add e-booklet v2 critique handoff`

Do not commit unrelated files unless explicitly approved.
