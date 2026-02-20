-- CreateEnum
CREATE TYPE "image_mime_type_enum" AS ENUM ('jpeg', 'png', 'webp', 'gif', 'svg', 'avif');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "gallery",
DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnail_id" INTEGER;

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" "image_mime_type_enum" NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_gallery" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    "sort_order" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_gallery_product_id_image_id_key" ON "product_gallery"("product_id", "image_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_gallery" ADD CONSTRAINT "product_gallery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_gallery" ADD CONSTRAINT "product_gallery_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
