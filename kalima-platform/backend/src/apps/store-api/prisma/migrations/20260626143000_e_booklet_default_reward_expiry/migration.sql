ALTER TABLE "e_booklet_global_settings"
ADD COLUMN IF NOT EXISTS "default_reward_expiry_days" INTEGER NOT NULL DEFAULT 120;

ALTER TABLE "e_booklet_global_settings"
DROP CONSTRAINT IF EXISTS "ck_e_booklet_global_settings_default_reward_expiry_days";

ALTER TABLE "e_booklet_global_settings"
ADD CONSTRAINT "ck_e_booklet_global_settings_default_reward_expiry_days"
CHECK ("default_reward_expiry_days" > 0);
