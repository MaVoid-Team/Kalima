ALTER TYPE "e_booklet_hotspot_type_enum" ADD VALUE IF NOT EXISTS 'file';
ALTER TYPE "e_booklet_hotspot_type_enum" ADD VALUE IF NOT EXISTS 'link';
ALTER TYPE "e_booklet_hotspot_type_enum" ADD VALUE IF NOT EXISTS 'question_answer';

CREATE TYPE "e_booklet_hotspot_shape_enum" AS ENUM ('circle', 'rectangle', 'square', 'triangle', 'oval');
CREATE TYPE "e_booklet_video_source_enum" AS ENUM ('uploaded', 'youtube');

ALTER TABLE "e_booklet_templates"
  ADD COLUMN "marketing_price" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "e_booklet_hotspots"
  ADD COLUMN "reference_number" INTEGER,
  ADD COLUMN "shape" "e_booklet_hotspot_shape_enum" NOT NULL DEFAULT 'circle',
  ADD COLUMN "width_percent" DECIMAL(6,3),
  ADD COLUMN "height_percent" DECIMAL(6,3),
  ADD COLUMN "content_json" JSONB,
  ADD COLUMN "interaction_json" JSONB;

CREATE UNIQUE INDEX "ux_e_booklet_hotspots_version_reference" ON "e_booklet_hotspots"("template_version_id", "reference_number");

ALTER TABLE "e_booklet_purchases"
  ADD COLUMN "marketing_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "internal_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "access_expires_at" TIMESTAMP(6);

ALTER TABLE "e_booklet_instances"
  ADD COLUMN "access_expires_at" TIMESTAMP(6),
  ADD COLUMN "archived_at" TIMESTAMP(6),
  ADD COLUMN "archive_reason" VARCHAR(100),
  ADD COLUMN "student_marketing_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "internal_price" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "e_booklet_access"
  ADD COLUMN "access_source" VARCHAR(40),
  ADD COLUMN "terms_accepted_at" TIMESTAMP(6),
  ADD COLUMN "terms_version" VARCHAR(50);

ALTER TABLE "e_booklet_invites"
  ADD COLUMN "passcode_hash" VARCHAR(128),
  ADD COLUMN "passcode_hint" VARCHAR(20);

CREATE TABLE "e_booklet_devices" (
  "id" SERIAL PRIMARY KEY,
  "booklet_instance_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "device_fingerprint" VARCHAR(128) NOT NULL,
  "device_label" VARCHAR(255),
  "user_agent" TEXT,
  "ip_address" VARCHAR(64),
  "first_seen_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMP(6),
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "reset_by_admin_id" INTEGER,
  "reset_reason" TEXT
);

CREATE TABLE "e_booklet_device_allowances" (
  "id" SERIAL PRIMARY KEY,
  "booklet_instance_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "allowed_devices" INTEGER NOT NULL DEFAULT 1,
  "updated_by_admin_id" INTEGER,
  "reason" TEXT,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_student_purchase_links" (
  "id" SERIAL PRIMARY KEY,
  "purchase_id" INTEGER NOT NULL,
  "invite_id" INTEGER NOT NULL,
  "booklet_instance_id" INTEGER NOT NULL,
  "student_id" INTEGER NOT NULL,
  "access_id" INTEGER,
  "marketing_price_snapshot" DECIMAL(10,2) NOT NULL,
  "terms_accepted_at" TIMESTAMP(6),
  "terms_version" VARCHAR(50),
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP(6)
);

CREATE UNIQUE INDEX "e_booklet_devices_booklet_instance_id_user_id_device_fingerprint_key" ON "e_booklet_devices"("booklet_instance_id", "user_id", "device_fingerprint");
CREATE INDEX "e_booklet_devices_user_id_status_idx" ON "e_booklet_devices"("user_id", "status");
CREATE INDEX "e_booklet_devices_booklet_instance_id_status_idx" ON "e_booklet_devices"("booklet_instance_id", "status");

CREATE UNIQUE INDEX "e_booklet_device_allowances_booklet_instance_id_user_id_key" ON "e_booklet_device_allowances"("booklet_instance_id", "user_id");
CREATE INDEX "e_booklet_device_allowances_user_id_idx" ON "e_booklet_device_allowances"("user_id");

CREATE UNIQUE INDEX "e_booklet_student_purchase_links_purchase_id_key" ON "e_booklet_student_purchase_links"("purchase_id");
CREATE INDEX "e_booklet_student_purchase_links_booklet_instance_id_student_id_idx" ON "e_booklet_student_purchase_links"("booklet_instance_id", "student_id");
CREATE INDEX "e_booklet_student_purchase_links_invite_id_student_id_idx" ON "e_booklet_student_purchase_links"("invite_id", "student_id");

ALTER TABLE "e_booklet_devices" ADD CONSTRAINT "e_booklet_devices_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_devices" ADD CONSTRAINT "e_booklet_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_device_allowances" ADD CONSTRAINT "e_booklet_device_allowances_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_device_allowances" ADD CONSTRAINT "e_booklet_device_allowances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_student_purchase_links" ADD CONSTRAINT "e_booklet_student_purchase_links_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_student_purchase_links" ADD CONSTRAINT "e_booklet_student_purchase_links_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "e_booklet_invites"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_student_purchase_links" ADD CONSTRAINT "e_booklet_student_purchase_links_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_student_purchase_links" ADD CONSTRAINT "e_booklet_student_purchase_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_student_purchase_links" ADD CONSTRAINT "e_booklet_student_purchase_links_access_id_fkey" FOREIGN KEY ("access_id") REFERENCES "e_booklet_access"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
