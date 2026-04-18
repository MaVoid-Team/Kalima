-- Sample Sections and Enhanced Samples
-- 1. Create sample_media_type_enum
CREATE TYPE "sample_media_type_enum" AS ENUM ('pdf', 'image', 'video', 'word', 'powerpoint');

-- 2. Create sample_sections table
CREATE TABLE "sample_sections" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnail_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "sample_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ix_sample_sections_sort_order" ON "sample_sections"("sort_order");

-- 3. Insert default section for existing samples (if any exist)
INSERT INTO "sample_sections" ("title", "description", "sort_order", "active", "created_at", "updated_at")
SELECT 'Legacy', 'Migrated samples from pre-section schema', 0, true, NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM "samples" LIMIT 1);

-- 4. Add new columns to samples (nullable first for migration)
ALTER TABLE "samples" ADD COLUMN "section_id" INTEGER;
ALTER TABLE "samples" ADD COLUMN "media_type" "sample_media_type_enum";
ALTER TABLE "samples" ADD COLUMN "high_quality_url" VARCHAR(255);
ALTER TABLE "samples" ADD COLUMN "low_quality_url" VARCHAR(255);
ALTER TABLE "samples" ADD COLUMN "updated_at" TIMESTAMP(6);

-- 5. Migrate existing data: set section_id, media_type, high_quality_url from url
UPDATE "samples" s
SET
    "section_id" = (SELECT id FROM "sample_sections" ORDER BY id LIMIT 1),
    "media_type" = 'pdf',
    "high_quality_url" = s."url",
    "updated_at" = NOW();

-- 6. Drop unique constraint on product_id (enables multiple samples per product)
ALTER TABLE "samples" DROP CONSTRAINT IF EXISTS "samples_product_id_key";

-- 7. Make section_id and media_type NOT NULL
ALTER TABLE "samples" ALTER COLUMN "section_id" SET NOT NULL;
ALTER TABLE "samples" ALTER COLUMN "media_type" SET NOT NULL;

-- 8. Drop old url column
ALTER TABLE "samples" DROP COLUMN "url";

-- 9. Add FK for section_id
ALTER TABLE "samples" ADD CONSTRAINT "samples_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sample_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 10. Create indexes on samples
CREATE INDEX "ix_samples_section_id" ON "samples"("section_id");
CREATE INDEX "ix_samples_product_id" ON "samples"("product_id");
CREATE INDEX "ix_samples_section_product" ON "samples"("section_id", "product_id");
