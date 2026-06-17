# E-booklet admin editor full browser proof handoff

## Scope
Validate the admin e-booklet editor end-to-end in the browser: PDF-only original file upload, cover/original metadata, all hotspot types/shapes/content blocks, publish/review state.

## Changes made
- `backend/src/apps/store-api/prisma/schema.prisma`
  - Added `file` to `e_booklet_file_type_enum`.
- `backend/src/apps/store-api/prisma/migrations/20260610170000_e_booklet_file_asset_file_type/migration.sql`
  - Adds enum value `file` to `e_booklet_file_type_enum`.
- `backend/src/apps/store-api/generated/prisma/enums.ts`
  - Regenerated Prisma client enum includes `file`.
- `backend/src/apps/store-api/generated/prisma/internal/class.ts`
  - Regenerated inline schema includes `file`.

## Why
Browser proof found that admin hotspot media upload for generic file attachments returned 500 because the service/middleware accepted `file_type=file`, tests expected it, but the Prisma schema/generated client/database enum only allowed `pdf|image|video|audio|doc|docx`.

## Browser proof performed
Using local app:
- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5001`
- Admin login succeeded.
- Created template `E2E Full Admin Editor Proof 1781110701528` (`template_id=2`, `version_id=2`).
- Uploaded original PDF `editor-proof.pdf`.
- Confirmed DOCX rejected on original document upload endpoint with status 400 / PDF-only validation.
- Uploaded cover image.
- Uploaded hotspot media: image, audio, video, generic file/text attachment.
- Created eight hotspots on page 1:
  - #101 text / circle
  - #102 image / rectangle / image auto-expand true
  - #103 audio / square / autoplay true
  - #104 uploaded video / triangle
  - #105 YouTube video / oval
  - #106 file upload / rectangle
  - #107 link URL / circle
  - #108 Q&A / square
- Published version: status active.
- Browser editor proof:
  - Original File step displayed `editor-proof.pdf`, `DETECTED PDF`, `1 pages`, `612 x 792 pt`.
  - Hotspots step displayed markers 101-108 and all-hotspots list with all eight entries.
  - Review step displayed `CURRENT PAGE HOTSPOTS 8`, document asset 6, cover asset 7, version 1, status Active.
  - Browser performance resource API errors list was empty on editor steps.

## Verification already run
- `npm test -- --runInBand tests/e-booklet` from backend: PASS, 67/67.
- `npm run build` from backend: PASS.
- `npm run build` from frontend: PASS, with existing Vite chunk-size warnings and crypto externalization warning.

## Caveat
Attempting `prisma migrate deploy` against the existing local DB was blocked by an earlier migration already manually applied but not recorded: `20260610120000_e_booklet_invite_passcode_ciphertext` column already exists. For the local browser proof, the enum value was applied directly with `ALTER TYPE kalima.e_booklet_file_type_enum ADD VALUE IF NOT EXISTS 'file'`. The new migration should be reviewed for clean DB correctness.

## Requested review
Inspect every changed/created file line-by-line. Return verdict `APPROVED` or `REQUIRED_FIXES`. Focus on whether adding the generic `file` enum is the right fix for admin file hotspot upload and whether generated Prisma files/migration are sufficient and safe.
