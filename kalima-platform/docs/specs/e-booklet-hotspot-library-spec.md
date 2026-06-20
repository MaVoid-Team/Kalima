# E-Booklet Hotspot Library Spec

## Goal

Build an admin-only Hotspot Library for e-booklet template creation. Admins should be able to save full hotspot presets, search and manage those presets, and insert copies of them into new template e-booklets without recreating common interactive content by hand.

The feature is a productivity layer on top of the existing e-booklet hotspot editor. A library preset is a reusable source object. When inserted into a template version, it creates a normal `e_booklet_hotspots` row. Inserted hotspots are independent copies and are not live-linked to the library preset.

## Product Summary

The Hotspot Library lets admins curate reusable interactive content blocks for e-booklets.

Primary admin workflows:

- Save the current editor hotspot as a reusable library preset.
- Replace an existing library preset's content from the current editor hotspot, with confirmation.
- Open the library picker from the e-booklet editor.
- Insert a preset onto a page by choosing a preset and clicking the PDF page.
- Apply a preset to the currently selected or draft hotspot while keeping the current placement.
- Open a minimal admin page under E-Booklets to search, filter, edit metadata, archive/delete, and inspect compact preset cards.

## Scope

In scope:

- Admin-only preset library for e-booklet hotspots.
- Full hotspot preset data, including content, style, behavior, and media references.
- Reusing existing uploaded media assets by reference.
- Optional default preset placement: page, x%, y%.
- Search, type filter, and tag filter.
- Compact card previews.
- Metadata-only preset editing in the MVP library page.
- Create new preset from existing editor hotspot.
- Replace existing preset content from existing editor hotspot.
- Dedicated backend endpoint for inserting a preset into a template version.
- Usage log table for inserted presets.
- Hard delete if a preset has no usage log rows; archive if it has usage log rows.
- Admin route under `/admin/e-booklets/hotspot-library`.
- Editor integration inside the Hotspots step.
- Same permission model as the existing e-booklet template editor.

Out of scope for MVP:

- Teacher-facing preset library.
- Teacher-owned private presets.
- Live-linked/canonical hotspots that update multiple templates.
- Automatic update propagation from a preset to previously inserted hotspots.
- Full direct content editing inside the standalone library page.
- Versioned preset replacement history.
- Full rendered media preview in the library cards.
- Curriculum-aware fields such as subject, grade, unit, lesson, or language.
- Cross-module or platform-wide generic hotspot library outside e-booklets.

## Existing Context

Existing editor page:

- `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx`

Existing editor hook:

- `kalima-platform/frontend/src/hooks/admin/useAdminEBooklets.js`

Existing backend controller:

- `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`

Existing backend service area:

- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`

Existing hotspot model:

- `e_booklet_hotspots`

Existing hotspot editor capabilities that should be reused conceptually:

- Hotspot form supports type, title, text, media asset, shape, dimensions, display behavior, content blocks, Q&A, and interaction behavior.
- Editor already supports local-only copy/apply of hotspot configuration via `copyHotspotConfiguration` and `applyCopiedHotspotConfiguration`.
- Editor already builds hotspot payloads through `buildHotspotPayload`.
- Editor already normalizes hotspot content through `normalizeContentForForm`, `normalizeDisplayBehaviorForForm`, and `normalizeInteractionForForm`.

The Hotspot Library should productize the existing local copy/apply idea into a persisted, searchable, auditable preset system.

## Product Decisions

### Reuse Model

Use copy-on-insert.

A library preset is never the live source of truth for already inserted hotspots. Inserting a preset creates a normal `e_booklet_hotspots` row. Later edits or replacements of the library preset affect only future inserts.

Rationale:

- Published templates and purchased instances need stability.
- Admins should not accidentally alter live student-facing content by updating a reusable preset.
- Existing viewer and access flows can continue reading normal template-version hotspots.

### Preset Contents

Presets include the full hotspot definition except the target template version and required placement override.

Preset content includes:

- Shape.
- Width/height/radius.
- Type.
- Title.
- Text content.
- Primary asset reference.
- Trigger type.
- Display behavior JSON.
- Content JSON.
- Interaction JSON.
- Optional default page number.
- Optional default x/y percent.

### Asset Behavior

Reuse the same e-booklet file asset references.

If a preset contains an image, audio, video, or file asset, inserted hotspots should point to the same asset IDs. The MVP does not duplicate media files or asset records.

Important consequence:

- Asset deletion policies must not break presets or inserted hotspots. If asset deletion exists elsewhere, it must account for references from both `e_booklet_hotspots` and `e_booklet_hotspot_presets`/preset JSON blocks.

### Placement Behavior

Presets store optional default placement:

- `default_page_number`
- `default_x_percent`
- `default_y_percent`

Insertion supports placement overrides:

- Click-to-place: admin selects preset, then clicks on the PDF page. The clicked page/x/y override preset defaults.
- Apply to current hotspot/draft: admin applies preset content/style while keeping the currently selected or draft hotspot's page/x/y.
- Default insert: if no override is supplied, backend may use preset default placement. If no default placement exists, backend should reject with a clear validation error.

### Creation And Replacement

Admins can create new presets from existing hotspots.

Admins can also replace an existing preset's content from an existing hotspot after a simple confirmation. Replacement updates the preset fields used for future inserts only. It does not update already inserted hotspots.

### Metadata Editing

For MVP, the standalone library page only edits metadata:

- Name.
- Description.
- Tags.
- Active/archive state through archive/delete action.

Full direct content editing in the library page is out of scope. To change content, an admin edits an inserted hotspot in the normal editor and then saves it as a new preset or replaces an existing preset.

### Organization

Use simple organization fields:

- Name.
- Description.
- Tags.
- Type.

Do not add curriculum fields in MVP.

### Preview

Use compact card preview.

Each card should show:

- Name.
- Type icon/label.
- Tags.
- Title or text snippet.
- Shape/color/style indicator where practical.
- Archived/inactive state if shown in management views.

Do not implement full rendered media previews in MVP.

### Permissions

Use the same permission boundary as the existing e-booklet template editor. Any admin who can edit e-booklet templates can use, create, replace, edit metadata, and delete/archive presets.

Do not introduce a new permission or role in MVP.

### Naming

Use **Hotspot Library** in the admin UI.

Helper copy may call items “presets” to clarify that they are copied into templates.

## Data Model

### New Table: `e_booklet_hotspot_presets`

Purpose: stores reusable full hotspot preset definitions.

Recommended fields:

- `id`: primary key.
- `name`: required string.
- `description`: nullable text.
- `tags_json`: JSON array of strings, default `[]`.
- `type`: same enum as `e_booklet_hotspots.type`.
- `shape`: same enum as `e_booklet_hotspots.shape`, default `circle`.
- `width_percent`: nullable decimal.
- `height_percent`: nullable decimal.
- `radius_percent`: decimal, default should mirror hotspot default behavior.
- `title`: nullable string.
- `text_content`: nullable text/string.
- `asset_file_id`: nullable FK to `e_booklet_file_assets.id`.
- `trigger_type`: same enum as `e_booklet_hotspots.trigger_type`, default `click`.
- `display_behavior`: nullable JSON.
- `content_json`: nullable JSON.
- `interaction_json`: nullable JSON.
- `default_page_number`: nullable integer.
- `default_x_percent`: nullable decimal.
- `default_y_percent`: nullable decimal.
- `source_template_id`: nullable FK to `e_booklet_templates.id`.
- `source_template_version_id`: nullable FK to `e_booklet_template_versions.id`.
- `source_hotspot_id`: nullable FK to `e_booklet_hotspots.id`.
- `is_active`: boolean, default `true`.
- `created_by`: required FK to `users.id`.
- `updated_by`: nullable FK to `users.id`.
- `created_at`: timestamp.
- `updated_at`: timestamp.

Indexes:

- Index on `is_active`.
- Index on `type`.
- Index on `created_by`.
- Index on `source_template_id`.
- Index on `source_template_version_id`.
- Index on `source_hotspot_id`.
- If Postgres JSON/tag search support is practical, add a GIN index for `tags_json`; otherwise keep tags filtering simple in service code for MVP scale.

Uniqueness:

- Do not enforce global unique `name` in MVP. Multiple presets may share a name if admins intentionally create variants.

Referential behavior:

- Source FKs should not prevent deletion/archival of source templates/hotspots if the existing domain permits it. Prefer nullable references with `SET NULL` on delete where supported.
- `asset_file_id` should follow existing asset FK conventions. If hard deletion of assets is allowed, the system must guard against deleting assets still referenced by presets.

### New Table: `e_booklet_hotspot_preset_usages`

Purpose: audit inserted preset usage.

Recommended fields:

- `id`: primary key.
- `preset_id`: FK to `e_booklet_hotspot_presets.id`.
- `target_template_id`: nullable FK to `e_booklet_templates.id`.
- `target_template_version_id`: required FK to `e_booklet_template_versions.id`.
- `target_hotspot_id`: required FK to `e_booklet_hotspots.id`.
- `used_by`: required FK to `users.id`.
- `used_at`: timestamp.

Indexes:

- Index on `preset_id`.
- Index on `target_template_id`.
- Index on `target_template_version_id`.
- Index on `target_hotspot_id`.
- Index on `used_by`.
- Index on `used_at`.

Deletion behavior:

- Usage rows are the definition of whether a preset is used.
- If a preset has no usage rows, deletion should hard delete the preset.
- If a preset has one or more usage rows, deletion should archive the preset by setting `is_active=false`.
- Usage rows should generally be retained for audit even if target templates/hotspots are later archived. If referential constraints would block normal cleanup, prefer nullable target fields with `SET NULL` for template/hotspot references.

### Generated Prisma Updates

After schema changes:

- Add Prisma models/enums/relations in the source Prisma schema used by the store API.
- Generate Prisma client.
- Verify generated models appear under `backend/src/apps/store-api/generated/prisma/models/`.
- Do not manually edit generated Prisma files.

## Backend Requirements

### Service Ownership

Implement Hotspot Library behavior in the existing e-booklet service/domain area unless the service is already too large.

Acceptable structure:

- Add methods to `e-booklet.service.ts` if current e-booklet hotspot logic lives there.
- Or create a small focused service such as `e-booklet-hotspot-preset.service.ts` and expose it through the existing e-booklet service/controller layer.

Prefer focused helper functions for payload sanitization/copying, but do not introduce unnecessary abstraction beyond this feature.

### DTOs And Validation

Add request DTOs or explicit validation for:

- Create preset from payload/source hotspot.
- Update preset metadata.
- Replace preset content.
- Insert hotspot from preset.
- List filters.

Validation rules:

- `name` is required for create.
- `name` must be trimmed and non-empty.
- `description` may be empty/null.
- `tags` must normalize to an array of unique trimmed strings.
- Tag strings should have a practical max length, such as 40 or 64 characters.
- Preset type must be a valid e-booklet hotspot type.
- Placement values must be finite numbers.
- Percent fields must be bounded consistently with existing hotspot editor behavior.
- `default_page_number`, if present, must be a positive integer.
- `default_x_percent`/`default_y_percent`, if present, must be within page percentage bounds.
- Insert requires either an explicit placement override or complete preset default placement.
- Insert target `versionId` must exist.
- Source hotspot for save/replace must exist and be accessible to the admin route.

### Payload Copy Rules

When creating/replacing a preset from an existing hotspot, copy these fields:

- `type`
- `shape`
- `width_percent`
- `height_percent`
- `radius_percent`
- `title`
- `text_content`
- `asset_file_id`
- `trigger_type`
- `display_behavior`
- `content_json`
- `interaction_json`
- `page_number` to `default_page_number` when requested/available.
- `x_percent` to `default_x_percent` when requested/available.
- `y_percent` to `default_y_percent` when requested/available.
- Source template/version/hotspot provenance.

Do not copy:

- `id`
- `template_version_id`
- `reference_number`
- `sort_order`
- `is_active` from the source hotspot.
- Source hotspot timestamps.
- Source hotspot creator/updater as preset creator/updater, except through normal audit fields.

Reference number note:

- Do not copy `reference_number` into presets for MVP. Reference numbers are unique per template version and can conflict. Inserted hotspots should let the existing create-hotspot behavior assign or accept reference numbers only if a future explicit requirement adds that.

Content JSON note:

- Preserve existing `content_json` shape, including `version: 2` and `blocks`.
- Preserve block-level asset references.
- Backend should not trust frontend-only block IDs as stable persistence identifiers.

### Insert From Preset Rules

Endpoint creates a normal `e_booklet_hotspots` row from a preset.

Input placement resolution order:

- Use explicit `page_number`, `x_percent`, `y_percent` in request if provided.
- Otherwise use preset `default_page_number`, `default_x_percent`, `default_y_percent`.
- If placement is incomplete, reject with `400 Bad Request` and a clear message.

Inserted hotspot fields:

- `template_version_id`: from route param.
- `page_number`: resolved placement.
- `x_percent`: resolved placement.
- `y_percent`: resolved placement.
- `radius_percent`: from preset.
- `shape`: from preset.
- `width_percent`: from preset.
- `height_percent`: from preset.
- `type`: from preset.
- `title`: from preset.
- `text_content`: from preset.
- `asset_file_id`: from preset.
- `trigger_type`: from preset.
- `display_behavior`: from preset.
- `content_json`: from preset.
- `interaction_json`: from preset.
- `is_active`: true.
- `created_by`: current admin user.
- `updated_by`: null/omitted initially.

After hotspot creation:

- Insert one usage log row.
- Include `target_template_id` if resolvable from template version.
- Include `target_template_version_id`.
- Include `target_hotspot_id`.
- Include `preset_id` and current admin user.
- Return the created hotspot in the same shape as existing create-hotspot responses.

Transaction requirement:

- Creating the hotspot and usage log should happen in a single transaction. If usage logging fails, hotspot creation should not silently succeed without audit.

### Admin API Endpoints

#### List Presets

Endpoint:

- `GET /admin/e-booklet-hotspot-presets`

Query params:

- `search`, optional.
- `type`, optional.
- `tag`, optional.
- `include_inactive`, optional boolean, default false.
- `page`, optional, default 1.
- `limit`, optional, default consistent with admin lists.

Behavior:

- By default return active presets only.
- Filter by exact `type` when supplied.
- Filter by tag when supplied.
- Search should match at least `name`, `description`, `title`, `text_content`, and tags.
- Search over nested `content_json` text is nice-to-have. If implemented, keep it safe and bounded.
- Sort newest updated/created first unless product wants alphabetical ordering later.

Response shape:

- `success: true`
- `data: []`
- `total`
- `page`
- `limit`

Each list item should include compact-card fields plus IDs and metadata:

- `id`
- `name`
- `description`
- `tags`
- `type`
- `shape`
- `title`
- `text_content`
- `display_behavior`
- `default_page_number`
- `default_x_percent`
- `default_y_percent`
- `is_active`
- `created_at`
- `updated_at`
- Optional source summary if easy to include.

#### Get Preset

Endpoint:

- `GET /admin/e-booklet-hotspot-presets/:presetId`

Behavior:

- Returns full preset details for insert/apply and management.
- Should include full `content_json` and `interaction_json`.
- Should include source provenance fields.

#### Create Preset

Recommended endpoint:

- `POST /admin/e-booklet-hotspot-presets`

Payload options:

- `source_hotspot_id`: preferred for saving from editor.
- `name`: required.
- `description`: optional.
- `tags`: optional array.
- `include_position`: optional boolean, default true for current decisions.

Behavior:

- Fetch source hotspot and related template/version provenance.
- Copy hotspot content fields into a new preset.
- Store default placement if `include_position` is true.
- Return created preset.

Alternative/direct payload create:

- Direct preset content payload can be supported if useful for tests or future admin creation, but MVP UI should create from source hotspot.

#### Update Metadata

Endpoint:

- `PATCH /admin/e-booklet-hotspot-presets/:presetId/metadata`

Payload:

- `name`
- `description`
- `tags`
- Optional `is_active` if restore/archive should use metadata endpoint.

Behavior:

- Only updates metadata fields.
- Does not update content/style/media fields.

#### Replace Content

Endpoint:

- `PUT /admin/e-booklet-hotspot-presets/:presetId/content`

Payload:

- `source_hotspot_id`: required.
- `include_position`: optional boolean, default true.
- Optional `name`, `description`, `tags` only if the UI wants replacement to update metadata too. MVP can keep replacement content-only and leave metadata unchanged.

Behavior:

- Simple confirmation happens in the frontend before request.
- Backend fetches source hotspot.
- Backend replaces content/style/behavior/media/default-placement/source-provenance fields.
- Backend preserves preset `id`, existing usage logs, and created audit fields.
- Backend sets `updated_by` and `updated_at`.
- Existing inserted hotspots are unaffected.

#### Delete Or Archive

Endpoint:

- `DELETE /admin/e-booklet-hotspot-presets/:presetId`

Behavior:

- Count usage rows for preset.
- If count is zero, hard delete preset.
- If count is greater than zero, set `is_active=false` and return archived result.

Response should make the result explicit:

- `{ success: true, data: { action: "deleted" } }`
- `{ success: true, data: { action: "archived", preset } }`

#### Restore Archived Preset

Recommended endpoint:

- `POST /admin/e-booklet-hotspot-presets/:presetId/restore`

Behavior:

- Sets `is_active=true`.
- Useful because deletion can archive rather than delete.
- If not implemented in first slice, admin page must clearly show archived presets cannot be restored yet. Prefer implementing restore if archive is implemented.

#### Insert From Preset

Endpoint:

- `POST /admin/e-booklet-template-versions/:versionId/hotspots/from-preset`

Payload:

```json
{
  "preset_id": 123,
  "page_number": 5,
  "x_percent": 40.2,
  "y_percent": 62.8
}
```

Behavior:

- Validate `versionId`.
- Validate active preset exists.
- Resolve placement.
- Create normal hotspot.
- Create usage log in same transaction.
- Return created hotspot.

Should inactive presets be insertable?

- No. By default, archived/inactive presets should not be inserted.
- If a future admin override is needed, add an explicit option later.

### Route Registration

Register routes alongside existing admin e-booklet routes.

Expected route group examples:

- `GET /admin/e-booklet-hotspot-presets`
- `GET /admin/e-booklet-hotspot-presets/:presetId`
- `POST /admin/e-booklet-hotspot-presets`
- `PATCH /admin/e-booklet-hotspot-presets/:presetId/metadata`
- `PUT /admin/e-booklet-hotspot-presets/:presetId/content`
- `DELETE /admin/e-booklet-hotspot-presets/:presetId`
- `POST /admin/e-booklet-hotspot-presets/:presetId/restore`
- `POST /admin/e-booklet-template-versions/:versionId/hotspots/from-preset`

### Backend Error Handling

Use existing API error conventions.

Expected errors:

- Invalid preset ID: `400` for malformed ID or `404` if not found, depending on existing convention.
- Invalid source hotspot ID.
- Source hotspot not found.
- Target template version not found.
- Inactive preset cannot be inserted.
- Missing placement data.
- Invalid type/tag/percent values.
- Duplicate/invalid tag payload.

Messages should be admin-readable and translatable on the frontend where practical.

### Backend Tests

Add tests for:

- Creating preset from hotspot copies expected fields.
- Creating preset from hotspot stores source provenance.
- Creating preset normalizes tags.
- Creating preset rejects missing name.
- Listing presets filters by active state by default.
- Listing presets filters by type.
- Listing presets filters by tag.
- Listing presets searches name/description/title/text/tags.
- Metadata update changes only metadata fields.
- Replace content changes future preset content and preserves usage logs.
- Replace content does not modify existing inserted hotspots.
- Insert from preset creates normal hotspot with explicit placement.
- Insert from preset falls back to default placement.
- Insert from preset rejects missing placement when defaults are absent.
- Insert from preset creates usage log in transaction.
- Insert from inactive preset rejects.
- Delete hard-deletes unused preset.
- Delete archives used preset.
- Restore archived preset makes it listable/insertable again.
- Asset IDs are preserved in `asset_file_id` and `content_json` blocks.

## Frontend Requirements

### Navigation

Add a Hotspot Library entry under the E-Booklets admin area.

Target route:

- `/admin/e-booklets/hotspot-library`

The exact sidebar/nav file should be discovered during implementation. The new nav item should live near other e-booklet admin tools, not as a global unrelated admin section.

### Admin Hook/API Client

Extend `useAdminEBooklets.js` or create a focused hook.

Recommended focused hook:

- `useAdminEBookletHotspotLibrary()`

Required state:

- `presets`
- `pagination`
- `filters`
- `loading`
- `actionLoading`
- `selectedPreset` if useful

Required actions:

- `fetchPresets(overrides)`
- `fetchPreset(presetId)`
- `createPreset(data)`
- `updatePresetMetadata(presetId, data)`
- `replacePresetContent(presetId, data)`
- `deletePreset(presetId)`
- `restorePreset(presetId)`
- `insertPreset(versionId, data)`
- `setSearch(search)`
- `setType(type)`
- `setTag(tag)`
- `setPage(page)`
- `setIncludeInactive(includeInactive)` if management view supports archived presets.

Filter behavior:

- Search changes reset page to `1`.
- Type changes reset page to `1`.
- Tag changes reset page to `1`.
- Empty type/tag should be omitted from the request.
- `include_inactive` should be omitted unless true.

### Editor Integration

File:

- `AdminEBookletEditorPage.jsx`

Add editor controls in the Hotspots step.

Required actions:

- `Save to library`
- `Replace library preset`
- `Insert from library`
- `Apply preset to current hotspot`

#### Save Current Hotspot To Library

Preconditions:

- A saved hotspot exists (`hotspotForm.id`).
- If the current hotspot has unsaved autosave changes, either force-save first or disable until saved state is clean.

UX:

- Button opens a small dialog/form.
- Admin enters `name`, optional `description`, optional comma/tag input.
- Dialog explains the preset will include content, style, behavior, media references, and optional default position.
- Submit calls `POST /admin/e-booklet-hotspot-presets` with `source_hotspot_id`.
- Success shows toast and optionally keeps dialog open for quick copy of metadata only if needed.

Validation:

- Disable submit when name is empty.
- Show source hotspot title/type summary.

#### Replace Library Preset

Preconditions:

- A saved hotspot exists (`hotspotForm.id`).
- Presets can be searched/selected.

UX:

- Admin opens replace dialog.
- Admin searches/selects an existing preset.
- Show simple confirmation: replacing affects future inserts only and does not update existing templates.
- Submit calls `PUT /admin/e-booklet-hotspot-presets/:presetId/content` with `source_hotspot_id`.
- Success toast indicates replacement complete.

Guardrail copy:

- “This replaces the library preset for future use only. Hotspots already inserted into templates will not change.”

#### Insert From Library: Click-To-Place

Flow:

- Admin clicks `Insert from library`.
- Library picker opens.
- Admin selects a preset.
- Picker closes or enters placement mode.
- Editor shows a short placement prompt, such as “Click the page to place this preset.”
- Admin clicks on the PDF page.
- Frontend calls `POST /admin/e-booklet-template-versions/:versionId/hotspots/from-preset` with preset ID and clicked page/x/y.
- On success, reload hotspots for the version and select the created hotspot if practical.

State required:

- `pendingPresetPlacement` or equivalent, storing selected preset ID/summary.

Cancel behavior:

- Admin can cancel placement mode before clicking.
- Pressing escape or clicking a cancel button should clear pending placement state.

#### Apply Preset To Current Hotspot/Draft

Flow for existing saved hotspot:

- Admin selects an existing hotspot.
- Admin opens library picker and chooses `Apply to current hotspot`.
- Frontend fetches full preset if needed.
- Frontend updates current hotspot form fields with preset content/style/behavior while preserving `id`, `page_number`, `x_percent`, `y_percent`.
- Existing autosave/save flow updates that hotspot.

Flow for draft hotspot:

- Admin clicks page to create draft location.
- Admin opens library picker and chooses preset.
- Frontend applies preset fields to draft form while preserving page/x/y.
- Existing create hotspot flow saves it.

Important behavior:

- Applying a preset to a current/draft hotspot is not a usage-log insert unless it uses the backend `from-preset` endpoint.
- To preserve audit, prefer using backend `from-preset` for new draft creation when possible.
- For applying to an already saved hotspot, usage logging is ambiguous because no new hotspot is created. MVP can either not log this as usage, or add a backend endpoint later for “apply preset to existing hotspot.”

Recommendation for MVP:

- For new placement, always use backend `from-preset` and log usage.
- For applying to an existing hotspot, use existing update hotspot flow and do not create usage log. If audit is important, add explicit usage type later.

#### Applying Preset Fields In Frontend

When applying a preset to form state, preserve placement and identity:

- Preserve `id`.
- Preserve `page_number`.
- Preserve `x_percent`.
- Preserve `y_percent`.
- Preserve `reference_number` unless product later decides presets should override it.

Replace from preset:

- `shape`
- `width_percent`
- `height_percent`
- `radius_percent`
- `type`
- `title`
- `text_content`
- `asset_file_id`
- `trigger_type`
- `display_behavior`
- `content_json`
- `interaction_json`

Use existing normalization helpers to convert preset payload into form-compatible state.

### Library Picker Component

Recommended component:

- `frontend/src/components/admin/e-booklets/HotspotLibraryPickerDialog.jsx`

Responsibilities:

- Render search input.
- Render type filter.
- Render tag filter.
- Render compact preset cards.
- Render loading/empty/error states.
- Support pagination if result set is large.
- Allow selection callback with preset summary or full preset.
- Support modes: `insert`, `apply`, `replace`.

Props:

- `open`
- `onOpenChange`
- `mode`
- `onSelectPreset`
- `selectedPresetId`
- Optional `title`
- Optional `description`

Accessibility:

- Dialog title and description should be present.
- Search input should have label/placeholder.
- Cards should be keyboard-selectable buttons.
- Use existing dialog/button components where available.

### Compact Preset Card

Recommended component:

- `frontend/src/components/admin/e-booklets/HotspotPresetCard.jsx`

Fields:

- Type icon using existing hotspot icon mapping if practical.
- Name.
- Description or snippet.
- Tags.
- Default placement summary if present.
- Shape/color indicator.
- Active/archived badge in management page.

Snippet resolution:

- Prefer preset `title`.
- Then preset `text_content`.
- Then first text-like block in `content_json.blocks`.
- Then URL/youtube/file hint when available.
- Then fallback to translated “No text preview”.

### Admin Library Page

Route:

- `/admin/e-booklets/hotspot-library`

Recommended file:

- `frontend/src/pages/admin/e-booklets/AdminEBookletHotspotLibraryPage.jsx`

Layout:

- Reuse admin page conventions.
- Header with title “Hotspot Library”.
- Subtitle explaining these are reusable presets copied into e-booklet templates.
- Search input.
- Type select/filter.
- Tag filter input/select.
- Optional “Show archived” toggle.
- Grid/list of compact cards.
- Pagination controls.

Card actions:

- `Edit details`.
- `Archive` or `Delete`, with final result determined by backend.
- `Restore` for archived presets if restore endpoint exists.

Edit details dialog:

- Fields: name, description, tags.
- Does not expose content/style/media editing.
- Save calls metadata endpoint.

Archive/delete dialog:

- Confirmation should say: “If this preset has never been used, it will be deleted. If it has been used, it will be archived.”
- Success toast should reflect backend result: deleted vs archived.

Empty states:

- No presets: explain admins can save hotspots from the e-booklet editor.
- No filtered results: prompt to clear search/filter.
- Archived-only empty state if show archived is enabled and none exist.

### Translations

Namespace should likely be `eBooklets` to match existing e-booklet admin UI.

Recommended keys:

- `admin.hotspotLibrary.title`
- `admin.hotspotLibrary.description`
- `admin.hotspotLibrary.open`
- `admin.hotspotLibrary.searchPlaceholder`
- `admin.hotspotLibrary.typeFilter`
- `admin.hotspotLibrary.tagFilter`
- `admin.hotspotLibrary.showArchived`
- `admin.hotspotLibrary.noPresets`
- `admin.hotspotLibrary.noPresetsDescription`
- `admin.hotspotLibrary.noResults`
- `admin.hotspotLibrary.editDetails`
- `admin.hotspotLibrary.saveDetails`
- `admin.hotspotLibrary.archiveOrDelete`
- `admin.hotspotLibrary.restore`
- `admin.hotspotLibrary.deleted`
- `admin.hotspotLibrary.archived`
- `admin.hotspotLibrary.restored`
- `admin.hotspotLibrary.saveCurrent`
- `admin.hotspotLibrary.saveCurrentDescription`
- `admin.hotspotLibrary.replaceExisting`
- `admin.hotspotLibrary.replaceExistingDescription`
- `admin.hotspotLibrary.replaceConfirmTitle`
- `admin.hotspotLibrary.replaceConfirmDescription`
- `admin.hotspotLibrary.insertFromLibrary`
- `admin.hotspotLibrary.applyToCurrent`
- `admin.hotspotLibrary.clickToPlacePrompt`
- `admin.hotspotLibrary.cancelPlacement`
- `admin.hotspotLibrary.inserted`
- `admin.hotspotLibrary.applied`
- `admin.hotspotLibrary.nameLabel`
- `admin.hotspotLibrary.descriptionLabel`
- `admin.hotspotLibrary.tagsLabel`
- `admin.hotspotLibrary.tagsPlaceholder`
- `admin.hotspotLibrary.defaultPlacement`
- `admin.hotspotLibrary.noPreview`

Arabic/RTL requirements:

- All new user-visible labels should have Arabic translations where the app supports Arabic.
- Dialogs and filters should respect existing direction handling.
- Tag chips and cards should wrap cleanly in RTL.

### Frontend Tests

Add behavior/component tests for:

- Library hook builds query params for search/type/tag.
- Library hook omits empty filters.
- Library hook resets page on filter changes.
- Picker renders presets and calls select callback.
- Picker shows empty state.
- Preset card snippet resolution.
- Save current hotspot dialog requires name.
- Save current hotspot calls create endpoint with `source_hotspot_id`.
- Replace preset shows confirmation copy.
- Replace preset calls content replacement endpoint.
- Click-to-place mode calls insert endpoint with selected page/x/y.
- Apply-to-current preserves page/x/y/id and replaces content/style fields.
- Admin library page metadata edit calls metadata endpoint.
- Delete/archive shows backend action-specific toast.

Existing likely test style:

- Frontend behavior tests under `kalima-platform/frontend/tests/`.

## UX Acceptance Criteria

### Editor Hotspots Step

- Admin can see Hotspot Library actions without leaving the editor.
- Admin can save a selected/saved hotspot to the library.
- Admin cannot save an unsaved/nonexistent hotspot without clear instruction.
- Admin can replace an existing preset from the selected hotspot after confirmation.
- Admin can open a searchable/filterable preset picker.
- Admin can select a preset and click the PDF page to insert it.
- Inserted preset appears as a normal hotspot on the page after save/reload.
- Admin can apply a preset to the current hotspot/draft without moving its position.
- Canceling placement mode leaves editor unchanged.

### Admin Hotspot Library Page

- Admin can navigate to `/admin/e-booklets/hotspot-library`.
- Admin can search presets by text.
- Admin can filter presets by type.
- Admin can filter presets by tag.
- Admin sees compact cards with enough information to identify presets.
- Admin can edit name/description/tags.
- Admin can delete/archive presets with confirmation.
- Admin gets clear feedback whether a preset was deleted or archived.
- Admin can see archived presets if the page includes a show-archived toggle.
- Admin can restore archived presets if restore endpoint is implemented.

## API Contract Summary

List presets:

```http
GET /admin/e-booklet-hotspot-presets?search=quiz&type=question_answer&tag=grammar&page=1&limit=20
```

Create preset from hotspot:

```http
POST /admin/e-booklet-hotspot-presets
Content-Type: application/json

{
  "source_hotspot_id": 456,
  "name": "Grammar checkpoint question",
  "description": "Reusable Q&A hotspot for grammar review pages.",
  "tags": ["grammar", "checkpoint"],
  "include_position": true
}
```

Update metadata:

```http
PATCH /admin/e-booklet-hotspot-presets/123/metadata
Content-Type: application/json

{
  "name": "Grammar checkpoint question",
  "description": "Updated admin-facing description.",
  "tags": ["grammar", "quiz"]
}
```

Replace content:

```http
PUT /admin/e-booklet-hotspot-presets/123/content
Content-Type: application/json

{
  "source_hotspot_id": 789,
  "include_position": true
}
```

Insert from preset:

```http
POST /admin/e-booklet-template-versions/55/hotspots/from-preset
Content-Type: application/json

{
  "preset_id": 123,
  "page_number": 5,
  "x_percent": 40.2,
  "y_percent": 62.8
}
```

Delete/archive:

```http
DELETE /admin/e-booklet-hotspot-presets/123
```

Restore:

```http
POST /admin/e-booklet-hotspot-presets/123/restore
```

## Implementation Plan

### Phase 1: Backend Data And Core Service

Tasks:

- Add Prisma schema models for `e_booklet_hotspot_presets` and `e_booklet_hotspot_preset_usages`.
- Add migration.
- Generate Prisma client.
- Implement preset field-copy helper from `e_booklet_hotspots`.
- Implement tag normalization helper.
- Implement list/get/create/update-metadata/replace/delete/restore service methods.
- Implement insert-from-preset service method with transaction and usage log.
- Add backend tests for service behavior.

Verification:

- Migration applies cleanly.
- Prisma generation succeeds.
- Backend tests for preset service pass.

### Phase 2: Backend Routes And Controller

Tasks:

- Add controller methods.
- Register admin routes.
- Validate route params and request payloads.
- Ensure same admin middleware/permission as existing e-booklet template editor routes.
- Add API-level tests if existing test harness supports them.

Verification:

- Route tests pass.
- Manual API calls can create/list/insert/delete/archive presets.

### Phase 3: Frontend Hook And Shared Components

Tasks:

- Add `useAdminEBookletHotspotLibrary` or equivalent actions to `useAdminEBooklets.js`.
- Add `HotspotPresetCard`.
- Add `HotspotLibraryPickerDialog`.
- Add metadata edit/delete confirmation dialogs if not embedded in page.
- Add translations.
- Add frontend behavior tests for hook and components.

Verification:

- Frontend tests pass.
- Components render with mocked data.
- Query params match API contract.

### Phase 4: Editor Integration

Tasks:

- Add Hotspot Library controls to Hotspots step.
- Add save-current-hotspot dialog.
- Add replace-existing-preset flow.
- Add insert-from-library picker and pending click-to-place state.
- Add apply-to-current flow preserving page/x/y/id.
- Wire success reload/select behavior.
- Add placement cancel behavior.

Verification:

- Admin can save current hotspot as preset.
- Admin can replace preset content.
- Admin can insert preset by clicking PDF page.
- Admin can apply preset to existing/draft hotspot without moving it.
- Existing hotspot autosave behavior remains stable.

### Phase 5: Admin Library Page

Tasks:

- Add route `/admin/e-booklets/hotspot-library`.
- Add navigation item under E-Booklets admin area.
- Build page header, filters, cards, pagination.
- Add metadata edit dialog.
- Add delete/archive confirmation.
- Add restore if backend restore exists.
- Add empty/loading/error states.

Verification:

- Admin page lists presets.
- Search/type/tag filters work.
- Metadata edit works.
- Delete/archive works and toast matches backend action.
- Archived visibility/restore works if implemented.

### Phase 6: End-To-End Verification

Tasks:

- Run backend tests.
- Run frontend tests/build.
- Start local dev using Kalima dev tunnel workflow before browser smoke.
- Browser smoke editor flows.
- Browser smoke library page.
- Verify no regressions in existing hotspot create/update/delete and viewer hotspot content.

Verification:

- All selected automated checks pass.
- Manual admin smoke passes.
- Existing e-booklet viewer can still open inserted hotspot content/media.

## Manual Smoke Test Plan

Use the `kalima-dev-tunnel` skill before starting, restarting, debugging, or testing local Kalima frontend/backend dev servers.

Backend/API smoke:

- Create or identify a template version with at least one hotspot.
- Save that hotspot as a library preset.
- List presets and verify it appears.
- Filter by type and tag.
- Fetch preset detail and verify full content JSON is present.
- Insert preset into a different page/version with explicit placement.
- Verify created hotspot exists in `listVersionHotspots`.
- Verify usage log row exists.
- Delete an unused test preset and verify hard delete.
- Delete a used preset and verify archive.

Editor smoke:

- Open `/admin/e-booklets/:id/edit`.
- Go to Hotspots step.
- Select existing hotspot.
- Save to library with name/tags.
- Open Insert from library picker.
- Search/filter for the new preset.
- Select preset and click page to place.
- Verify new hotspot appears at clicked location.
- Open the new hotspot and verify content/style/media.
- Create draft location and apply a preset while preserving position.
- Replace an existing preset from a modified hotspot and confirm future insert uses the replacement.

Admin page smoke:

- Open `/admin/e-booklets/hotspot-library`.
- Verify list loads.
- Search by name.
- Filter by type.
- Filter by tag.
- Edit metadata.
- Delete/archive preset and verify result toast.
- Show archived and restore if implemented.

Viewer smoke:

- Open admin or user viewer for a template/instance containing an inserted preset hotspot.
- Verify text/link/Q&A/image/audio/video/file content still loads through existing viewer endpoints.
- Verify reused media asset permissions still work.

## Risks And Mitigations

Risk: preset replacement is mistaken for updating existing templates.

Mitigation:

- Confirmation copy must explicitly say replacements affect future inserts only.
- Documentation and helper text should call presets reusable starting points.

Risk: asset deletion breaks presets or inserted hotspots.

Mitigation:

- Audit asset deletion logic before enabling hard deletion of assets referenced by presets.
- Add tests or service guards if asset deletion is part of the system.

Risk: frontend applies preset inconsistently with backend insertion.

Mitigation:

- Keep one shared frontend normalization path for form application.
- Use backend `from-preset` for new hotspot insertion and usage logging.
- Add tests for apply-to-current preserving placement.

Risk: `reference_number` collisions.

Mitigation:

- Do not copy reference numbers from hotspots into presets in MVP.
- Let existing hotspot create/update rules handle reference numbers.

Risk: library page grows into a full editor too early.

Mitigation:

- MVP only edits metadata on the library page.
- Content editing stays in the existing e-booklet editor.

Risk: usage logging misses apply-to-existing-hotspot flows.

Mitigation:

- Define MVP usage logs as insert-created-new-hotspot only.
- If audit of apply-to-existing becomes important, add a dedicated backend apply endpoint and usage type later.

Risk: JSON tag filtering/search becomes slow.

Mitigation:

- Start with indexes where practical.
- Keep page limits bounded.
- Add GIN/full-text indexing later if data grows.

Risk: existing editor component becomes too large.

Mitigation:

- Extract picker/card/dialog components.
- Keep editor state additions narrowly scoped to selected preset and placement mode.

## Definition Of Done

- `e_booklet_hotspot_presets` and `e_booklet_hotspot_preset_usages` exist with migration and generated Prisma client.
- Admin APIs support list, get, create from hotspot, metadata update, content replace, delete/archive, restore, and insert from preset.
- Insert from preset creates a normal hotspot and usage log in one transaction.
- Preset deletion hard deletes unused presets and archives used presets.
- Admin editor can save current hotspot to library.
- Admin editor can replace existing preset content from current hotspot after confirmation.
- Admin editor can insert a preset by selecting it and clicking the page.
- Admin editor can apply a preset to current/draft hotspot while preserving placement.
- Admin page exists at `/admin/e-booklets/hotspot-library`.
- Admin page supports search, type filter, tag filter, compact cards, metadata edit, and delete/archive.
- UI uses “Hotspot Library” label.
- Same admin permissions as e-booklet template editor are enforced.
- Automated backend and frontend tests cover core contracts.
- Browser smoke verifies editor, library page, API, and viewer behavior.
- Existing e-booklet hotspot create/update/delete and viewer flows still work.
