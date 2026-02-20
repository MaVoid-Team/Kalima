-- Add status transition tracking columns to purchases
ALTER TABLE "purchases" ADD COLUMN "received_at" TIMESTAMP(6);
ALTER TABLE "purchases" ADD COLUMN "received_by" INTEGER;
ALTER TABLE "purchases" ADD COLUMN "confirmed_at" TIMESTAMP(6);
ALTER TABLE "purchases" ADD COLUMN "confirmed_by" INTEGER;
ALTER TABLE "purchases" ADD COLUMN "returned_at" TIMESTAMP(6);
ALTER TABLE "purchases" ADD COLUMN "returned_by" INTEGER;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_returned_by_fkey" FOREIGN KEY ("returned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
