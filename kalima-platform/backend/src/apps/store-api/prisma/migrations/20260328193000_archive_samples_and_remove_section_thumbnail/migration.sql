-- Manual migration for recent sample/product schema updates.
-- Includes IF EXISTS / IF NOT EXISTS so it is safe on environments already synced via db push.

-- 1) Remove sample section thumbnail column.
ALTER TABLE "sample_sections"
DROP COLUMN IF EXISTS "thumbnail_url";

-- 2) Add sample archive flag (default false).
ALTER TABLE "samples"
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN DEFAULT false;

-- Backfill nulls for older rows to keep behavior consistent.
UPDATE "samples"
SET "is_archived" = false
WHERE "is_archived" IS NULL;
