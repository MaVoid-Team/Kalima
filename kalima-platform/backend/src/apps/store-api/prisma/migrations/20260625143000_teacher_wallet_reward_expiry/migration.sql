ALTER TABLE "e_booklet_milestones"
  ADD COLUMN "reward_expiry_days" INTEGER NOT NULL DEFAULT 120;

ALTER TABLE "e_booklet_milestone_achievements"
  ADD COLUMN "reward_expiry_days_snapshot" INTEGER,
  ADD COLUMN "reward_expires_at" TIMESTAMP(6);

ALTER TABLE "e_booklet_milestones"
  ADD CONSTRAINT "ck_e_booklet_milestones_reward_expiry_days" CHECK ("reward_expiry_days" > 0);

ALTER TABLE "e_booklet_milestone_achievements"
  ADD CONSTRAINT "ck_e_booklet_achievements_reward_expiry_days" CHECK ("reward_expiry_days_snapshot" IS NULL OR "reward_expiry_days_snapshot" > 0);

CREATE TABLE "teacher_wallet_credit_lots" (
  "id" SERIAL PRIMARY KEY,
  "wallet_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "credit_ledger_id" INTEGER NOT NULL,
  "milestone_achievement_id" INTEGER,
  "original_amount" DECIMAL(12,2) NOT NULL,
  "remaining_amount" DECIMAL(12,2) NOT NULL,
  "expires_at" TIMESTAMP(6) NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "teacher_wallet_spend_allocations" (
  "id" SERIAL PRIMARY KEY,
  "wallet_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "credit_lot_id" INTEGER NOT NULL,
  "debit_ledger_id" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "teacher_wallet_credit_lots"
  ADD CONSTRAINT "ck_teacher_wallet_credit_lots_amounts" CHECK ("original_amount" >= 0 AND "remaining_amount" >= 0 AND "remaining_amount" <= "original_amount");

ALTER TABLE "teacher_wallet_spend_allocations"
  ADD CONSTRAINT "ck_teacher_wallet_spend_allocations_positive_amount" CHECK ("amount" > 0);

CREATE UNIQUE INDEX "teacher_wallet_credit_lots_credit_ledger_id_key" ON "teacher_wallet_credit_lots"("credit_ledger_id");
CREATE INDEX "ix_teacher_wallet_credit_lots_teacher_expires" ON "teacher_wallet_credit_lots"("teacher_id", "expires_at");
CREATE INDEX "ix_teacher_wallet_credit_lots_wallet_expires" ON "teacher_wallet_credit_lots"("wallet_id", "expires_at");
CREATE INDEX "ix_teacher_wallet_credit_lots_achievement" ON "teacher_wallet_credit_lots"("milestone_achievement_id");
CREATE INDEX "ix_teacher_wallet_spend_alloc_teacher_created" ON "teacher_wallet_spend_allocations"("teacher_id", "created_at");
CREATE INDEX "ix_teacher_wallet_spend_alloc_lot" ON "teacher_wallet_spend_allocations"("credit_lot_id");
CREATE INDEX "ix_teacher_wallet_spend_alloc_debit" ON "teacher_wallet_spend_allocations"("debit_ledger_id");

ALTER TABLE "teacher_wallet_credit_lots"
  ADD CONSTRAINT "teacher_wallet_credit_lots_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "teacher_wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_credit_lots_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_credit_lots_credit_ledger_id_fkey" FOREIGN KEY ("credit_ledger_id") REFERENCES "teacher_wallet_ledger"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_credit_lots_milestone_achievement_id_fkey" FOREIGN KEY ("milestone_achievement_id") REFERENCES "e_booklet_milestone_achievements"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "teacher_wallet_spend_allocations"
  ADD CONSTRAINT "teacher_wallet_spend_allocations_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "teacher_wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_spend_allocations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_spend_allocations_credit_lot_id_fkey" FOREIGN KEY ("credit_lot_id") REFERENCES "teacher_wallet_credit_lots"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT "teacher_wallet_spend_allocations_debit_ledger_id_fkey" FOREIGN KEY ("debit_ledger_id") REFERENCES "teacher_wallet_ledger"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

UPDATE "e_booklet_milestone_achievements" AS achievement
SET
  "reward_expiry_days_snapshot" = COALESCE(milestone."reward_expiry_days", 120),
  "reward_expires_at" = COALESCE(achievement."claimed_at", achievement."achieved_at", CURRENT_TIMESTAMP)
    + (COALESCE(milestone."reward_expiry_days", 120) || ' days')::interval
FROM "e_booklet_milestones" AS milestone
WHERE achievement."milestone_id" = milestone."id"
  AND achievement."claimed_at" IS NOT NULL;

WITH credit_rows AS (
  SELECT
    ledger."id" AS credit_ledger_id,
    ledger."wallet_id",
    ledger."teacher_id",
    ledger."milestone_achievement_id",
    ledger."amount",
    COALESCE(achievement."reward_expires_at", COALESCE(achievement."claimed_at", ledger."created_at", CURRENT_TIMESTAMP) + interval '120 days') AS expires_at,
    COALESCE(ledger."created_at", achievement."claimed_at", CURRENT_TIMESTAMP) AS created_at,
    SUM(ledger."amount") OVER (
      PARTITION BY ledger."teacher_id"
      ORDER BY COALESCE(achievement."reward_expires_at", COALESCE(achievement."claimed_at", ledger."created_at", CURRENT_TIMESTAMP) + interval '120 days'), COALESCE(ledger."created_at", achievement."claimed_at", CURRENT_TIMESTAMP), ledger."id"
    ) AS cumulative_credit
  FROM "teacher_wallet_ledger" AS ledger
  INNER JOIN "e_booklet_milestone_achievements" AS achievement
    ON achievement."id" = ledger."milestone_achievement_id"
  WHERE ledger."source" = 'milestone_reward'
    AND ledger."type" = 'credit'
    AND ledger."amount" > 0
    AND achievement."claimed_at" IS NOT NULL
),
debit_totals AS (
  SELECT
    "teacher_id",
    COALESCE(SUM(ABS("amount")), 0) AS total_debits
  FROM "teacher_wallet_ledger"
  WHERE "type" = 'debit'
  GROUP BY "teacher_id"
),
lot_rows AS (
  SELECT
    credit_rows.*,
    GREATEST(
      0,
      credit_rows."amount"
        - GREATEST(
          0,
          LEAST(COALESCE(debit_totals.total_debits, 0), credit_rows.cumulative_credit)
            - LEAST(COALESCE(debit_totals.total_debits, 0), credit_rows.cumulative_credit - credit_rows."amount")
        )
    ) AS remaining_amount
  FROM credit_rows
  LEFT JOIN debit_totals ON debit_totals."teacher_id" = credit_rows."teacher_id"
)
INSERT INTO "teacher_wallet_credit_lots" (
  "wallet_id",
  "teacher_id",
  "credit_ledger_id",
  "milestone_achievement_id",
  "original_amount",
  "remaining_amount",
  "expires_at",
  "created_at"
)
SELECT
  "wallet_id",
  "teacher_id",
  "credit_ledger_id",
  "milestone_achievement_id",
  "amount",
  "remaining_amount",
  "expires_at",
  "created_at"
FROM lot_rows
ON CONFLICT ("credit_ledger_id") DO NOTHING;

UPDATE "teacher_wallets" AS wallet
SET
  "balance" = COALESCE(lots.usable_balance, 0),
  "updated_at" = CURRENT_TIMESTAMP
FROM (
  SELECT
    "wallet_id",
    SUM("remaining_amount") FILTER (WHERE "expires_at" > CURRENT_TIMESTAMP) AS usable_balance
  FROM "teacher_wallet_credit_lots"
  GROUP BY "wallet_id"
) AS lots
WHERE wallet."id" = lots."wallet_id";

UPDATE "teacher_wallets" AS wallet
SET
  "balance" = 0,
  "updated_at" = CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "teacher_wallet_credit_lots" AS lots WHERE lots."wallet_id" = wallet."id"
);
