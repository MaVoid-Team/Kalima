CREATE TABLE IF NOT EXISTS "e_booklet_access_code_print_templates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(120) NOT NULL,
  "background_file_asset_id" INTEGER NOT NULL,
  "width_px" INTEGER NOT NULL DEFAULT 827,
  "height_px" INTEGER NOT NULL DEFAULT 438,
  "ppi" INTEGER NOT NULL DEFAULT 300,
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "layout_json" JSONB NOT NULL,
  "default_required_fields_json" JSONB,
  "created_by" INTEGER,
  "updated_by" INTEGER,
  "archived_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS "e_booklet_access_code_print_presets" (
  "id" SERIAL PRIMARY KEY,
  "preset_type" VARCHAR(40) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "display_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" INTEGER,
  "updated_by" INTEGER,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS "e_booklet_access_code_print_batches" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(160) NOT NULL,
  "teacher_id" INTEGER NOT NULL,
  "booklet_instance_id" INTEGER NOT NULL,
  "template_id" INTEGER NOT NULL,
  "term_id" INTEGER NOT NULL,
  "kind" "e_booklet_access_code_kind_enum" NOT NULL,
  "count" INTEGER NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'generated',
  "teacher_image_file_asset_id" INTEGER,
  "pdf_file_asset_id" INTEGER,
  "snapshot_json" JSONB NOT NULL,
  "expires_at" TIMESTAMP(6),
  "created_by" INTEGER,
  "generated_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "e_booklet_access_code_print_batch_codes" (
  "id" SERIAL PRIMARY KEY,
  "batch_id" INTEGER NOT NULL,
  "access_code_id" INTEGER NOT NULL,
  "card_index" INTEGER NOT NULL,
  "qr_ref_hash" VARCHAR(128),
  "access_code_ciphertext" TEXT,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "e_booklet_access_code_print_batch_codes"
  ADD COLUMN IF NOT EXISTS "access_code_ciphertext" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_templates_dimensions'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_templates"
      ADD CONSTRAINT "ck_e_booklet_print_templates_dimensions"
      CHECK ("width_px" = 827 AND "height_px" = 438 AND "ppi" = 300);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_templates_status'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_templates"
      ADD CONSTRAINT "ck_e_booklet_print_templates_status"
      CHECK ("status" IN ('active', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_presets_type'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_presets"
      ADD CONSTRAINT "ck_e_booklet_print_presets_type"
      CHECK ("preset_type" IN ('registration_method', 'grade_class'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_batches_count'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "ck_e_booklet_print_batches_count"
      CHECK ("count" > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_batches_status'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "ck_e_booklet_print_batches_status"
      CHECK ("status" IN ('generated', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_print_batch_codes_card_index'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batch_codes"
      ADD CONSTRAINT "ck_e_booklet_print_batch_codes_card_index"
      CHECK ("card_index" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_templates_background_file'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_templates"
      ADD CONSTRAINT "fk_e_booklet_print_templates_background_file"
      FOREIGN KEY ("background_file_asset_id") REFERENCES "e_booklet_file_assets"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_templates_created_by'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_templates"
      ADD CONSTRAINT "fk_e_booklet_print_templates_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_templates_updated_by'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_templates"
      ADD CONSTRAINT "fk_e_booklet_print_templates_updated_by"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_presets_created_by'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_presets"
      ADD CONSTRAINT "fk_e_booklet_print_presets_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_presets_updated_by'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_presets"
      ADD CONSTRAINT "fk_e_booklet_print_presets_updated_by"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_teacher'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_teacher"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_instance'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_instance"
      FOREIGN KEY ("booklet_instance_id") REFERENCES "e_booklet_instances"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_template'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_template"
      FOREIGN KEY ("template_id") REFERENCES "e_booklet_access_code_print_templates"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_term'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_term"
      FOREIGN KEY ("term_id") REFERENCES "e_booklet_terms"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_teacher_image'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_teacher_image"
      FOREIGN KEY ("teacher_image_file_asset_id") REFERENCES "e_booklet_file_assets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_pdf'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_pdf"
      FOREIGN KEY ("pdf_file_asset_id") REFERENCES "e_booklet_file_assets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batches_created_by'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batches"
      ADD CONSTRAINT "fk_e_booklet_print_batches_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batch_codes_batch'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batch_codes"
      ADD CONSTRAINT "fk_e_booklet_print_batch_codes_batch"
      FOREIGN KEY ("batch_id") REFERENCES "e_booklet_access_code_print_batches"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_e_booklet_print_batch_codes_access_code'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batch_codes"
      ADD CONSTRAINT "fk_e_booklet_print_batch_codes_access_code"
      FOREIGN KEY ("access_code_id") REFERENCES "e_booklet_access_codes"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ux_e_booklet_print_batch_code_once'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batch_codes"
      ADD CONSTRAINT "ux_e_booklet_print_batch_code_once"
      UNIQUE ("batch_id", "access_code_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ux_e_booklet_print_batch_card_index'
  ) THEN
    ALTER TABLE "e_booklet_access_code_print_batch_codes"
      ADD CONSTRAINT "ux_e_booklet_print_batch_card_index"
      UNIQUE ("batch_id", "card_index");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_templates_status"
  ON "e_booklet_access_code_print_templates" ("status");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_templates_background"
  ON "e_booklet_access_code_print_templates" ("background_file_asset_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_presets_type_active_sort"
  ON "e_booklet_access_code_print_presets" ("preset_type", "active", "sort_order");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batches_teacher_status"
  ON "e_booklet_access_code_print_batches" ("teacher_id", "status");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batches_instance_status"
  ON "e_booklet_access_code_print_batches" ("booklet_instance_id", "status");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batches_template"
  ON "e_booklet_access_code_print_batches" ("template_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batches_created"
  ON "e_booklet_access_code_print_batches" ("created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batch_codes_access_code"
  ON "e_booklet_access_code_print_batch_codes" ("access_code_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_print_batch_codes_qr_ref"
  ON "e_booklet_access_code_print_batch_codes" ("qr_ref_hash");
