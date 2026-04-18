-- Account Review Settings
-- 1. Create account_review_settings table
CREATE TABLE "account_review_settings" (
    "id" SERIAL NOT NULL,
    "role" "role_enum" NOT NULL,
    "requires_review" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6),
    "updated_by" INTEGER,

    CONSTRAINT "account_review_settings_pkey" PRIMARY KEY ("id")
);

-- 2. Unique constraint on role
CREATE UNIQUE INDEX "account_review_settings_role_key" ON "account_review_settings"("role");

-- 3. Add FK for updated_by
ALTER TABLE "account_review_settings" ADD CONSTRAINT "account_review_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
