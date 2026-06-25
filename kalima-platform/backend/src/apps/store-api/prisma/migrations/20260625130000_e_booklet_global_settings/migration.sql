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
  preview_page_limit INTEGER NOT NULL DEFAULT 10,
  device_reset_policy TEXT,
  notify_admins_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  notify_teacher_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  notify_admins_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  notify_teacher_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  notify_admins_on_access_code_redemption BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INTEGER,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6)
);

ALTER TABLE e_booklet_global_settings
  ADD COLUMN IF NOT EXISTS id INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS default_invite_quota INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_access_duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS default_invite_expiration_days INTEGER,
  ADD COLUMN IF NOT EXISTS default_delivery_notes TEXT,
  ADD COLUMN IF NOT EXISTS default_student_marketing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_internal_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_access_code_kind VARCHAR(20) NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS max_bulk_access_codes INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS default_access_code_expiration_days INTEGER,
  ADD COLUMN IF NOT EXISTS require_terms_for_code_generation BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS default_allowed_devices_per_student INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS default_allowed_devices_per_teacher INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS preview_page_limit INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS device_reset_policy TEXT,
  ADD COLUMN IF NOT EXISTS notify_admins_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_teacher_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_admins_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_teacher_on_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_admins_on_access_code_redemption BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_by INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'e_booklet_global_settings'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE e_booklet_global_settings
      ADD CONSTRAINT e_booklet_global_settings_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_global_settings_singleton'
  ) THEN
    ALTER TABLE e_booklet_global_settings
      ADD CONSTRAINT ck_e_booklet_global_settings_singleton CHECK (id = 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_global_settings_nonnegative'
  ) THEN
    ALTER TABLE e_booklet_global_settings
      ADD CONSTRAINT ck_e_booklet_global_settings_nonnegative CHECK (
        default_invite_quota >= 0
        AND (default_access_duration_days IS NULL OR default_access_duration_days >= 0)
        AND (default_invite_expiration_days IS NULL OR default_invite_expiration_days >= 0)
        AND default_student_marketing_price >= 0
        AND default_internal_price >= 0
        AND max_bulk_access_codes > 0
        AND (default_access_code_expiration_days IS NULL OR default_access_code_expiration_days >= 0)
        AND default_allowed_devices_per_student > 0
        AND default_allowed_devices_per_teacher > 0
        AND preview_page_limit BETWEEN 1 AND 200
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_e_booklet_global_settings_code_kind'
  ) THEN
    ALTER TABLE e_booklet_global_settings
      ADD CONSTRAINT ck_e_booklet_global_settings_code_kind CHECK (default_access_code_kind IN ('paid', 'free'));
  END IF;
END $$;

INSERT INTO e_booklet_global_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
