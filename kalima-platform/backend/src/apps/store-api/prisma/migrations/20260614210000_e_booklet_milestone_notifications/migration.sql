-- Add e-booklet milestone notification keys.
ALTER TYPE "notification_key_enum" ADD VALUE IF NOT EXISTS 'E_BOOKLET_MILESTONE_ACHIEVED';
ALTER TYPE "notification_key_enum" ADD VALUE IF NOT EXISTS 'E_BOOKLET_MILESTONE_ADMIN_ALERT';

-- Backfill idempotency before enforcing the DB identity used by createMany(skipDuplicates).
DELETE FROM "notifications" duplicate
USING "notifications" keeper
WHERE duplicate."id" > keeper."id"
  AND duplicate."user_id" = keeper."user_id"
  AND duplicate."message_key" = keeper."message_key"
  AND duplicate."entity_type" = keeper."entity_type"
  AND duplicate."entity_id" = keeper."entity_id"
  AND duplicate."user_id" IS NOT NULL
  AND duplicate."entity_type" IS NOT NULL
  AND duplicate."entity_id" IS NOT NULL;

CREATE UNIQUE INDEX "ux_notifications_user_message_entity" ON "notifications"("user_id", "message_key", "entity_type", "entity_id") WHERE "user_id" IS NOT NULL AND "entity_type" IS NOT NULL AND "entity_id" IS NOT NULL;
