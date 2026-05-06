CREATE TYPE "e_booklet_template_status_enum" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "e_booklet_template_version_status_enum" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "e_booklet_hotspot_type_enum" AS ENUM ('text', 'image', 'video', 'audio');
CREATE TYPE "e_booklet_hotspot_trigger_type_enum" AS ENUM ('hover', 'click', 'both');
CREATE TYPE "e_booklet_purchase_status_enum" AS ENUM ('pending', 'awaiting_payment', 'paid', 'needs_branding_info', 'customization_in_progress', 'ready', 'cancelled', 'rejected');
CREATE TYPE "e_booklet_instance_status_enum" AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE "e_booklet_access_role_enum" AS ENUM ('teacher', 'student');
CREATE TYPE "e_booklet_access_status_enum" AS ENUM ('active', 'revoked');
CREATE TYPE "e_booklet_invite_status_enum" AS ENUM ('active', 'disabled', 'expired');
CREATE TYPE "e_booklet_file_type_enum" AS ENUM ('pdf', 'image', 'video', 'audio', 'doc', 'docx');
CREATE TYPE "e_booklet_file_visibility_enum" AS ENUM ('private');

CREATE TABLE "e_booklet_file_assets" (
  "id" SERIAL PRIMARY KEY,
  "owner_type" VARCHAR(50) NOT NULL,
  "owner_id" INTEGER,
  "file_type" "e_booklet_file_type_enum" NOT NULL,
  "storage_key" VARCHAR(500) NOT NULL,
  "original_filename" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(150) NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "visibility" "e_booklet_file_visibility_enum" NOT NULL DEFAULT 'private',
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "e_booklet_templates" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "cover_file_id" INTEGER,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "status" "e_booklet_template_status_enum" NOT NULL DEFAULT 'draft',
  "category_id" INTEGER,
  "created_by" INTEGER NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_template_versions" (
  "id" SERIAL PRIMARY KEY,
  "template_id" INTEGER NOT NULL,
  "version_number" INTEGER NOT NULL,
  "base_document_file_id" INTEGER,
  "rendered_document_file_id" INTEGER,
  "page_count" INTEGER NOT NULL,
  "page_dimensions_json" JSONB,
  "status" "e_booklet_template_version_status_enum" NOT NULL DEFAULT 'draft',
  "created_by" INTEGER NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_hotspots" (
  "id" SERIAL PRIMARY KEY,
  "template_version_id" INTEGER NOT NULL,
  "page_number" INTEGER NOT NULL,
  "x_percent" DECIMAL(6,3) NOT NULL,
  "y_percent" DECIMAL(6,3) NOT NULL,
  "radius_percent" DECIMAL(6,3) NOT NULL,
  "type" "e_booklet_hotspot_type_enum" NOT NULL,
  "title" VARCHAR(255),
  "text_content" TEXT,
  "asset_file_id" INTEGER,
  "trigger_type" "e_booklet_hotspot_trigger_type_enum" NOT NULL DEFAULT 'click',
  "display_behavior" JSONB,
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" INTEGER NOT NULL,
  "updated_by" INTEGER,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_purchases" (
  "id" SERIAL PRIMARY KEY,
  "teacher_id" INTEGER NOT NULL,
  "template_id" INTEGER NOT NULL,
  "template_version_id" INTEGER NOT NULL,
  "status" "e_booklet_purchase_status_enum" NOT NULL DEFAULT 'pending',
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "payment_method" VARCHAR(100),
  "payment_reference" VARCHAR(255),
  "branding_json" JSONB,
  "admin_notes" TEXT,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_instances" (
  "id" SERIAL PRIMARY KEY,
  "purchase_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "template_id" INTEGER NOT NULL,
  "template_version_id" INTEGER NOT NULL,
  "custom_document_file_id" INTEGER,
  "display_title" VARCHAR(255) NOT NULL,
  "branding_json" JSONB,
  "invite_quota" INTEGER NOT NULL DEFAULT 0,
  "used_invites_count" INTEGER NOT NULL DEFAULT 0,
  "status" "e_booklet_instance_status_enum" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_invites" (
  "id" SERIAL PRIMARY KEY,
  "booklet_instance_id" INTEGER NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "token_hash" VARCHAR(128) NOT NULL,
  "max_uses" INTEGER,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(6),
  "status" "e_booklet_invite_status_enum" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "e_booklet_access" (
  "id" SERIAL PRIMARY KEY,
  "booklet_instance_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "role" "e_booklet_access_role_enum" NOT NULL,
  "source_invite_id" INTEGER,
  "status" "e_booklet_access_status_enum" NOT NULL DEFAULT 'active',
  "granted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_invite_redemptions" (
  "id" SERIAL PRIMARY KEY,
  "invite_id" INTEGER NOT NULL,
  "booklet_instance_id" INTEGER NOT NULL,
  "student_id" INTEGER NOT NULL,
  "redeemed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "ip_address" VARCHAR(64),
  "user_agent" TEXT
);

CREATE TABLE "e_booklet_audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "actor_user_id" INTEGER,
  "action" VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(80) NOT NULL,
  "entity_id" INTEGER NOT NULL,
  "metadata_json" JSONB,
  "ip_address" VARCHAR(64),
  "user_agent" TEXT,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "e_booklet_templates_slug_key" ON "e_booklet_templates"("slug");
CREATE INDEX "ix_e_booklet_templates_status" ON "e_booklet_templates"("status");
CREATE INDEX "ix_e_booklet_templates_category" ON "e_booklet_templates"("category_id");
CREATE INDEX "ix_e_booklet_templates_created_at" ON "e_booklet_templates"("created_at");

CREATE UNIQUE INDEX "e_booklet_template_versions_template_id_version_number_key" ON "e_booklet_template_versions"("template_id", "version_number");
CREATE INDEX "ix_e_booklet_versions_template_status" ON "e_booklet_template_versions"("template_id", "status");

CREATE INDEX "ix_e_booklet_hotspots_version_page_active" ON "e_booklet_hotspots"("template_version_id", "page_number", "is_active");

CREATE INDEX "ix_e_booklet_purchases_teacher_status" ON "e_booklet_purchases"("teacher_id", "status");
CREATE INDEX "ix_e_booklet_purchases_status_created" ON "e_booklet_purchases"("status", "created_at");

CREATE UNIQUE INDEX "e_booklet_instances_purchase_id_key" ON "e_booklet_instances"("purchase_id");
CREATE INDEX "ix_e_booklet_instances_teacher_status" ON "e_booklet_instances"("teacher_id", "status");
CREATE INDEX "ix_e_booklet_instances_template_version" ON "e_booklet_instances"("template_version_id");

CREATE UNIQUE INDEX "e_booklet_access_booklet_instance_id_user_id_role_key" ON "e_booklet_access"("booklet_instance_id", "user_id", "role");
CREATE INDEX "ix_e_booklet_access_user_role_status" ON "e_booklet_access"("user_id", "role", "status");
CREATE INDEX "ix_e_booklet_access_instance_role_status" ON "e_booklet_access"("booklet_instance_id", "role", "status");

CREATE UNIQUE INDEX "e_booklet_invites_token_hash_key" ON "e_booklet_invites"("token_hash");
CREATE INDEX "ix_e_booklet_invites_instance_status" ON "e_booklet_invites"("booklet_instance_id", "status");
CREATE INDEX "ix_e_booklet_invites_teacher_status" ON "e_booklet_invites"("teacher_id", "status");

CREATE UNIQUE INDEX "e_booklet_invite_redemptions_invite_id_student_id_key" ON "e_booklet_invite_redemptions"("invite_id", "student_id");
CREATE INDEX "ix_e_booklet_redemptions_instance_student" ON "e_booklet_invite_redemptions"("booklet_instance_id", "student_id");

CREATE UNIQUE INDEX "e_booklet_file_assets_storage_key_key" ON "e_booklet_file_assets"("storage_key");
CREATE INDEX "ix_e_booklet_file_assets_owner" ON "e_booklet_file_assets"("owner_type", "owner_id");
CREATE INDEX "ix_e_booklet_file_assets_file_type" ON "e_booklet_file_assets"("file_type");

CREATE INDEX "ix_e_booklet_audit_entity_created" ON "e_booklet_audit_logs"("entity_type", "entity_id", "created_at");
CREATE INDEX "ix_e_booklet_audit_actor_created" ON "e_booklet_audit_logs"("actor_user_id", "created_at");
CREATE INDEX "ix_e_booklet_audit_action_created" ON "e_booklet_audit_logs"("action", "created_at");

ALTER TABLE "e_booklet_templates" ADD CONSTRAINT "e_booklet_templates_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_templates" ADD CONSTRAINT "e_booklet_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_templates" ADD CONSTRAINT "e_booklet_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_template_versions" ADD CONSTRAINT "e_booklet_template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_template_versions" ADD CONSTRAINT "e_booklet_template_versions_base_document_file_id_fkey" FOREIGN KEY ("base_document_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_template_versions" ADD CONSTRAINT "e_booklet_template_versions_rendered_document_file_id_fkey" FOREIGN KEY ("rendered_document_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_template_versions" ADD CONSTRAINT "e_booklet_template_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_hotspots" ADD CONSTRAINT "e_booklet_hotspots_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspots" ADD CONSTRAINT "e_booklet_hotspots_asset_file_id_fkey" FOREIGN KEY ("asset_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspots" ADD CONSTRAINT "e_booklet_hotspots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspots" ADD CONSTRAINT "e_booklet_hotspots_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_purchases" ADD CONSTRAINT "e_booklet_purchases_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_purchases" ADD CONSTRAINT "e_booklet_purchases_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_purchases" ADD CONSTRAINT "e_booklet_purchases_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_instances" ADD CONSTRAINT "e_booklet_instances_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "e_booklet_purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_instances" ADD CONSTRAINT "e_booklet_instances_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_instances" ADD CONSTRAINT "e_booklet_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_instances" ADD CONSTRAINT "e_booklet_instances_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_instances" ADD CONSTRAINT "e_booklet_instances_custom_document_file_id_fkey" FOREIGN KEY ("custom_document_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_invites" ADD CONSTRAINT "e_booklet_invites_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_invites" ADD CONSTRAINT "e_booklet_invites_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_access" ADD CONSTRAINT "e_booklet_access_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access" ADD CONSTRAINT "e_booklet_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_access" ADD CONSTRAINT "e_booklet_access_source_invite_id_fkey" FOREIGN KEY ("source_invite_id") REFERENCES "e_booklet_invites"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_invite_redemptions" ADD CONSTRAINT "e_booklet_invite_redemptions_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "e_booklet_invites"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_invite_redemptions" ADD CONSTRAINT "e_booklet_invite_redemptions_booklet_instance_id_fkey" FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_invite_redemptions" ADD CONSTRAINT "e_booklet_invite_redemptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_audit_logs" ADD CONSTRAINT "e_booklet_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
