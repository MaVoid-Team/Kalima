-- Repair and synchronize user_analytics total_spent and number_of_purchases from actual purchases

-- 1. Ensure all users have a user_analytics row
INSERT INTO "user_analytics" ("user_id", "views", "total_spent", "number_of_purchases", "successful_invites", "monthly_confirmed_count", "last_confirmed_count_update")
SELECT u."id", 0, 0, 0, 0, 0, NOW()
FROM "users" u
LEFT JOIN "user_analytics" ua ON ua."user_id" = u."id"
WHERE ua."user_id" IS NULL
ON CONFLICT ("user_id") DO NOTHING;

-- 2. Recalculate total_spent and number_of_purchases for all users from active, non-deleted purchases
WITH purchase_stats AS (
  SELECT
    "user_id",
    COALESCE(SUM("total"), 0) AS calculated_total_spent,
    COUNT("id") AS calculated_purchases
  FROM "purchases"
  WHERE "is_deleted" = false AND "deleted_at" IS NULL
  GROUP BY "user_id"
)
UPDATE "user_analytics" ua
SET
  "total_spent" = ps.calculated_total_spent,
  "number_of_purchases" = ps.calculated_purchases
FROM (
  SELECT
    u."id" AS "user_id",
    COALESCE(ps.calculated_total_spent, 0) AS calculated_total_spent,
    COALESCE(ps.calculated_purchases, 0) AS calculated_purchases
  FROM "users" u
  LEFT JOIN purchase_stats ps ON ps."user_id" = u."id"
) ps
WHERE ua."user_id" = ps."user_id";
