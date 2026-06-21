CREATE TABLE IF NOT EXISTS e_booklet_global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  default_invite_quota INTEGER NOT NULL DEFAULT 0,
  default_access_duration_days INTEGER,
  default_invite_expiration_days INTEGER,
  default_delivery_notes TEXT,
  default_student_marketing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  default_internal_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  default_access_code_kind VARCHAR(20) NOT NULL DEFAULT 'paid',
  max_bulk_access_codes INTEGER NOT NULL DEFAULT 100,
  default_access_code_expiration_days INTEGER,
  require_terms_for_code_generation BOOLEAN NOT NULL DEFAULT TRUE,
  default_allowed_devices_per_student INTEGER NOT NULL DEFAULT 1,
  default_allowed_devices_per_teacher INTEGER NOT NULL DEFAULT 2,
  device_reset_policy TEXT,
  notify_admins_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  notify_teacher_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  notify_admins_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  notify_teacher_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  notify_admins_on_access_code_redemption BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INTEGER,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6),
  CONSTRAINT ck_e_booklet_global_settings_singleton CHECK (id = 1),
  CONSTRAINT ck_e_booklet_global_settings_nonnegative CHECK (
    default_invite_quota >= 0
    AND (default_access_duration_days IS NULL OR default_access_duration_days >= 0)
    AND (default_invite_expiration_days IS NULL OR default_invite_expiration_days >= 0)
    AND default_student_marketing_price >= 0
    AND default_internal_price >= 0
    AND max_bulk_access_codes > 0
    AND (default_access_code_expiration_days IS NULL OR default_access_code_expiration_days >= 0)
    AND default_allowed_devices_per_student > 0
    AND default_allowed_devices_per_teacher > 0
  ),
  CONSTRAINT ck_e_booklet_global_settings_code_kind CHECK (default_access_code_kind IN ('paid', 'free'))
);

CREATE TABLE IF NOT EXISTS e_booklet_hotspot_presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  type e_booklet_hotspot_type_enum NOT NULL,
  shape e_booklet_hotspot_shape_enum NOT NULL DEFAULT 'circle',
  width_percent NUMERIC(6, 3),
  height_percent NUMERIC(6, 3),
  radius_percent NUMERIC(6, 3) NOT NULL DEFAULT 1.8,
  title VARCHAR(255),
  text_content TEXT,
  asset_file_id INTEGER,
  trigger_type e_booklet_hotspot_trigger_type_enum NOT NULL DEFAULT 'click',
  display_behavior JSONB,
  content_json JSONB,
  interaction_json JSONB,
  default_page_number INTEGER,
  default_x_percent NUMERIC(6, 3),
  default_y_percent NUMERIC(6, 3),
  source_template_id INTEGER,
  source_template_version_id INTEGER,
  source_hotspot_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6),
  CONSTRAINT fk_e_booklet_hotspot_presets_asset FOREIGN KEY (asset_file_id) REFERENCES e_booklet_file_assets(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_presets_source_template FOREIGN KEY (source_template_id) REFERENCES e_booklet_templates(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_presets_source_version FOREIGN KEY (source_template_version_id) REFERENCES e_booklet_template_versions(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_presets_source_hotspot FOREIGN KEY (source_hotspot_id) REFERENCES e_booklet_hotspots(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_presets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_presets_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_active ON e_booklet_hotspot_presets(is_active);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_type ON e_booklet_hotspot_presets(type);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_created_by ON e_booklet_hotspot_presets(created_by);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_source_template ON e_booklet_hotspot_presets(source_template_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_source_version ON e_booklet_hotspot_presets(source_template_version_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_presets_source_hotspot ON e_booklet_hotspot_presets(source_hotspot_id);

CREATE TABLE IF NOT EXISTS e_booklet_hotspot_preset_usages (
  id SERIAL PRIMARY KEY,
  preset_id INTEGER NOT NULL,
  target_template_id INTEGER,
  target_template_version_id INTEGER NOT NULL,
  target_hotspot_id INTEGER NOT NULL,
  used_by INTEGER NOT NULL,
  used_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_e_booklet_hotspot_preset_usages_preset FOREIGN KEY (preset_id) REFERENCES e_booklet_hotspot_presets(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_preset_usages_template FOREIGN KEY (target_template_id) REFERENCES e_booklet_templates(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_preset_usages_version FOREIGN KEY (target_template_version_id) REFERENCES e_booklet_template_versions(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_preset_usages_hotspot FOREIGN KEY (target_hotspot_id) REFERENCES e_booklet_hotspots(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_e_booklet_hotspot_preset_usages_user FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_preset ON e_booklet_hotspot_preset_usages(preset_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_template ON e_booklet_hotspot_preset_usages(target_template_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_version ON e_booklet_hotspot_preset_usages(target_template_version_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_hotspot ON e_booklet_hotspot_preset_usages(target_hotspot_id);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_used_by ON e_booklet_hotspot_preset_usages(used_by);
CREATE INDEX IF NOT EXISTS ix_e_booklet_hotspot_preset_usages_used_at ON e_booklet_hotspot_preset_usages(used_at);
