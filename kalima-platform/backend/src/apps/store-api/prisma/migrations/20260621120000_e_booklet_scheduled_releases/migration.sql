ALTER TABLE "e_booklet_templates"
  ADD COLUMN IF NOT EXISTS "release_at" TIMESTAMPTZ(6);
