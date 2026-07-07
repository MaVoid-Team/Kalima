# E-Booklet Access Code Print Batches Spec

## 1. Purpose
Kalima needs to copy the useful behavior from Fekra promo-code generation into the e-booklet access-code area.
The Kalima version must not become a generic promo-code feature.
It must generate e-booklet access codes for a teacher-owned e-booklet instance and create a printable PDF batch of physical student cards.
Each printed card represents one student access-code redemption.
The feature belongs in the admin e-booklet section for v1.

## 2. Current Codebase Facts
The current Kalima access-code service is `kalima-platform/backend/src/apps/store-api/services/e-booklet-access-code.service.ts`.
The current code format is `KLM-` plus 12 uppercase hex characters.
The current code example shape is `KLM-A1B2C3D4E5F6`.
The current service already has access-code kind, count, expiration, max redemption, terms, and seat-limit related behavior.
The current printable feature must use the existing e-booklet access-code model as its source of truth.
The current Fekra feature is useful as a UX and template reference, but Kalima must not copy browser-only PDF generation as the final architecture.

## 3. Scope
The v1 scope includes access-code generation from admin e-booklets.
The v1 scope includes template-based card design with fixed physical dimensions.
The v1 scope includes server-side PDF generation and private file storage.
The v1 scope includes saved batch metadata and exact historical batch snapshots.
The v1 scope includes QR redemption URLs that prefill the redemption flow after student login.
The v1 scope includes a backend-rendered sample preview before generating a full batch.
The v1 scope includes global print presets for registration methods and grade or class values.
The v1 scope does not include teacher self-service PDF downloads.
The v1 scope does not include Fekra data migration.
The v1 scope does not include PNG or JPG card export.
The v1 scope does not include template versioning.
The v1 scope does not include duplicate-template actions.
The v1 scope does not include batch-level bulk disabling.
The v1 scope does not include printing expiration dates on cards.

## 4. Actors
Admin and subadmin can create templates, presets, printable batches, and PDFs.
Teachers do not manage printable PDFs in v1.
Students scan printed cards and redeem after login.
Students must see enough confirmation data to verify the scanned card before redeeming.

## 5. Main User Flow
An admin opens the e-booklet admin section.
The admin opens the access-code generation or access-code printing area.
The admin selects a teacher-owned e-booklet instance.
The admin enters the number of codes to generate.
The admin chooses the existing access-code kind, with the default coming from current Kalima settings.
The admin optionally sets expiration.
The admin chooses whether to generate codes only or generate codes plus a printable PDF batch.
For printable batches, the admin selects a card template.
For printable batches, the admin enters a batch name.
For printable batches, the admin fills batch fields such as price text, teacher image, registration method, grade or class, and red custom text.
For printable batches, the admin previews a backend-rendered sample card.
The admin generates the batch.
The backend creates access codes, signed QR references, PDF metadata, and a private PDF file asset.
The admin downloads one PDF for the whole batch.

## 6. Card Dimensions
Each printed card has a constant source design size of `827 x 438 px`.
The source design is interpreted at `300 PPI`.
The physical card size is approximately `70.02 x 37.08 mm`.
The PDF must print cards at true 300 PPI physical size.
The PDF must not scale cards up to larger handout size.
The recommended A4 layout is landscape orientation.
The recommended A4 grid is 3 columns by 4 rows when margins and spacing permit.
The renderer must preserve the card aspect ratio exactly.
The renderer must fail generation if the template image does not match the required source dimensions unless an explicit future crop or fit mode is added.

## 7. Printable Card Fields
The QR field is required.
The human-readable code field is required.
The teacher image field is optional by default.
The price field is optional plain text.
The registration method field is controlled by presets with optional batch override.
The grade or class field is controlled by presets with free-text override.
The red custom text field is free text per batch.
The template defines default required or optional settings for fields.
The batch can override field required or optional settings.
Generation must block if a field is marked required and no value is provided.

## 8. Field Mapping From The Screenshot
The price box maps to optional plain price text in black.
The teacher image box maps to an optional uploaded teacher image supplied by the code generator.
The registration method box maps to a controlled preset or text override.
The grade or class box maps to a preset or free-text override.
The QR box maps to the unique QR for each access code.
The separate code number box maps to the same access code string used for manual entry.
The red text box maps to free red custom copy per batch.
There is no school or center field in v1.
All fields except the red custom text can be filled from the generator and template configuration.
The red custom text remains intentionally free and manually controlled per batch.

## 9. Teacher Image Rule
The teacher image must not be pulled from the teacher profile.
The teacher image is uploaded only inside the access-code generator for that batch.
The teacher image is optional.
The teacher image is stored as a private e-booklet file asset.
The teacher image is included in the immutable batch snapshot.
The confirmation screen may show the teacher image if the batch provided one.

## 10. Template System
Templates are image-template based.
A template has one uploaded background image with required dimensions of `827 x 438 px`.
A template has positioned fields drawn on top of the image.
The editor supports visual drag and resize controls.
The editor also exposes numeric X, Y, width, and height inputs for precision.
The QR size is fixed by the template placement box.
The batch cannot independently resize QR codes.
The editor supports per-field text direction and alignment controls.
Text fields need RTL support for Arabic.
Code fields need LTR isolation and alignment support.
Templates can be archived or deactivated.
Template deletion is blocked once a generated batch has used the template.
Template editing remains allowed after use.
Generated batches snapshot the exact template data used at generation time, so later template edits only affect future batches.
Template versioning is not needed for v1.
Duplicate-template action is not needed for v1.

## 11. Presets
Registration method is an advanced controlled preset field.
Admins can create and edit global registration-method presets.
Each registration-method preset stores Arabic display text for printing.
A batch can override the displayed registration-method text if needed.
Grade or class uses controlled presets plus free-text override.
Grade or class presets are global admin settings.
Registration method presets and grade or class presets live in one access-code print presets settings area.
The settings area separates preset types.
The printed card content is Arabic-only for v1.

## 12. Batch Model
A generated print batch needs a human label.
The batch list shows label, teacher, e-booklet, template, count, created date, and status summary.
The batch stores snapshot values used at generation time.
The batch stores a snapshot of template image reference, field positions, dimensions, required settings, and batch input values.
The batch stores a private PDF file asset reference.
The batch stores enough rendering metadata to regenerate the PDF if needed.
The batch is immutable after generation.
Immutable means batch template snapshot, values, image, code list, and generated PDF metadata cannot be edited.
Edits require creating a new batch.
The admin can download the generated PDF.
The admin can regenerate from stored metadata if the stored PDF is missing or a future admin action requires it.
The batch list must show historical snapshot values, not current mutable template values.

## 13. Code Generation Rules
Printable batches generate one unique access code per card.
One printed code equals one student.
Each printed code is single-use for successful redemption.
Generation checks that the requested number of codes is less than or equal to the remaining seats at generation time.
Generation does not reserve seats.
Seats are consumed only when a student successfully redeems.
Redemption re-checks available seats at redemption time.
If seats are exhausted at redemption time, the redemption fails gracefully.
If a redemption fails due to seat exhaustion, the code remains active for retry if seats are later increased.
The admin UI warns that printed codes do not reserve seats and may fail if seats are exhausted later.
The batch status warns when remaining seats drop below unused active codes.
The existing e-booklet terms acceptance requirement still applies before code generation.
The existing access-code kind selection remains available.
The default access-code kind comes from current Kalima settings.
The existing optional access-code expiration remains available.
The expiration is enforced by backend rules.
The expiration is visible in admin batch or code lists.
The expiration is not printed on the card in v1.

## 14. Code Display And Manual Entry
The stored code remains in the existing secure Kalima format unless code inspection proves it is too long for the card.
The printed display can visually group the code for readability.
A readable display example is `KLM A1B2 C3D4 E5F6`.
Manual entry must normalize spaces and hyphens.
Manual entry must accept the stored form and the grouped printed form.
Mixed Arabic and LTR code strings must use direction isolation to avoid bidi rendering bugs.

## 15. QR And Redemption URL
Each card has a unique QR code.
Each QR represents one access code.
The QR URL is signed.
The QR URL uses an opaque reference token rather than raw teacher, booklet, class, or Arabic text query parameters.
The frontend asks the backend for prefill data after authentication.
The signed QR reference remains valid as long as the access code is active and unredeemed.
The QR reference does not have a separate expiry unless the access code expires.
The QR must prefill the access code and related display data after login.
The QR must not allow tampering with teacher, booklet, grade, class, or batch metadata.

## 16. Student Redemption Flow
Students must log in before redeeming.
If the student scans while unauthenticated, Kalima redirects to login.
After login, Kalima returns the student to the same prefilled redemption flow.
The student sees a confirmation screen before redemption.
The confirmation screen shows teacher, e-booklet, grade or class, and code.
The confirmation screen shows the teacher image if the batch provided one.
The confirmation screen does not show the printed optional price text.
Redemption does not happen automatically after scan.
The student must explicitly confirm redemption.
If the student is logged into the wrong account, the confirmation screen gives them a chance to stop.

## 17. PDF Generation
PDF generation is server-side.
Browser-side PDF generation from Fekra must not be copied as the final Kalima implementation.
The frontend can preview and edit layout.
The backend owns final rendering, PDF creation, storage, and download.
The backend stores the generated PDF as a private file asset.
The backend also stores metadata needed to regenerate.
The backend-rendered sample preview uses the same renderer as final PDF generation.
The preview renders one sample card using placeholder code and QR data before the batch is generated.
The full batch export is one PDF file.
There is no per-card PNG or JPG export in v1.

## 18. File Storage
Template background images are private e-booklet file assets.
Teacher images uploaded for print batches are private e-booklet file assets.
Generated PDFs are private e-booklet file assets.
The download endpoint enforces admin permissions.
Private assets must not be exposed as globally public URLs.

## 19. Suggested Data Model
Add `e_booklet_access_code_print_templates`.
This table stores template name, status, background file asset id, width px, height px, ppi, field layout JSON, default required fields JSON, created by, updated by, created at, and updated at.
Add `e_booklet_access_code_print_presets`.
This table stores preset type, label, Arabic display text, sort order, active flag, created by, updated by, created at, and updated at.
Add `e_booklet_access_code_print_batches`.
This table stores batch label, teacher id, booklet instance id, template id, term id, access-code kind, count, expires at, teacher image file asset id, PDF file asset id, snapshot JSON, status, created by, created at, and generated at.
Add `e_booklet_access_code_print_batch_codes`.
This table links batch id to access-code id and stores card index, signed QR reference hash or token id, and created at.
The access-code table remains the entitlement source of truth.
The print batch tables provide print history, PDF storage, and QR prefill metadata.
If the existing file asset enum needs extension, add explicit print-template, print-teacher-image, and print-pdf file types.

## 20. Suggested Backend APIs
`GET /admin/e-booklet-access-code-print/templates` lists templates.
`POST /admin/e-booklet-access-code-print/templates` creates a template.
`PATCH /admin/e-booklet-access-code-print/templates/:id` updates editable template fields.
`POST /admin/e-booklet-access-code-print/templates/:id/archive` archives a template.
`DELETE /admin/e-booklet-access-code-print/templates/:id` deletes only if no batch has used it.
`GET /admin/e-booklet-access-code-print/presets` lists presets by type.
`POST /admin/e-booklet-access-code-print/presets` creates a preset.
`PATCH /admin/e-booklet-access-code-print/presets/:id` updates a preset.
`POST /admin/e-booklet-access-code-print/preview` returns a backend-rendered sample card preview.
`POST /admin/e-booklet-access-code-print/batches` generates codes and a PDF batch.
`GET /admin/e-booklet-access-code-print/batches` lists batches.
`GET /admin/e-booklet-access-code-print/batches/:id` shows batch detail with snapshot values.
`GET /admin/e-booklet-access-code-print/batches/:id/pdf` downloads the stored private PDF.
`POST /admin/e-booklet-access-code-print/batches/:id/regenerate-pdf` regenerates from snapshot metadata if allowed.
`GET /e-booklet-access-code-redemption/qr/:signedRef` validates the signed reference after login and returns prefill data.
`POST /e-booklet-access-code-redemption/qr/:signedRef/redeem` redeems after confirmation.

## 21. Suggested Admin UI
Add an access-code printing area inside admin e-booklets.
The area should include tabs or subviews for generate, batches, templates, and presets.
The generate view selects teacher-owned e-booklet instance first.
The generate view supports codes-only and codes-plus-printable-PDF actions.
The printable path shows template choice, batch label, count, kind, expiration, teacher image upload, price text, registration method, grade or class, red custom text, and required-field settings.
The printable path shows the seat warning before generation.
The printable path shows a backend-rendered sample preview.
The template editor shows the card image at the correct aspect ratio.
The template editor lets admins drag and resize field boxes.
The template editor exposes numeric precision inputs.
The template editor controls field direction, alignment, color, font size, and visibility where needed.
The batch detail view shows the exact snapshot used to generate the batch.
The batch detail view includes PDF download.

## 22. Validation Rules
Template image dimensions must be `827 x 438 px`.
Template PPI must be treated as `300`.
QR and code fields must exist in the template layout.
Requested count must satisfy existing max bulk limits.
Requested count must be less than or equal to remaining seats at generation time.
Generation must re-use existing terms checks.
Generation must require all fields marked required for the batch.
Teacher image must be accepted only when uploaded in the generator.
Teacher profile images must not be auto-filled.
PDF generation must fail atomically if codes cannot be generated or PDF cannot be rendered.
If codes are created but PDF generation fails, the backend must either roll back the transaction or mark the batch failed and prevent accidental distribution.
The safer v1 recommendation is transactional creation where practical, with no active batch if PDF generation fails.

## 23. Audit And Observability
Audit template create, update, archive, and delete attempts.
Audit preset create and update.
Audit printable batch generation.
Audit PDF download.
Audit QR prefill validation.
Audit successful redemption.
Audit failed redemption due to expired code, used code, disabled code, missing seats, or invalid signature.
Do not log raw secrets or unsigned token material.
Store enough metadata to support admin investigations without exposing credentials.

## 24. Tests
Add backend tests for template dimension validation.
Add backend tests for required-field enforcement.
Add backend tests for count versus remaining seats at generation time.
Add backend tests proving generation does not reserve seats.
Add backend tests proving redemption re-checks remaining seats.
Add backend tests proving seat-exhaustion failures do not burn the code.
Add backend tests for one printed code equals one successful student redemption.
Add backend tests for signed QR reference tamper rejection.
Add backend tests for code normalization with spaces and hyphens.
Add backend tests for batch snapshot immutability.
Add backend tests blocking deletion of used templates.
Add frontend or source tests for template editor field config persistence.
Add frontend tests for login redirect preserving the QR redemption return URL.
Add browser verification for backend-rendered preview and generated PDF download.
Add visual checks that Arabic text and LTR codes do not overlap or render in the wrong order.

## 25. Implementation Order
First add schema and migrations for templates, presets, batches, and batch-code links.
Second add backend services for template validation, preset management, batch snapshot creation, signed QR references, and PDF rendering.
Third add redemption preview and confirm endpoints that require login.
Fourth add admin UI for presets and templates.
Fifth add admin UI for printable generation and backend-rendered preview.
Sixth add batch list, batch detail, PDF download, and PDF regeneration.
Seventh add focused tests and browser verification.

## 26. Open Risks
Server-side rendering must support Arabic fonts reliably.
Server-side rendering must support image composition and QR generation with predictable physical sizing.
A4 printer margins vary, so the PDF should use a conservative grid and avoid edge-to-edge cards.
Because seats are not reserved, admins can print valid cards that later fail if capacity is exhausted.
The UI warning and batch status warning are mandatory because of that decision.
The existing dirty worktree must be reviewed before implementation so current e-booklet access-code changes are not overwritten.

## 27. Decision Log From The 67-Question Grilling Session
1. The feature must target a specific teacher-owned e-booklet instance, not just a teacher.
2. The QR opens a redemption flow with code and data prefilled.
3. There is no school or center field.
4. The teacher image comes only from the code generator, not from the teacher profile.
5. The PDF is template based.
6. The teacher image is optional.
7. The generated printable PDF data is saved with the batch.
8. The page supports codes-only and codes-plus-printable-PDF actions.
9. Each generated code produces one card, and the PDF packs multiple cards per page.
10. Each card has constant dimensions of `827 x 438 px` at `300 PPI`.
11. Cards print at true 300 PPI physical size.
12. The QR URL is signed.
13. Each card has a unique signed redemption URL.
14. One printed code equals one student.
15. Generation is capped by remaining seats at generation time.
16. The private class or grade field is stored per batch.
17. Registration method must be advanced, controlled by presets with override.
18. Print-field presets are global admin settings with per-batch override.
19. Grade or class was first considered free text, then reversed to controlled presets plus free-text override.
20. Price is plain optional text.
21. Registration method presets and grade or class presets live in one access-code print presets settings area.
22. The template editor is visual drag and resize with numeric precision inputs.
23. QR size is fixed by the template placement box.
24. The human-readable code uses the same access code string as the QR flow.
25. Kalima keeps the current secure access-code format unless it proves too long.
26. The printed code can be visually grouped, and manual entry accepts spaces or hyphens.
27. Batches need a human name or label.
28. Batch-level disable of unused codes is not needed for v1.
29. Export is one PDF for the whole batch only.
30. PDF generation is server-side.
31. Template image, teacher image, and generated PDF are private e-booklet file assets.
32. The generated PDF is stored as a private file asset and can be regenerated from metadata.
33. Students must log in before redeeming.
34. After login, students land on a confirmation screen rather than auto-redeeming.
35. The confirmation screen does not show optional price text.
36. The confirmation screen shows the teacher image if provided.
37. Print batches are admin-only in v1.
38. Card text is Arabic-only for v1.
39. The visual editor supports RTL controls per field.
40. The required system fields are QR, code number, teacher image, price text, registration method, grade or class, and red custom text.
41. Red custom text is free text per batch.
42. The template defines default required fields, and the batch can override them.
43. Generation blocks if a required field is empty.
44. Admins can preview one sample card before generating the full batch.
45. Preview uses the same backend renderer as final PDF generation.
46. Kalima copies Fekra UI concepts but not browser-side PDF generation as the final implementation.
47. The QR URL includes an opaque signed reference and not raw Arabic or metadata query params.
48. Generated batches are immutable after generation.
49. Template deletion is blocked if a generated batch uses it.
50. Template versioning is not needed for v1.
51. Templates are archivable or deactivatable, with deletion blocked once used.
52. Used templates are not fully edit-blocked.
53. Duplicate-template action is not needed for v1.
54. Template deletion remains blocked once used, even if editing remains allowed.
55. Batch lists show snapshot values from generation time.
56. Seats are consumed only when redeemed, not when codes are generated.
57. If seats are gone at redemption time, redemption fails gracefully.
58. Batch status warns when remaining seats drop below unused active codes.
59. Failed redemption due to seat exhaustion leaves the code active.
60. Admin UI warns that codes do not reserve seats.
61. Printable generation reuses the existing terms acceptance requirement.
62. The QR redemption reference remains valid as long as the access code is active and unredeemed.
63. Access-code expiration remains supported at batch generation time.
64. Expiration is not printed on the card in v1.
65. Paid or free access-code kind selection remains available.
66. The printable template editor lives inside the existing admin e-booklet section.
67. Existing Fekra templates are not migrated; Kalima only builds the upload and generation capability.

## 28. Recommended Acceptance Criteria
An admin can create a print template with an `827 x 438 px` background image.
An admin can place QR, code, teacher image, price, registration method, grade or class, and red custom text fields visually.
An admin can create global presets for registration method and grade or class.
An admin can generate a codes-only batch without PDF fields.
An admin can generate a printable PDF batch for a selected teacher-owned e-booklet instance.
The backend rejects generation when required batch fields are empty.
The backend rejects generation when requested count exceeds remaining seats at generation time.
The backend does not reserve seats during generation.
A generated PDF prints cards at true 300 PPI size.
Each card has a unique QR and unique code.
A student must log in before redemption.
After login, a student sees a confirmation screen before redeeming.
A successful redemption consumes one code and one seat.
Seat exhaustion at redemption time fails gracefully without burning the code.
The batch detail can download the stored private PDF.
The batch detail shows historical snapshot values, not current edited template values.
