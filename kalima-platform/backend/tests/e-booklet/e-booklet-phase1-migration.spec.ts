import fs from "fs";
import path from "path";

const migrationSql = fs.readFileSync(
  path.join(__dirname, "../../src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql"),
  "utf8",
);
const walletAmountsMigrationSql = fs.readFileSync(
  path.join(__dirname, "../../src/apps/store-api/prisma/migrations/20260615120000_e_booklet_purchase_wallet_amounts/migration.sql"),
  "utf8",
);
const milestoneNotificationMigrationSql = fs.readFileSync(
  path.join(__dirname, "../../src/apps/store-api/prisma/migrations/20260614210000_e_booklet_milestone_notifications/migration.sql"),
  "utf8",
);

describe("Phase 1 e-booklet migration DB invariants", () => {
  test("active terms are protected by real partial unique indexes, not nullable service guards", () => {
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_e_booklet_terms_one_active_global" ON "e_booklet_terms"((true)) WHERE "status" = \'active\' AND "template_id" IS NULL;',
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_e_booklet_terms_one_active_per_template" ON "e_booklet_terms"("template_id") WHERE "status" = \'active\' AND "template_id" IS NOT NULL;',
    );
    expect(migrationSql).not.toContain('CREATE UNIQUE INDEX "e_booklet_terms_active_guard_key"');
  });

  test("paid code single redemption is protected by counted progress uniqueness", () => {
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_e_booklet_paid_code_one_counted_redemption" ON "e_booklet_access_code_redemptions"("access_code_id") WHERE "counted_for_progress" = true;',
    );
    expect(migrationSql).not.toContain('CREATE UNIQUE INDEX "e_booklet_access_code_redemptions_paid_redemption_guard_key"');
  });

  test("milestone reward credit is protected by a DB uniqueness invariant", () => {
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_teacher_wallet_ledger_one_milestone_reward_credit" ON "teacher_wallet_ledger"("milestone_achievement_id", "source", "type") WHERE "milestone_achievement_id" IS NOT NULL AND "source" = \'milestone_reward\' AND "type" = \'credit\';',
    );
  });

  test("milestone notification rows are protected by a DB-backed recipient identity unique index", () => {
    expect(milestoneNotificationMigrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_notifications_user_message_entity" ON "notifications"("user_id", "message_key", "entity_type", "entity_id") WHERE "user_id" IS NOT NULL AND "entity_type" IS NOT NULL AND "entity_id" IS NOT NULL;',
    );
  });

  test("disabled reward milestone contract allows zero rewards in persisted milestones and achievements", () => {
    expect(migrationSql).toContain(
      '"reward_amount_snapshot" IS NOT NULL AND "reward_amount_snapshot" >= 0',
    );
    expect(migrationSql).toContain('"reward_amount" >= 0');
    expect(migrationSql).not.toContain('"reward_amount_snapshot" > 0');
    expect(migrationSql).not.toContain('"reward_amount" > 0');
  });

  test("teacher terms acceptance uniqueness separates code generation null achievement and reward claims", () => {
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_e_booklet_code_generation_terms_acceptance" ON "e_booklet_teacher_terms_acceptances"("teacher_id", "term_id", "acceptance_type") WHERE "acceptance_type" = \'code_generation\' AND "milestone_achievement_id" IS NULL;',
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "ux_e_booklet_reward_claim_terms_acceptance" ON "e_booklet_teacher_terms_acceptances"("teacher_id", "term_id", "acceptance_type", "milestone_achievement_id") WHERE "acceptance_type" = \'reward_claim\' AND "milestone_achievement_id" IS NOT NULL;',
    );
    expect(migrationSql).not.toContain('UNIQUE ("teacher_id", "term_id", "acceptance_type", "milestone_achievement_id")');
  });

  test("wallet application preserves canonical purchase price with structured credit/final amounts", () => {
    expect(walletAmountsMigrationSql).toContain('ADD COLUMN "wallet_credit_applied" DECIMAL(10, 2) NOT NULL DEFAULT 0');
    expect(walletAmountsMigrationSql).toContain('ADD COLUMN "final_payable_price" DECIMAL(10, 2)');
    expect(walletAmountsMigrationSql).not.toContain('UPDATE "e_booklet_purchases"\nSET "price"');
  });
});
