-- Add coupon applicability scopes while preserving existing product-scoped coupons.
CREATE TYPE "coupon_applicability_scope" AS ENUM ('product', 'category');

ALTER TABLE "coupons"
  ADD COLUMN "category_id" INTEGER,
  ADD COLUMN "applicability_scope" "coupon_applicability_scope" NOT NULL DEFAULT 'product',
  ALTER COLUMN "product_id" DROP NOT NULL;

ALTER TABLE "coupons"
  ADD CONSTRAINT "coupons_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "coupons"
  ADD CONSTRAINT "coupons_applicability_scope_check"
  CHECK (
    ("applicability_scope" = 'product' AND "product_id" IS NOT NULL AND "category_id" IS NULL)
    OR
    ("applicability_scope" = 'category' AND "category_id" IS NOT NULL AND "product_id" IS NULL)
  );

CREATE INDEX "coupons_category_id_idx" ON "coupons"("category_id");
