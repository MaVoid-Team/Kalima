-- Product Gallery Videos
-- 1. Create video_source_type_enum
CREATE TYPE "video_source_type_enum" AS ENUM ('upload', 'external');

-- 2. Create product_gallery_videos table
CREATE TABLE "product_gallery_videos" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "source_type" "video_source_type_enum" NOT NULL,
    "original_name" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "size" INTEGER,
    "sort_order" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "product_gallery_videos_pkey" PRIMARY KEY ("id")
);

-- 3. Add FK and indexes
ALTER TABLE "product_gallery_videos" ADD CONSTRAINT "product_gallery_videos_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX "ix_product_gallery_videos_product_id" ON "product_gallery_videos"("product_id");
CREATE INDEX "ix_product_gallery_videos_product_sort" ON "product_gallery_videos"("product_id", "sort_order");
