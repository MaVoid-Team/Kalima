-- Product-Coupon Relation Inversion
-- 1. Add product_id to coupons as nullable
ALTER TABLE "coupons" ADD COLUMN "product_id" INTEGER;

-- 2. Data migration: For each product with coupon_id, set coupon.product_id = product.id
--    If multiple products share the same coupon, assign to the product with lowest id (Option A)
UPDATE "coupons" c
SET "product_id" = (
  SELECT p."id"
  FROM "products" p
  WHERE p."coupon_id" = c."id"
    AND p."deleted_at" IS NULL
  ORDER BY p."id" ASC
  LIMIT 1
);

-- 3. Handle orphan coupons (no product linked): clean up references and delete
DELETE FROM "coupon_usages" WHERE "coupon_id" IN (SELECT "id" FROM "coupons" WHERE "product_id" IS NULL);
UPDATE "cart_items" SET "coupon_id" = NULL WHERE "coupon_id" IN (SELECT "id" FROM "coupons" WHERE "product_id" IS NULL);
DELETE FROM "coupons" WHERE "product_id" IS NULL;

-- 4. Make product_id NOT NULL
ALTER TABLE "coupons" ALTER COLUMN "product_id" SET NOT NULL;

-- 5. Drop products.coupon_id FK and column
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_coupon_id_fkey";
ALTER TABLE "products" DROP COLUMN IF EXISTS "coupon_id";

-- 6. Add FK constraint from coupons to products
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 7. Create index on product_id for efficient lookups
CREATE INDEX "coupons_product_id_idx" ON "coupons"("product_id");
