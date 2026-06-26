ALTER TABLE "e_booklet_global_settings"
  ADD COLUMN IF NOT EXISTS "preview_page_limit" INTEGER NOT NULL DEFAULT 10;

UPDATE "e_booklet_global_settings"
SET "preview_page_limit" = 10
WHERE "preview_page_limit" IS NULL;
