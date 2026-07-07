# E-Booklet Access Code Print Batches Implementation Plan

## 1. Objective
Implement the e-booklet access-code printable batch feature described in `kalima-platform/docs/specs/e-booklet-access-code-print-batches-spec.md`.
The implementation must add template-based printable cards, server-side PDF generation, admin-only batch management, signed QR redemption, and login-required student confirmation.
The implementation must preserve Kalima's current e-booklet access-code entitlement model.
The implementation must not copy Fekra's browser-side PDF architecture as the final design.

## 2. Success Criteria
An admin can create a print template using an `827 x 438 px` image at `300 PPI`.
An admin can position QR, code, teacher image, price, registration method, grade or class, and red custom text fields visually.
An admin can configure global presets for registration methods and grade or class values.
An admin can generate access codes only.
An admin can generate access codes plus one server-rendered PDF for the whole batch.
Each printable card has one unique code and one unique signed QR reference.
Students must log in before redemption.
Students see a confirmation screen before redeeming.
Successful redemption consumes the code and the seat.
Failed redemption caused by seat exhaustion does not burn the code.
Batch metadata snapshots the exact printable state used at generation time.
The stored PDF and related print assets are private e-booklet file assets.
Tests prove the code, seat, QR, required-field, and PDF rules.

## 3. Worktree Guardrail
Start by checking `git status --short`.
There are already unrelated modified and untracked files in this workspace.
Do not revert or overwrite those files.
Before editing any e-booklet access-code file that is already modified, inspect the diff and preserve user work.
The main agent owns final integration and must review every subagent output before applying it.

## 4. Subagent Strategy
Use subagents for parallel exploration and isolated implementation slices.
Do not let multiple subagents edit the same files at the same time.
Each subagent must return a patch summary, touched files, tests run, risks, and unresolved questions.
The main agent must own schema consistency, API contract consistency, final test execution, and conflict resolution.
The main agent must not blindly merge subagent patches.

## 5. Recommended Subagents
Use a backend schema subagent for database models, migrations, and Prisma generated types.
Use a backend services subagent for template, preset, batch, signed QR, and redemption service logic.
Use a PDF renderer subagent for server-side card rendering, Arabic font handling, QR drawing, and PDF output.
Use a frontend admin subagent for template editor, presets, generation form, preview, batch list, and PDF download.
Use a frontend redemption subagent for login-preserving QR redemption and confirmation UI.
Use a QA subagent for test matrix, fixture design, focused automated tests, and browser verification.
Use a security review subagent late in the process for signed QR tamper resistance, private asset access, and audit coverage.

## 6. Subagent Boundaries
The backend schema subagent may edit Prisma schema, migration files, generated types if this repo commits them, and focused schema tests.
The backend services subagent may edit e-booklet access-code services, controllers, routes, DTOs, validators, and backend tests.
The PDF renderer subagent may add a print rendering service, renderer utilities, font assets if required, and PDF renderer tests.
The frontend admin subagent may edit admin e-booklet pages, hooks, API clients, locale files, and frontend tests for admin surfaces.
The frontend redemption subagent may edit public or student redemption routes, login return handling, confirmation UI, and frontend tests for redemption.
The QA subagent should avoid product code unless fixing test harness defects found during verification.
The security review subagent should be read-mostly unless it finds a small concrete defect that the main agent asks it to patch.

## 7. Phase 0 - Baseline And Reproduction
Inspect the current e-booklet access-code service, redemption service, routes, controllers, admin hooks, and teacher invitation pages.
Inspect the current dirty diffs before editing.
Identify the current endpoint and UI path for generating e-booklet access codes.
Run the most focused existing e-booklet backend tests before changes.
Run the most focused frontend source tests or lint checks for e-booklet admin pages if available.
Record the current code format and current max bulk behavior.
Record current terms acceptance behavior.
Record current remaining-seat calculation and redemption behavior.

## 8. Phase 1 - Schema And Migration
Add `e_booklet_access_code_print_templates`.
Add `e_booklet_access_code_print_presets`.
Add `e_booklet_access_code_print_batches`.
Add `e_booklet_access_code_print_batch_codes`.
Add indexes for template status, preset type, teacher id, booklet instance id, batch status, and access-code id.
Add foreign keys to users, e-booklet instances, e-booklet terms, e-booklet access codes, and file assets.
Add deletion protection for templates used by batches at service level.
Decide whether file asset enum values need `print_template`, `print_teacher_image`, and `print_pdf`.
Run Prisma generation if this repo requires checked-in generated files.
Add migration tests or backend service tests that prove used templates cannot be deleted.

## 9. Phase 2 - Backend Template And Preset APIs
Create template DTO validation for name, dimensions, field layout, status, and required-field defaults.
Validate uploaded template images as exactly `827 x 438 px`.
Store template backgrounds as private e-booklet file assets.
Implement template list, create, update, archive, and delete-if-unused endpoints.
Implement preset list, create, update, reorder, activate, and deactivate endpoints.
Enforce admin or subadmin permissions.
Add tests for dimension rejection, missing QR field rejection, missing code field rejection, archive behavior, and used-template delete blocking.

## 10. Phase 3 - Backend Batch Generation
Add a batch generation service that wraps access-code generation and print metadata creation.
Support codes-only generation through the existing access-code path.
Support codes-plus-PDF generation through the new print batch path.
Validate selected teacher-owned e-booklet instance.
Validate terms acceptance using existing e-booklet terms rules.
Validate requested count against current remaining seats at generation time.
Do not reserve seats during generation.
Validate required batch fields after template defaults and batch overrides are combined.
Upload teacher image from the generator only.
Do not read teacher profile image for printable batches.
Create access codes using the current secure code format.
Create a snapshot JSON containing template image, field positions, dimensions, required flags, presets, batch values, and renderer settings.
Create one batch-code link per access code.
Generate one signed opaque QR reference per access code.
Render and store one private PDF for the whole batch.
Make the batch immutable after successful generation.
Add a failed-batch strategy if PDF rendering fails after code creation.
Prefer transactional rollback if practical.
If rollback is not practical because file writes are involved, mark the batch failed and do not expose the PDF or active printable distribution state.

## 11. Phase 4 - Signed QR And Redemption APIs
Create a signed opaque reference model or token scheme for QR URLs.
Do not put teacher name, booklet title, class text, price text, or Arabic strings directly in query params.
Require login before returning redemption prefill data.
Preserve the QR return URL through login.
Return teacher, e-booklet, grade or class, code display, and teacher image if present.
Do not return price text for the confirmation screen.
Require explicit student confirmation before redeeming.
On redeem, re-check code status, code expiration, signature validity, student eligibility, and remaining seats.
If seats are exhausted, return a clear failure and leave the code active.
If redemption succeeds, mark the code redeemed and grant access.
Add tests for tampered QR references, unauthenticated redirects, successful prefill, successful redemption, reused code rejection, and seat-exhaustion retry behavior.

## 12. Phase 5 - Server-Side PDF Renderer
Choose a backend renderer that supports image composition, Arabic text, QR generation, private file output, and physical PDF dimensions.
Recommended path is a Node PDF pipeline using a proven PDF library plus a QR generation library.
Confirm Arabic shaping and font support before locking the renderer.
Bundle or configure an Arabic-capable font that can be used on local, test, and production environments.
Render one card at `827 x 438 px`.
Map pixels to PDF physical size using `300 PPI`.
Pack cards on A4 pages at true physical size.
Use conservative margins so printers do not clip cards.
Use field-level direction and alignment.
Use LTR isolation for the access code inside Arabic layouts.
Render teacher image inside its placement box with a predictable fit mode.
Render QR inside the template QR box without batch-level resizing.
Return a backend-rendered sample preview from the same renderer used for final PDF output.
Add tests for card dimensions, PDF page count, required image rendering, QR presence, and code text normalization.

## 13. Phase 6 - Admin Frontend
Add an admin e-booklet access-code printing area.
Add subviews for generation, batches, templates, and presets.
Keep the UI consistent with existing admin e-booklet pages.
Build the template editor with image upload, drag and resize field boxes, and numeric precision inputs.
Add direction, alignment, color, and font-size controls where the spec requires them.
Add preset management for registration method and grade or class.
Build the generation form with teacher-owned e-booklet instance selection, count, kind, expiration, template selection, batch label, teacher image upload, price text, registration method, grade or class, red custom text, and required-field overrides.
Show the warning that generated codes do not reserve seats.
Show backend-rendered sample preview before generation.
Add batch list with snapshot values and capacity warning.
Add batch detail with PDF download.
Disable or hide teacher-facing PDF access in v1.
Add frontend validation that mirrors backend required-field rules without replacing backend validation.

## 14. Phase 7 - Student Redemption Frontend
Add or update the QR redemption route.
If unauthenticated, redirect to login and preserve the return URL.
After login, fetch the signed reference prefill payload.
Show a confirmation screen with teacher, e-booklet, grade or class, code, and teacher image if provided.
Do not show price.
Do not auto-redeem.
Call the redeem endpoint only after explicit confirmation.
Handle expired, already redeemed, invalid, disabled, and seat-exhausted states with clear Arabic copy.
Preserve mixed Arabic and LTR access-code rendering.

## 15. Phase 8 - Audit, Security, And Permissions
Audit template create, update, archive, delete attempt, and delete success.
Audit preset create and update.
Audit batch generation.
Audit PDF download.
Audit QR prefill validation.
Audit successful redemption.
Audit failed redemption categories.
Do not log raw signing secrets.
Do not expose private file assets through public URLs.
Require admin or subadmin permissions for admin print APIs.
Require student authentication for redemption prefill and redeem.
Ensure signed QR references cannot be used to redeem a different code or booklet.
Ensure a batch snapshot cannot be modified after generation.

## 16. Phase 9 - Test Plan
Run backend unit tests for template validation.
Run backend unit tests for required-field enforcement.
Run backend unit tests for generation count versus remaining seats.
Run backend unit tests proving generation does not reserve seats.
Run backend unit tests proving redemption re-checks seats.
Run backend unit tests proving seat-exhaustion failure does not burn the code.
Run backend tests for signed QR tamper rejection.
Run backend tests for code normalization with spaces and hyphens.
Run backend tests for one printed code equals one successful redemption.
Run backend tests for immutable batch snapshot behavior.
Run backend tests for private PDF download permission.
Run frontend tests for template editor state.
Run frontend tests for generation required-field behavior.
Run frontend tests for login return URL preservation.
Run browser E2E for admin preview, batch generation, PDF download, scan URL login redirect, confirmation, and redemption.
Run visual checks for Arabic text, LTR code isolation, card layout, and no overlap.

## 17. Phase 10 - Rollout
Keep the feature behind an admin-only route until tests pass.
Optionally use a feature flag if the admin route is visible in production before the feature is complete.
Deploy backend schema and code before exposing the frontend entrypoint.
Verify migration on a staging or local database snapshot.
Verify PDF generation in the same runtime profile used by production.
Verify the Arabic font is present in production containers or bundled with the app.
Verify private file download permissions after deploy.
Verify redemption flow from a real QR URL after deploy.

## 18. Main Agent Integration Checklist
Review every subagent patch before applying it.
Check for overlapping edits before merging work from multiple subagents.
Run formatting, lint, backend tests, frontend tests, and focused E2E.
Inspect generated migration SQL for destructive changes.
Inspect private file asset access paths.
Inspect final UI in browser with desktop and mobile widths.
Generate a real sample PDF and visually verify card sizing, Arabic text, QR placement, code placement, and teacher image placement.
Confirm the dirty worktree only contains intended changes before any commit.

## 19. Suggested Subagent Prompt Pack
Backend schema subagent prompt:
Implement the database schema and migration for e-booklet access-code print templates, presets, batches, and batch-code links based on the spec.
Do not touch frontend files.
Return migration details, generated type changes, tests run, and any schema tradeoffs.

Backend services subagent prompt:
Implement backend services and routes for templates, presets, batch generation, signed QR references, and login-required redemption.
Do not implement the frontend UI.
Use existing e-booklet access-code rules and preserve terms and seat behavior.
Return endpoint contracts, changed files, tests run, and risks.

PDF renderer subagent prompt:
Implement server-side card preview and PDF rendering for `827 x 438 px` cards at `300 PPI`.
Focus on Arabic font rendering, QR rendering, private PDF output, and A4 packing.
Return renderer assumptions, test artifacts, and proof of dimensions.

Frontend admin subagent prompt:
Implement the admin e-booklet access-code printing UI for templates, presets, generation, preview, batches, and PDF download.
Do not modify backend behavior.
Match existing admin e-booklet UI patterns.
Return screenshots or browser verification notes.

Frontend redemption subagent prompt:
Implement login-required QR redemption, prefill confirmation, and explicit redeem action.
Do not modify admin UI.
Preserve Arabic and LTR code rendering.
Return route changes, tests run, and screenshots.

QA subagent prompt:
Create and run the focused test matrix for access-code print batches.
Prioritize seat behavior, QR tamper protection, required fields, code normalization, PDF download permission, and login redirect.
Return failing tests first, then passing verification after fixes.

Security review subagent prompt:
Review the implementation for signed QR tampering, private asset leakage, permission gaps, audit gaps, and immutable snapshot bypasses.
Return findings ordered by severity with file and line references.

## 20. Recommended First Coding Slice
Start with Phase 0 and Phase 1 only.
Do not build UI before the schema and backend contracts are stable.
The first mergeable slice should contain migrations, model types, service skeletons, and focused tests for template deletion and batch snapshot creation.
The second slice should add batch generation without PDF rendering.
The third slice should add PDF rendering and private PDF download.
The fourth slice should add admin UI.
The fifth slice should add redemption UI and full E2E.
