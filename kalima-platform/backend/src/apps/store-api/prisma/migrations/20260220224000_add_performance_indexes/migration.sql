-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_carts_user_status" ON "carts"("user_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cart_items_cart_id" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cart_items_cart_product_deleted" ON "cart_items"("cart_id", "product_id", "deleted_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_cart_item_required_fields_cart_item" ON "cart_item_required_fields"("cart_item_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_product_required_fields_product_active" ON "product_required_fields"("product_id", "is_required", "active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_products_deleted_at" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_purchases_user_id" ON "purchases"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_purchases_status" ON "purchases"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_purchases_created_at" ON "purchases"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_purchases_serial" ON "purchases"("purchase_serial");
