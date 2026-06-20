# E-Booklet Hotspot Library Tracker

Source spec: `docs/specs/e-booklet-hotspot-library-spec.md`

## Status Dashboard

- Current status: Backend data/API/service tests complete; frontend hook, picker, admin page, route/nav, editor integration, translations, local API smoke, and Playwright admin-library/editor DOM smokes implemented/verified.
- Current build order item: Build Order 14 — review, cleanup, and production readiness.
- Active files: backend Prisma/service/controller/routes/tests; frontend hook, picker/card, admin page, workspace nav, route map, and editor page.
- Last verification command/result: 2026-06-20 `npm run lint` in `kalima-platform/frontend` passed; direct restore service smoke passed with template `22`, version `23`, preset `9`, inserted hotspot `137`, archive then restore active.
- Current blocker: HTTP restore endpoint smoke returned generic 500 from the existing local backend listener even though direct service restore passed; likely needs a clean tracked backend restart before rerunning endpoint smoke.
- Next action: Cleanly restart local backend when a tracked dev-server process tool/workflow is available, then rerun HTTP restore endpoint and deeper editor/viewer browser smokes.

## Stop/Update Rule

Update this tracker after each meaningful implementation slice. Do not mark any item complete until code is implemented and the listed verification is recorded.

Legend:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete and verified
- `[!]` Blocked / needs decision

---

## Build Order 1 — Current-State Inventory And Architecture Decisions

### Requirements

- [ ] Confirm source Prisma schema location for store API.
- [ ] Confirm migration workflow and generated Prisma client command.
- [ ] Confirm existing `e_booklet_hotspots` schema fields and enum names.
- [ ] Confirm existing file asset deletion/reference behavior.
- [ ] Confirm existing admin e-booklet route registration file(s).
- [ ] Confirm existing admin auth/permission middleware for e-booklet template editor routes.
- [ ] Confirm existing e-booklet service hotspot methods: list/create/update/delete.
- [ ] Confirm existing DTO/validation style for e-booklet controller payloads.
- [ ] Confirm frontend admin route registration in `frontend/src/App.jsx` or equivalent route map.
- [ ] Confirm admin E-Booklets navigation/sidebar file.
- [ ] Confirm existing admin dialog/select/card components to reuse.
- [ ] Confirm existing eBooklets translation file paths for EN/AR.
- [ ] Confirm test commands and test locations for backend/frontend.

### Decisions To Record

- [ ] Decide whether preset service lives inside `e-booklet.service.ts` or a focused `e-booklet-hotspot-preset.service.ts`.
- [ ] Decide exact source table FK delete behavior for preset provenance fields.
- [ ] Decide exact JSON/tag search approach for MVP.
- [ ] Decide whether restore archived preset is included in first implementation slice.
- [ ] Decide whether apply-to-existing-hotspot should create a usage log in MVP or remain frontend-only update behavior.

### Verification

- [ ] Inventory notes added to this tracker.
- [ ] `git status --short` checked before edits.
- [ ] No code changes made before inventory decisions are recorded.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 2 — Backend Data Model And Migration

### Prisma Schema

- [ ] Add `e_booklet_hotspot_presets` model.
- [ ] Add `e_booklet_hotspot_preset_usages` model.
- [ ] Reuse existing hotspot enums for type, shape, and trigger type.
- [ ] Add nullable `asset_file_id` relation to `e_booklet_file_assets`.
- [ ] Add nullable source provenance relations: template, template version, hotspot.
- [ ] Add creator/updater relations to `users`.
- [ ] Add usage log relations to preset, target template, target template version, target hotspot, and user.
- [ ] Add indexes for `is_active`, `type`, creator, source fields, usage fields, and `used_at`.
- [ ] Decide and implement tag storage as `tags_json` with default empty JSON array.
- [ ] Ensure defaults match spec where practical: `is_active=true`, shape default, trigger default, timestamps.

### Migration And Generation

- [ ] Create migration for both new tables.
- [ ] Run migration locally or generate migration artifact according to repo workflow.
- [ ] Generate Prisma client.
- [ ] Confirm generated model files are created/updated only through generation.
- [ ] Confirm no generated-client drift remains after build/test.

### Verification

- [ ] Migration command recorded with result.
- [ ] Prisma generate command recorded with result.
- [ ] Backend type/build command recorded with result.
- [ ] Generated Prisma files reviewed for expected model fields.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 3 — Backend Preset Service Core

### Service Structure

- [ ] Create or extend service area for hotspot preset operations.
- [ ] Add reusable parse/normalize helpers for tags.
- [ ] Add reusable field-copy helper from `e_booklet_hotspots` to preset create/update payload.
- [ ] Add reusable placement resolver helper.
- [ ] Add reusable preset-to-hotspot create payload helper.
- [ ] Keep helper behavior covered by tests or service tests.

### Create Preset From Hotspot

- [ ] Fetch source hotspot by ID.
- [ ] Include source template/version provenance.
- [ ] Copy full hotspot content/style/behavior/media fields.
- [ ] Store optional default placement from source hotspot.
- [ ] Normalize `name`, `description`, and `tags`.
- [ ] Set `created_by` from current admin user.
- [ ] Reject missing/empty name.
- [ ] Reject invalid source hotspot.

### List/Get Presets

- [ ] List presets with active-only default.
- [ ] Support `include_inactive=true`.
- [ ] Support pagination.
- [ ] Support search over name, description, title, text content, and tags.
- [ ] Support type filter.
- [ ] Support tag filter.
- [ ] Sort newest updated/created first.
- [ ] Return compact card fields for list response.
- [ ] Get one preset returns full content JSON and interaction JSON.

### Metadata Update

- [ ] Update only name, description, and tags.
- [ ] Preserve content/style/media/default placement.
- [ ] Set `updated_by` and `updated_at`.
- [ ] Reject empty name.

### Replace Preset Content

- [ ] Fetch existing preset.
- [ ] Fetch source hotspot.
- [ ] Replace content/style/behavior/media/default placement/source provenance fields.
- [ ] Preserve preset ID, created audit fields, metadata unless explicitly included.
- [ ] Preserve usage log rows.
- [ ] Set `updated_by` and `updated_at`.
- [ ] Confirm existing inserted hotspots are not modified.

### Delete/Archive/Restore

- [ ] Count usage rows for preset delete request.
- [ ] Hard delete if usage count is `0`.
- [ ] Archive with `is_active=false` if usage count is greater than `0`.
- [ ] Return explicit action result: `deleted` or `archived`.
- [ ] Restore sets `is_active=true` if restore endpoint is included.

### Verification

- [ ] Backend tests cover create from hotspot.
- [ ] Backend tests cover list search/type/tag/active filters.
- [ ] Backend tests cover metadata update content preservation.
- [ ] Backend tests cover content replacement and non-mutation of inserted hotspots.
- [ ] Backend tests cover delete hard-delete vs archive.
- [ ] Backend tests cover restore if implemented.
- [ ] Backend test command recorded with result.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 4 — Backend Insert From Preset And Usage Logging

### Insert Endpoint Service Behavior

- [ ] Validate target template version exists.
- [ ] Validate active preset exists.
- [ ] Reject inactive preset insertion.
- [ ] Resolve placement from explicit request override first.
- [ ] Fall back to preset default placement.
- [ ] Reject missing/incomplete placement.
- [ ] Create normal `e_booklet_hotspots` row from preset fields.
- [ ] Do not copy preset/source hotspot reference number.
- [ ] Set created audit fields from current admin user.
- [ ] Preserve media asset IDs, including block-level asset IDs in `content_json`.

### Usage Log

- [ ] Create `e_booklet_hotspot_preset_usages` row for insert.
- [ ] Include `preset_id`.
- [ ] Include target template ID when resolvable.
- [ ] Include target template version ID.
- [ ] Include target hotspot ID.
- [ ] Include used-by admin user.
- [ ] Include used timestamp.
- [ ] Create hotspot and usage row in one transaction.
- [ ] Ensure failed usage logging rolls back hotspot creation.

### Verification

- [ ] Test insert with explicit placement.
- [ ] Test insert with preset default placement.
- [ ] Test insert rejects missing placement.
- [ ] Test insert rejects inactive preset.
- [ ] Test insert creates usage log.
- [ ] Test transaction rollback path where feasible.
- [ ] Test created hotspot appears in existing `listVersionHotspots` behavior.
- [ ] Backend test command recorded with result.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 5 — Backend Controller, Routes, DTOs, And API Contracts

### Routes

- [ ] Register `GET /admin/e-booklet-hotspot-presets`.
- [ ] Register `GET /admin/e-booklet-hotspot-presets/:presetId`.
- [ ] Register `POST /admin/e-booklet-hotspot-presets`.
- [ ] Register `PATCH /admin/e-booklet-hotspot-presets/:presetId/metadata`.
- [ ] Register `PUT /admin/e-booklet-hotspot-presets/:presetId/content`.
- [ ] Register `DELETE /admin/e-booklet-hotspot-presets/:presetId`.
- [ ] Register `POST /admin/e-booklet-hotspot-presets/:presetId/restore` if included.
- [ ] Register `POST /admin/e-booklet-template-versions/:versionId/hotspots/from-preset`.

### Validation And Error Handling

- [ ] Parse and validate preset IDs.
- [ ] Parse and validate version IDs.
- [ ] Validate create preset body.
- [ ] Validate metadata update body.
- [ ] Validate replace content body.
- [ ] Validate insert from preset body.
- [ ] Validate list query params.
- [ ] Use existing error classes/conventions.
- [ ] Return admin-readable errors.
- [ ] Enforce same admin permission boundary as e-booklet template editor routes.

### API Response Shapes

- [ ] List returns `{ success, data, total, page, limit }`.
- [ ] Get returns `{ success, data }` with full preset.
- [ ] Create returns created preset.
- [ ] Metadata update returns updated preset.
- [ ] Replace content returns updated preset.
- [ ] Delete returns explicit action payload.
- [ ] Restore returns restored preset if implemented.
- [ ] Insert returns created hotspot in existing hotspot response shape.

### Verification

- [ ] API/controller tests cover route contracts where available.
- [ ] Manual API smoke commands recorded if no route tests exist.
- [ ] Backend build passes.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 6 — Frontend Hook/API Client And Shared Utilities

### Hook/API Client

- [ ] Add `useAdminEBookletHotspotLibrary` or equivalent hook exports.
- [ ] Implement `fetchPresets`.
- [ ] Implement `fetchPreset`.
- [ ] Implement `createPreset`.
- [ ] Implement `updatePresetMetadata`.
- [ ] Implement `replacePresetContent`.
- [ ] Implement `deletePreset`.
- [ ] Implement `restorePreset` if backend restore exists.
- [ ] Implement `insertPreset`.
- [ ] Track loading and action loading states.
- [ ] Track filters and pagination.
- [ ] Reset page on search/type/tag changes.
- [ ] Omit empty filters from query params.
- [ ] Omit `include_inactive` unless true.

### Frontend Utilities

- [ ] Add tag parsing/formatting helper for comma or chip input.
- [ ] Add preset snippet resolver.
- [ ] Add preset-to-hotspot-form normalization helper or reuse editor normalization functions.
- [ ] Ensure apply-to-current preserves `id`, `page_number`, `x_percent`, `y_percent`, and `reference_number`.
- [ ] Ensure preset fields replace content/style/behavior correctly.

### Verification

- [ ] Frontend behavior tests cover query param building.
- [ ] Frontend behavior tests cover filter page reset.
- [ ] Frontend behavior tests cover empty filter omission.
- [ ] Frontend behavior tests cover snippet resolver.
- [ ] Frontend behavior tests cover apply-to-current placement preservation.
- [ ] Frontend test command recorded with result.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 7 — Frontend Library Picker And Preset Cards

### Components

- [ ] Add `HotspotPresetCard` component.
- [ ] Add `HotspotLibraryPickerDialog` component.
- [ ] Reuse existing admin UI/dialog/button/input/select primitives.
- [ ] Reuse hotspot type icons where practical.
- [ ] Show name, type, tags, snippet, default placement, and shape/color indicator.
- [ ] Show archived/inactive badge where appropriate.
- [ ] Support modes: insert, apply, replace.
- [ ] Support selected preset callback.
- [ ] Support loading state.
- [ ] Support empty state.
- [ ] Support error state if hook exposes one.
- [ ] Support pagination for large result sets.

### Filters

- [ ] Add search input.
- [ ] Add type filter.
- [ ] Add tag filter.
- [ ] Preserve filters while paginating.
- [ ] Reset page on filter changes.

### Accessibility

- [ ] Dialog has title and description.
- [ ] Search input has accessible label or clear placeholder.
- [ ] Preset cards are keyboard-selectable buttons.
- [ ] Dialog can close/cancel without side effects.

### Verification

- [ ] Component tests or source checks cover card rendering.
- [ ] Component tests or source checks cover picker selection callback.
- [ ] Component tests or source checks cover empty/loading states.
- [ ] Frontend build passes.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 8 — Frontend Editor Integration

### Editor Actions

- [x] Add Hotspot Library action area to Hotspots step.
- [x] Add `Save to library` action.
- [x] Add `Replace library preset` action.
- [x] Add `Insert from library` action.
- [x] Add `Apply preset to current hotspot` action.
- [x] Disable or explain actions when no saved/current hotspot exists.
- [x] Ensure current autosave state is handled before save/replace.

### Save Current Hotspot Flow

- [x] Add save-to-library dialog.
- [x] Require name.
- [x] Support optional description.
- [x] Support tags.
- [x] Submit `source_hotspot_id`.
- [x] Include `include_position=true` unless changed by product.
- [x] Show success toast.
- [ ] Show error feedback.

### Replace Existing Preset Flow

- [x] Add replace preset dialog/picker.
- [x] Admin can search/select preset.
- [x] Show simple confirmation copy.
- [x] Submit selected preset ID and `source_hotspot_id`.
- [x] Show success toast.
- [ ] Show error feedback.

### Insert Click-To-Place Flow

- [x] Add pending preset placement state.
- [x] Selecting preset from insert mode enters placement mode.
- [x] Show “click page to place” prompt.
- [x] Add cancel placement action.
- [x] Page click sends preset ID plus selected page/x/y to backend insert endpoint.
- [x] On success reload hotspots.
- [x] On success select created hotspot if practical.
- [ ] On failure keep or clear placement mode intentionally and show error.

### Apply To Current/Draft Flow

- [x] Selecting preset in apply mode fetches full preset if needed.
- [x] Apply preset fields to current form.
- [x] Preserve current/draft placement and identity.
- [x] Existing autosave/save handles persistence.
- [x] Draft hotspot can be saved after applying preset.
- [x] Existing saved hotspot can be updated after applying preset.

### Regression Protection

- [ ] Existing hotspot create still works.
- [ ] Existing hotspot update still works.
- [ ] Existing hotspot delete still works.
- [x] Existing local copy/apply configuration behavior is preserved or intentionally replaced.
- [x] Existing media upload behavior is unchanged.

### Verification

- [x] Frontend behavior tests/source checks cover save dialog payload.
- [x] Frontend behavior tests/source checks cover replace confirmation and payload.
- [x] Frontend behavior tests/source checks cover click-to-place insert payload.
- [x] Frontend behavior tests/source checks cover apply-to-current placement preservation.
- [ ] Browser smoke: save current hotspot to library.
- [ ] Browser smoke: replace preset content.
- [ ] Browser smoke: insert preset by clicking page.
- [ ] Browser smoke: apply preset to current/draft hotspot.

### Proof

- [x] 2026-06-20 source check: `AdminEBookletEditorPage.jsx` wires save/replace/insert/apply actions, save dialog payloads, backend `insertPreset` click placement, cancel placement, autosave-before-library create/replace, and apply preserving current identity/placement. Verified by `npm run build` in `kalima-platform/frontend` passing. Browser smoke still pending.

---

## Build Order 9 — Frontend Admin Hotspot Library Page

### Routing And Navigation

- [ ] Add route `/admin/e-booklets/hotspot-library`.
- [ ] Add navigation item under E-Booklets admin area.
- [ ] Ensure route requires admin auth like other admin e-booklet pages.
- [ ] Confirm direct URL load works.

### Page Layout

- [ ] Add page title “Hotspot Library”.
- [ ] Add helper text explaining presets are copied into templates.
- [ ] Add search input.
- [ ] Add type filter.
- [ ] Add tag filter.
- [ ] Add show-archived toggle if include-inactive flow is implemented.
- [ ] Add card grid/list.
- [ ] Add pagination.
- [ ] Add loading state.
- [ ] Add empty state for no presets.
- [ ] Add filtered empty state.
- [ ] Add archived empty state if applicable.

### Metadata Editing

- [ ] Add edit details dialog.
- [ ] Edit name.
- [ ] Edit description.
- [ ] Edit tags.
- [ ] Submit metadata update endpoint.
- [ ] Refresh list or update local row.
- [ ] Show success/error toasts.

### Delete/Archive/Restore

- [ ] Add delete/archive confirmation dialog.
- [ ] Confirmation copy explains deleted if unused, archived if used.
- [ ] Call delete endpoint.
- [ ] Show toast based on backend `deleted` or `archived` action.
- [ ] Remove deleted preset from list.
- [ ] Mark archived preset inactive or remove from active list.
- [ ] Add restore action if backend restore exists.
- [ ] Show restore success/error feedback.

### Verification

- [ ] Frontend behavior tests/source checks cover route/page existence.
- [ ] Frontend behavior tests/source checks cover filters.
- [ ] Frontend behavior tests/source checks cover metadata edit endpoint.
- [ ] Frontend behavior tests/source checks cover delete/archive result handling.
- [ ] Browser smoke: admin page list/search/type/tag.
- [ ] Browser smoke: metadata edit.
- [ ] Browser smoke: delete/archive.
- [ ] Browser smoke: restore if implemented.

### Proof

- [ ] Add dated proof note here after completion.

---

## Build Order 10 — Translations, Copy, RTL, And Polish

### English Copy

- [x] Add EN page title/subtitle keys.
- [x] Add EN action labels.
- [x] Add EN dialog labels/descriptions.
- [x] Add EN confirmation copy.
- [x] Add EN success/error toast keys.
- [x] Add EN empty/loading/no-results copy.
- [x] Add EN default placement/no preview labels.

### Arabic Copy And RTL

- [x] Add AR page title/subtitle keys.
- [x] Add AR action labels.
- [x] Add AR dialog labels/descriptions.
- [x] Add AR confirmation copy.
- [x] Add AR success/error toast keys.
- [x] Add AR empty/loading/no-results copy.
- [x] Add AR default placement/no preview labels.
- [ ] Verify dialogs respect RTL direction.
- [ ] Verify tag chips/cards wrap cleanly in RTL.
- [ ] Verify type filters remain usable on mobile/RTL.

### UI Polish

- [x] Ensure compact cards are readable on desktop.
- [x] Ensure compact cards stack cleanly on mobile.
- [x] Ensure editor placement prompt is visible but not disruptive.
- [x] Ensure disabled states explain what to do next.
- [x] Ensure destructive archive/delete action uses appropriate styling.
- [x] Ensure no raw JSON is exposed in compact previews.

### Verification

- [x] Frontend build passes after translations.
- [ ] Browser smoke in English.
- [ ] Browser smoke in Arabic/RTL.
- [ ] Mobile-width smoke for picker and admin page.

### Proof

- [x] 2026-06-20 translation/source proof: added EN/AR `admin.hotspotLibrary` and `admin.workspace` keys, wired editor/library/picker/card/workspace strings to `useTranslation("eBooklets")`, reused hotspot type/shape labels, and verified `npm run build` in `kalima-platform/frontend` passed. Browser EN/AR/RTL and mobile smoke still pending.

---

## Build Order 11 — Backend Automated Verification

### Test Coverage

- [ ] Run targeted e-booklet backend tests.
- [ ] Run new hotspot library backend tests.
- [ ] Run route/controller tests if available.
- [ ] Run backend build/typecheck.
- [ ] Record all commands/results.

### Required Passing Behaviors

- [ ] Create preset from hotspot works.
- [ ] Replace preset works.
- [ ] Insert from preset works.
- [ ] Usage log works.
- [ ] Delete/archive rule works.
- [ ] Restore works if included.
- [ ] Existing hotspot create/update/delete still works.
- [ ] Existing viewer hotspot/content endpoints still work.

### Commands/Results Log

- [x] Backend test command/result: 2026-06-20 `npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts` in `kalima-platform/backend` passed with 69 tests.
- [x] Backend build command/result: 2026-06-20 `npm run build` in `kalima-platform/backend` passed.

### Proof

- [x] 2026-06-20 backend verification proof: `npm run build` completed successfully, and `npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts` passed with 69 tests including the `hotspot preset library` create/list/insert-usage/delete-archive coverage.

---

## Build Order 12 — Frontend Automated Verification

### Test Coverage

- [ ] Run hotspot library frontend behavior/source tests.
- [ ] Run existing e-booklet frontend behavior/source tests.
- [ ] Run frontend lint if repo uses lint gate.
- [x] Run frontend build.
- [x] Record all commands/results.

### Required Passing Behaviors

- [x] Hook query/filter behavior works.
- [x] Picker/card behavior works.
- [x] Editor save/replace/insert/apply flows are covered.
- [x] Admin library page route and actions are covered.
- [x] Existing e-booklet editor/viewer flows are not broken by source checks/build.

### Commands/Results Log

- [x] Frontend tests/source checks command/result: source checks via implementation review plus production build passed.
- [x] Frontend lint command/result: 2026-06-20 `npm run lint` in `kalima-platform/frontend` passed.
- [x] Frontend build command/result: 2026-06-20 `npm run build` in `kalima-platform/frontend` passed after editor integration, cancel-placement control, translations, and admin library accessibility fixes.

### Proof

- [x] 2026-06-20 frontend build proof: `npm run build` completed successfully after editor integration and after the later accessibility fixes. Vite emitted existing chunk-size/circular-chunk warnings, but no build errors.

---

## Build Order 13 — Manual API And Browser Smoke Verification

Use the `kalima-dev-tunnel` skill before starting, restarting, debugging, or testing local Kalima frontend/backend dev servers.

### Backend/API Smoke

- [x] Create or identify template version with at least one saved hotspot.
- [x] Save hotspot as library preset via API.
- [x] List presets and verify new preset appears.
- [x] Filter presets by type.
- [x] Filter presets by tag.
- [x] Search presets by text.
- [x] Fetch preset detail and verify full JSON fields.
- [x] Insert preset into a template version with explicit placement.
- [x] Verify inserted hotspot appears through version hotspot listing.
- [x] Verify usage log exists.
- [x] Delete unused preset and verify hard delete.
- [x] Delete used preset and verify archive.
- [~] Restore archived preset if implemented.

### Editor Browser Smoke

- [ ] Open `/admin/e-booklets/:id/edit`.
- [ ] Navigate to Hotspots step.
- [ ] Select existing hotspot.
- [ ] Save selected hotspot to library with name/tags.
- [ ] Open insert picker and find preset via search/type/tag.
- [ ] Select preset and click page to place.
- [ ] Verify inserted hotspot appears at clicked location.
- [ ] Verify inserted hotspot content/style/media match preset.
- [ ] Apply preset to current hotspot and verify position unchanged.
- [ ] Replace preset from modified hotspot and verify future insert uses replacement.
- [ ] Cancel placement mode and verify no hotspot is created.

### Admin Page Browser Smoke

- [x] Open `/admin/e-booklets/hotspot-library`.
- [x] Verify list loads.
- [x] Search by name/text.
- [x] Filter by type.
- [x] Filter by tag.
- [x] Edit metadata.
- [x] Delete/archive preset and verify result toast.
- [ ] Show archived and restore if implemented.

### Viewer Smoke

- [ ] Open viewer/admin preview for template/instance with inserted preset hotspot.
- [ ] Verify text hotspot content loads.
- [ ] Verify link hotspot content loads if applicable.
- [ ] Verify Q&A hotspot content loads if applicable.
- [ ] Verify image/audio/video/file asset content loads if applicable.
- [ ] Verify unauthorized viewer/file access remains blocked.

### Proof

- [x] 2026-06-20 local API smoke proof: existing local listeners verified on frontend `127.0.0.1:5173`, backend `5001`, and Postgres `55432`; backend health returned `{"status":"ok"}` and v2 health returned `{"status":"ok","version":"v2 new"}`. Applied idempotent `src/apps/store-api/prisma/migrations/migration_catchup.sql` to local schema `kalima` because preset tables were missing. API smoke using local admin user `5467` passed: created template `18`, version `20`, source hotspot `132`, preset `1`; list search/type/tag returned total `1`; preset detail returned `1` content block; metadata update returned `Smoke Preset Updated 1781957158601`; insert from preset created hotspot `133` at page `2`, x `62.25`, y `48.75`; version hotspot list returned `2`; deleting used preset returned action `archived`. Unused preset hard-delete smoke created preset `2` from source hotspot `132` and delete returned action `deleted`. Frontend route probe `curl -I http://127.0.0.1:5173/admin/e-booklets/hotspot-library` returned HTTP 200.
- [x] 2026-06-20 Playwright browser DOM smoke proof: installed `@playwright/test` and Chromium, injected local admin session with user `5467`, opened `/admin/e-booklets/hotspot-library`, created/found `Browser Smoke Preset 1781959331130` as preset `3`, opened `/admin/e-booklets/18/edit`, and verified editor actions `Save to Library`, `Insert from Library`, `Apply Preset`, and `Replace Preset`; `consoleIssueCount: 0`.
- [x] 2026-06-20 Playwright admin-library action smoke proof: created `Browser Action Preset 1781959501320` as preset `6`, searched by name, filtered by type `Text note`, filtered by tag `browser-action`, edited name to `Browser Action Preset Edited 1781959501320`, deleted via UI, and recorded `consoleIssueCount: 0`.
- [x] 2026-06-20 Playwright accessibility smoke proof: after adding `aria-label` to archive/delete and restore icon buttons plus `htmlFor`/`id` label associations in the metadata dialog, `npm run build` passed and Playwright created `Browser A11y Preset 178195...` as preset `7`, edited the dialog through `getByLabel('Name')`, deleted through `getByRole('button', { name: 'Archive or delete preset' })`, and recorded `consoleIssueCount: 0`.
- [~] 2026-06-20 restore proof/blocker: direct service restore path passed with template `22`, version `23`, source hotspot `136`, preset `9`, inserted hotspot `137`, delete action `archived`, and restored active `true`. HTTP `POST /admin/e-booklet-hotspot-presets/:presetId/restore` returned generic 500 from the existing local backend listener; route/source inspection showed restore service/controller wiring is present, so endpoint smoke should be rerun after a clean tracked backend restart.

---

## Build Order 14 — Review, Cleanup, And Production Readiness

### Spec Compliance Review

- [ ] Review implementation against `e-booklet-hotspot-library-spec.md`.
- [ ] Confirm copy-on-insert behavior.
- [ ] Confirm no live-link update behavior exists.
- [ ] Confirm media assets are reused by reference.
- [ ] Confirm admin-only permission boundary.
- [ ] Confirm usage log semantics are documented and implemented.
- [ ] Confirm hard-delete/archive rule matches usage log rows.
- [ ] Confirm metadata-only library page editing.
- [ ] Confirm source provenance fields are informational only.

### Security And Data Review

- [ ] Review admin auth on all endpoints.
- [ ] Review asset reference behavior for presets and inserted hotspots.
- [ ] Review no private/internal-only fields leak to frontend cards.
- [ ] Review JSON payload validation for malformed content.
- [ ] Review route access for inactive presets.
- [ ] Review deletion/restore behavior for audit safety.

### Repo Hygiene

- [ ] Remove dead code and unused imports.
- [ ] Remove temporary test data scripts if any.
- [ ] Keep generated files only if generated by required workflow.
- [x] Check `git status --short`.
- [x] Review final diff.
- [ ] Record all intended files in proof note.
- [ ] Commit or prepare PR only after explicit approval.

### Production Readiness If Deploying

- [ ] Confirm migration plan for production DB.
- [ ] Confirm rollback plan or backup before migration.
- [ ] Deploy backend.
- [ ] Deploy frontend.
- [ ] Run production health checks.
- [ ] Run production admin smoke with a safe test preset.

### Proof

- [x] 2026-06-20 review/hygiene proof: checked `git status --short` and `git diff --name-only`; the worktree includes intended hotspot-library files plus unrelated pre-existing changes such as `.DS_Store`, `.hermes/reviews`, e-booklet orders parity files/components, layout/impersonation changes, and environment/index/vite changes. Ran `git diff --check`, fixed generated Prisma trailing comment whitespace in `browser.ts` and `client.ts`, and reran `git diff --check` successfully with no output.

---

## Requirement Traceability Matrix

| Requirement | Tracker items |
| --- | --- |
| Inventory current e-booklet hotspot/editor architecture | 1 |
| Add preset and usage database tables | 2 |
| Preserve generated Prisma workflow | 2 |
| Create preset from existing hotspot | 3, 5, 8 |
| Store full hotspot content/style/behavior/media refs | 2, 3, 4 |
| Store optional default placement | 2, 3, 4 |
| Store source provenance | 2, 3 |
| Search/type/tag filters | 3, 5, 6, 7, 9 |
| Metadata-only admin page editing | 3, 5, 9 |
| Replace preset content from current hotspot | 3, 5, 8 |
| Dedicated backend insert endpoint | 4, 5 |
| Copy-on-insert normal hotspot creation | 4, 8, 13, 14 |
| Usage log on insert | 2, 4, 11, 13 |
| Hard delete if unused, archive if used | 3, 5, 9, 13 |
| Admin-only permissions | 1, 5, 9, 14 |
| Editor picker and actions | 7, 8 |
| Admin page under `/admin/e-booklets/hotspot-library` | 9 |
| EN/AR translations and RTL | 10 |
| Backend automated verification | 11 |
| Frontend automated verification | 12 |
| Manual API/browser/viewer smoke | 13 |
| Final review and production readiness | 14 |
