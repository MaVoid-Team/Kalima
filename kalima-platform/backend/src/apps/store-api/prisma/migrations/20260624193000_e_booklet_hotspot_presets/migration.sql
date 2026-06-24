CREATE TABLE "e_booklet_hotspot_presets" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "tags_json" JSONB NOT NULL DEFAULT '[]',
  "type" "e_booklet_hotspot_type_enum" NOT NULL,
  "shape" "e_booklet_hotspot_shape_enum" NOT NULL DEFAULT 'circle',
  "width_percent" DECIMAL(6,3),
  "height_percent" DECIMAL(6,3),
  "radius_percent" DECIMAL(6,3) NOT NULL DEFAULT 1.8,
  "title" VARCHAR(255),
  "text_content" TEXT,
  "asset_file_id" INTEGER,
  "trigger_type" "e_booklet_hotspot_trigger_type_enum" NOT NULL DEFAULT 'click',
  "display_behavior" JSONB,
  "content_json" JSONB,
  "interaction_json" JSONB,
  "default_page_number" INTEGER,
  "default_x_percent" DECIMAL(6,3),
  "default_y_percent" DECIMAL(6,3),
  "source_template_id" INTEGER,
  "source_template_version_id" INTEGER,
  "source_hotspot_id" INTEGER,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" INTEGER NOT NULL,
  "updated_by" INTEGER,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6)
);

CREATE TABLE "e_booklet_hotspot_preset_usages" (
  "id" SERIAL PRIMARY KEY,
  "preset_id" INTEGER NOT NULL,
  "target_template_id" INTEGER,
  "target_template_version_id" INTEGER NOT NULL,
  "target_hotspot_id" INTEGER NOT NULL,
  "used_by" INTEGER NOT NULL,
  "used_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ix_e_booklet_hotspot_presets_active" ON "e_booklet_hotspot_presets"("is_active");
CREATE INDEX "ix_e_booklet_hotspot_presets_type" ON "e_booklet_hotspot_presets"("type");
CREATE INDEX "ix_e_booklet_hotspot_presets_created_by" ON "e_booklet_hotspot_presets"("created_by");
CREATE INDEX "ix_e_booklet_hotspot_presets_source_template" ON "e_booklet_hotspot_presets"("source_template_id");
CREATE INDEX "ix_e_booklet_hotspot_presets_source_version" ON "e_booklet_hotspot_presets"("source_template_version_id");
CREATE INDEX "ix_e_booklet_hotspot_presets_source_hotspot" ON "e_booklet_hotspot_presets"("source_hotspot_id");

CREATE INDEX "ix_e_booklet_hotspot_preset_usages_preset" ON "e_booklet_hotspot_preset_usages"("preset_id");
CREATE INDEX "ix_e_booklet_hotspot_preset_usages_target_version" ON "e_booklet_hotspot_preset_usages"("target_template_version_id");
CREATE INDEX "ix_e_booklet_hotspot_preset_usages_target_hotspot" ON "e_booklet_hotspot_preset_usages"("target_hotspot_id");
CREATE INDEX "ix_e_booklet_hotspot_preset_usages_used_by" ON "e_booklet_hotspot_preset_usages"("used_by");

ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_asset_file_id_fkey" FOREIGN KEY ("asset_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_source_template_id_fkey" FOREIGN KEY ("source_template_id") REFERENCES "e_booklet_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_source_template_version_id_fkey" FOREIGN KEY ("source_template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_source_hotspot_id_fkey" FOREIGN KEY ("source_hotspot_id") REFERENCES "e_booklet_hotspots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_presets" ADD CONSTRAINT "e_booklet_hotspot_presets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "e_booklet_hotspot_preset_usages" ADD CONSTRAINT "e_booklet_hotspot_preset_usages_preset_id_fkey" FOREIGN KEY ("preset_id") REFERENCES "e_booklet_hotspot_presets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_preset_usages" ADD CONSTRAINT "e_booklet_hotspot_preset_usages_target_template_id_fkey" FOREIGN KEY ("target_template_id") REFERENCES "e_booklet_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_preset_usages" ADD CONSTRAINT "e_booklet_hotspot_preset_usages_target_template_version_id_fkey" FOREIGN KEY ("target_template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_preset_usages" ADD CONSTRAINT "e_booklet_hotspot_preset_usages_target_hotspot_id_fkey" FOREIGN KEY ("target_hotspot_id") REFERENCES "e_booklet_hotspots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "e_booklet_hotspot_preset_usages" ADD CONSTRAINT "e_booklet_hotspot_preset_usages_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
