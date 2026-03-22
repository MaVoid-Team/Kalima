-- Ensure required_field_definitions.is_deleted exists in the kalima schema.
-- Previous migration may have run against a different default schema in some environments.

ALTER TABLE "kalima"."required_field_definitions"
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;
