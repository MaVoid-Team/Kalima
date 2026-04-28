-- CreateEnum
CREATE TYPE "notification_key_enum" AS ENUM ('ORDER_STATUS_RECEIVED', 'ORDER_STATUS_CONFIRMED', 'ORDER_STATUS_RETURNED', 'ORDER_ITEM_DELETED', 'ORDER_DELETED', 'ORDER_ADMIN_NOTE', 'NEW_ORDER_CREATED', 'NEW_ACCOUNT_CREATED', 'SYSTEM_ANNOUNCEMENT', 'ACCOUNT_UPDATE', 'CUSTOM');

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "has_admin_edits" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "general_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsapp_receiving_number" VARCHAR(50),
    "whatsapp_sending_number" VARCHAR(50),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "role" "role_enum",
    "category" INTEGER NOT NULL,
    "message_key" "notification_key_enum" NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" INTEGER,
    "target_link" VARCHAR(255),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_notifications_user_read" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "ix_notifications_user_category" ON "notifications"("user_id", "category");

-- CreateIndex
CREATE INDEX "ix_notifications_role" ON "notifications"("role");

-- CreateIndex
CREATE INDEX "ix_notifications_entity" ON "notifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "ix_notifications_created_at" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

