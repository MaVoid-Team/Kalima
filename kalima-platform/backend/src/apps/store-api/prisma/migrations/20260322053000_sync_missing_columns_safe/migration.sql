-- Safe catch-up migration to align DB tables with current Prisma schema.
-- This migration is additive only (ADD COLUMN / ADD FK) and does not drop data.

-- users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(6);
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- coupons
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "perks" TEXT;

-- carts
ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- cart_items
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- purchases
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- purchase_items
ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "final_price" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1;
ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "coupon_id" INTEGER;
ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- payment_methods
ALTER TABLE "payment_methods" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;

-- Add missing FK for purchase_items.coupon_id -> coupons.id (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'purchase_items_coupon_id_fkey'
  ) THEN
    ALTER TABLE "purchase_items"
      ADD CONSTRAINT "purchase_items_coupon_id_fkey"
      FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END
$$;
