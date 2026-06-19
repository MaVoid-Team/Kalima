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
