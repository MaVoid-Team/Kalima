CREATE TYPE "e_booklet_term_status_enum" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "e_booklet_access_code_kind_enum" AS ENUM ('paid', 'free');
CREATE TYPE "e_booklet_access_code_status_enum" AS ENUM ('active', 'redeemed', 'disabled', 'expired');
CREATE TYPE "teacher_wallet_ledger_type_enum" AS ENUM ('credit', 'debit', 'adjustment');
CREATE TYPE "teacher_wallet_ledger_source_enum" AS ENUM ('milestone_reward', 'order_spend', 'admin_adjustment', 'refund');
CREATE TYPE "e_booklet_teacher_terms_acceptance_type_enum" AS ENUM ('code_generation', 'reward_claim');

CREATE TABLE "e_booklet_terms" (
  "id" SERIAL PRIMARY KEY,
  "template_id" INTEGER,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "e_booklet_term_status_enum" NOT NULL DEFAULT 'draft',
  "active_guard" VARCHAR(64),
  "starts_at" TIMESTAMP(6) NOT NULL,
  "ends_at" TIMESTAMP(6),
  "code_generation_terms" TEXT,
  "reward_claim_terms" TEXT,
  "created_by" INTEGER NOT NULL,
  "updated_by" INTEGER,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_milestones" (
  "id" SERIAL PRIMARY KEY,
  "term_id" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "target_paid_redemptions" INTEGER NOT NULL,
  "milestone_price" DECIMAL(10,2) NOT NULL,
  "previous_price_snapshot" DECIMAL(10,2),
  "reward_amount_snapshot" DECIMAL(10,2),
  "notification_recipients" VARCHAR(50) NOT NULL DEFAULT 'admins',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_milestone_achievements" (
  "id" SERIAL PRIMARY KEY,
  "teacher_id" INTEGER NOT NULL,
  "term_id" INTEGER NOT NULL,
  "milestone_id" INTEGER NOT NULL,
  "paid_redemptions_snapshot" INTEGER NOT NULL,
  "previous_price_snapshot" DECIMAL(10,2) NOT NULL,
  "milestone_price_snapshot" DECIMAL(10,2) NOT NULL,
  "reward_amount" DECIMAL(10,2) NOT NULL,
  "achieved_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "reward_terms_accepted_at" TIMESTAMP(6),
  "claimed_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_teacher_terms_acceptances" (
  "id" SERIAL PRIMARY KEY,
  "teacher_id" INTEGER NOT NULL,
  "term_id" INTEGER NOT NULL,
  "acceptance_type" "e_booklet_teacher_terms_acceptance_type_enum" NOT NULL,
  "milestone_achievement_id" INTEGER,
  "terms_snapshot" TEXT,
  "terms_version" VARCHAR(50),
  "accepted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "ip_address" VARCHAR(64),
  "user_agent" TEXT
);

CREATE TABLE "teacher_wallets" (
  "id" SERIAL PRIMARY KEY,
  "teacher_id" INTEGER NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "teacher_wallet_ledger" (
  "id" SERIAL PRIMARY KEY,
  "wallet_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "type" "teacher_wallet_ledger_type_enum" NOT NULL,
  "source" "teacher_wallet_ledger_source_enum" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "balance_after" DECIMAL(12,2) NOT NULL,
  "milestone_achievement_id" INTEGER,
  "purchase_id" INTEGER,
  "e_booklet_purchase_id" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "e_booklet_access_codes" (
  "id" SERIAL PRIMARY KEY,
  "booklet_instance_id" INTEGER NOT NULL,
  "term_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "code_hash" VARCHAR(128) NOT NULL,
  "code_hint" VARCHAR(20),
  "kind" "e_booklet_access_code_kind_enum" NOT NULL,
  "status" "e_booklet_access_code_status_enum" NOT NULL DEFAULT 'active',
  "bound_student_id" INTEGER,
  "max_redemptions" INTEGER NOT NULL DEFAULT 1,
  "redeemed_count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(6),
  "disabled_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "e_booklet_access_code_redemptions" (
  "id" SERIAL PRIMARY KEY,
  "access_code_id" INTEGER NOT NULL,
  "booklet_instance_id" INTEGER NOT NULL,
  "student_id" INTEGER NOT NULL,
  "access_id" INTEGER,
  "purchase_id" INTEGER,
  "paid_redemption_guard" VARCHAR(64),
  "counted_for_progress" BOOLEAN NOT NULL DEFAULT false,
  "redeemed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "ip_address" VARCHAR(64),
  "user_agent" TEXT
);

ALTER TABLE "e_booklet_terms" ADD CONSTRAINT "ck_e_booklet_terms_date_window" CHECK ("ends_at" IS NULL OR "ends_at" > "starts_at");
ALTER TABLE "e_booklet_milestones" ADD CONSTRAINT "ck_e_booklet_milestones_positive_target" CHECK ("target_paid_redemptions" > 0);
ALTER TABLE "e_booklet_milestones" ADD CONSTRAINT "ck_e_booklet_milestones_money_bounds" CHECK ("milestone_price" >= 0 AND ("previous_price_snapshot" IS NULL OR "previous_price_snapshot" >= 0) AND ("reward_amount_snapshot" IS NOT NULL AND "reward_amount_snapshot" >= 0));
ALTER TABLE "e_booklet_milestones" ADD CONSTRAINT "ck_e_booklet_milestones_notification_recipients" CHECK ("notification_recipients" IN ('admins', 'teacher_and_admins'));
ALTER TABLE "e_booklet_milestone_achievements" ADD CONSTRAINT "ck_e_booklet_achievements_positive_reward" CHECK ("paid_redemptions_snapshot" >= 0 AND "previous_price_snapshot" >= 0 AND "milestone_price_snapshot" >= 0 AND "reward_amount" >= 0);
ALTER TABLE "teacher_wallets" ADD CONSTRAINT "ck_teacher_wallets_nonnegative_balance" CHECK ("balance" >= 0);
ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "ck_teacher_wallet_ledger_nonnegative_balance_after" CHECK ("balance_after" >= 0);
ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "ck_e_booklet_access_codes_positive_max_redemptions" CHECK ("max_redemptions" > 0);
ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "ck_e_booklet_access_codes_nonnegative_redeemed_count" CHECK ("redeemed_count" >= 0);

CREATE UNIQUE INDEX "ux_e_booklet_terms_one_active_global" ON "e_booklet_terms"((true)) WHERE "status" = 'active' AND "template_id" IS NULL;
CREATE UNIQUE INDEX "ux_e_booklet_terms_one_active_per_template" ON "e_booklet_terms"("template_id") WHERE "status" = 'active' AND "template_id" IS NOT NULL;
CREATE INDEX "ix_e_booklet_terms_status_dates" ON "e_booklet_terms"("status", "starts_at", "ends_at");
CREATE INDEX "ix_e_booklet_terms_template_status" ON "e_booklet_terms"("template_id", "status");

CREATE UNIQUE INDEX "e_booklet_milestones_term_id_target_paid_redemptions_key" ON "e_booklet_milestones"("term_id", "target_paid_redemptions");
CREATE INDEX "ix_e_booklet_milestones_term_sort" ON "e_booklet_milestones"("term_id", "sort_order");
CREATE INDEX "ix_e_booklet_milestones_term_active" ON "e_booklet_milestones"("term_id", "active");

CREATE UNIQUE INDEX "e_booklet_milestone_achievements_teacher_id_term_id_milestone_id_key" ON "e_booklet_milestone_achievements"("teacher_id", "term_id", "milestone_id");
CREATE INDEX "ix_e_booklet_achievements_teacher_term" ON "e_booklet_milestone_achievements"("teacher_id", "term_id", "achieved_at");
CREATE INDEX "ix_e_booklet_achievements_claimed" ON "e_booklet_milestone_achievements"("claimed_at");

CREATE UNIQUE INDEX "ux_e_booklet_code_generation_terms_acceptance" ON "e_booklet_teacher_terms_acceptances"("teacher_id", "term_id", "acceptance_type") WHERE "acceptance_type" = 'code_generation' AND "milestone_achievement_id" IS NULL;
CREATE UNIQUE INDEX "ux_e_booklet_reward_claim_terms_acceptance" ON "e_booklet_teacher_terms_acceptances"("teacher_id", "term_id", "acceptance_type", "milestone_achievement_id") WHERE "acceptance_type" = 'reward_claim' AND "milestone_achievement_id" IS NOT NULL;
CREATE INDEX "ix_e_booklet_terms_accept_teacher_term_type" ON "e_booklet_teacher_terms_acceptances"("teacher_id", "term_id", "acceptance_type");
CREATE INDEX "ix_e_booklet_terms_accept_achievement" ON "e_booklet_teacher_terms_acceptances"("milestone_achievement_id");

CREATE UNIQUE INDEX "teacher_wallets_teacher_id_key" ON "teacher_wallets"("teacher_id");
CREATE INDEX "ix_teacher_wallets_teacher" ON "teacher_wallets"("teacher_id");

CREATE INDEX "ix_teacher_wallet_ledger_wallet_created" ON "teacher_wallet_ledger"("wallet_id", "created_at");
CREATE INDEX "ix_teacher_wallet_ledger_teacher_created" ON "teacher_wallet_ledger"("teacher_id", "created_at");
CREATE INDEX "ix_teacher_wallet_ledger_source_created" ON "teacher_wallet_ledger"("source", "created_at");
CREATE INDEX "ix_teacher_wallet_ledger_achievement" ON "teacher_wallet_ledger"("milestone_achievement_id");
CREATE INDEX "ix_teacher_wallet_ledger_purchase" ON "teacher_wallet_ledger"("purchase_id");
CREATE INDEX "ix_teacher_wallet_ledger_e_booklet_purchase" ON "teacher_wallet_ledger"("e_booklet_purchase_id");
CREATE UNIQUE INDEX "ux_teacher_wallet_ledger_one_milestone_reward_credit" ON "teacher_wallet_ledger"("milestone_achievement_id", "source", "type") WHERE "milestone_achievement_id" IS NOT NULL AND "source" = 'milestone_reward' AND "type" = 'credit';

CREATE UNIQUE INDEX "e_booklet_access_codes_code_hash_key" ON "e_booklet_access_codes"("code_hash");
CREATE INDEX "ix_e_booklet_access_codes_instance_status" ON "e_booklet_access_codes"("booklet_instance_id", "status");
CREATE INDEX "ix_e_booklet_access_codes_teacher_status" ON "e_booklet_access_codes"("teacher_id", "status");
CREATE INDEX "ix_e_booklet_access_codes_term_kind_status" ON "e_booklet_access_codes"("term_id", "kind", "status");
CREATE INDEX "ix_e_booklet_access_codes_bound_student" ON "e_booklet_access_codes"("bound_student_id");

CREATE UNIQUE INDEX "ux_e_booklet_paid_code_one_counted_redemption" ON "e_booklet_access_code_redemptions"("access_code_id") WHERE "counted_for_progress" = true;
CREATE UNIQUE INDEX "e_booklet_access_code_redemptions_access_code_id_student_id_key" ON "e_booklet_access_code_redemptions"("access_code_id", "student_id");
CREATE INDEX "ix_e_booklet_code_redemptions_instance_student" ON "e_booklet_access_code_redemptions"("booklet_instance_id", "student_id");
CREATE INDEX "ix_e_booklet_code_redemptions_purchase" ON "e_booklet_access_code_redemptions"("purchase_id");
CREATE INDEX "ix_e_booklet_code_redemptions_progress" ON "e_booklet_access_code_redemptions"("counted_for_progress", "redeemed_at");

ALTER TABLE "e_booklet_terms" ADD CONSTRAINT "e_booklet_terms_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_terms" ADD CONSTRAINT "e_booklet_terms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_terms" ADD CONSTRAINT "e_booklet_terms_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_milestones" ADD CONSTRAINT "e_booklet_milestones_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "e_booklet_terms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_milestone_achievements" ADD CONSTRAINT "e_booklet_milestone_achievements_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_milestone_achievements" ADD CONSTRAINT "e_booklet_milestone_achievements_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "e_booklet_terms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_milestone_achievements" ADD CONSTRAINT "e_booklet_milestone_achievements_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "e_booklet_milestones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_teacher_terms_acceptances" ADD CONSTRAINT "e_booklet_teacher_terms_acceptances_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_teacher_terms_acceptances" ADD CONSTRAINT "e_booklet_teacher_terms_acceptances_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "e_booklet_terms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_teacher_terms_acceptances" ADD CONSTRAINT "e_booklet_teacher_terms_acceptances_milestone_achievement_id_fkey" FOREIGN KEY ("milestone_achievement_id") REFERENCES "e_booklet_milestone_achievements"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "teacher_wallets" ADD CONSTRAINT "teacher_wallets_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "teacher_wallet_ledger_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "teacher_wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "teacher_wallet_ledger_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "teacher_wallet_ledger_milestone_achievement_id_fkey" FOREIGN KEY ("milestone_achievement_id") REFERENCES "e_booklet_milestone_achievements"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "teacher_wallet_ledger_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "teacher_wallet_ledger" ADD CONSTRAINT "teacher_wallet_ledger_e_booklet_purchase_id_fkey" FOREIGN KEY ("e_booklet_purchase_id") REFERENCES "e_booklet_purchases"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "e_booklet_access_codes_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "e_booklet_access_codes_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "e_booklet_terms"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "e_booklet_access_codes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_codes" ADD CONSTRAINT "e_booklet_access_codes_bound_student_id_fkey" FOREIGN KEY ("bound_student_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_access_code_redemptions" ADD CONSTRAINT "e_booklet_access_code_redemptions_access_code_id_fkey" FOREIGN KEY ("access_code_id") REFERENCES "e_booklet_access_codes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_code_redemptions" ADD CONSTRAINT "e_booklet_access_code_redemptions_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_code_redemptions" ADD CONSTRAINT "e_booklet_access_code_redemptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_code_redemptions" ADD CONSTRAINT "e_booklet_access_code_redemptions_access_id_fkey" FOREIGN KEY ("access_id") REFERENCES "e_booklet_access"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access_code_redemptions" ADD CONSTRAINT "e_booklet_access_code_redemptions_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
