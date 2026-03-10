-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "release_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_products_release_at" ON "products"("release_at");
