ALTER TABLE "e_booklet_purchases"
  ADD COLUMN "wallet_credit_applied" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "final_payable_price" DECIMAL(10, 2);

UPDATE "e_booklet_purchases"
SET "final_payable_price" = "price"
WHERE "final_payable_price" IS NULL;
