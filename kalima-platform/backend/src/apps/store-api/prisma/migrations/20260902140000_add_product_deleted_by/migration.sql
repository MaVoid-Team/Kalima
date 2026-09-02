-- Track which user performed a product soft-delete, so incidents like
-- accidental/unexplained deletions can be traced without digging through
-- session timestamps.

ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "deleted_by" INTEGER;

DO $$
BEGIN
  ALTER TABLE "products"
  ADD CONSTRAINT "products_deleted_by_fkey"
  FOREIGN KEY ("deleted_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
