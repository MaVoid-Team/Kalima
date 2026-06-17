ALTER TABLE "e_booklet_purchases"
  ADD COLUMN IF NOT EXISTS "payment_screenshot_id" INTEGER;

CREATE INDEX IF NOT EXISTS "ix_e_booklet_purchases_payment_screenshot"
  ON "e_booklet_purchases"("payment_screenshot_id");

ALTER TABLE "e_booklet_purchases"
  DROP CONSTRAINT IF EXISTS "e_booklet_purchases_payment_screenshot_id_fkey";

ALTER TABLE "e_booklet_purchases"
  ADD CONSTRAINT "e_booklet_purchases_payment_screenshot_id_fkey"
  FOREIGN KEY ("payment_screenshot_id") REFERENCES "images"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
