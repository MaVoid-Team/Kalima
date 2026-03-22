-- Follow-up safe catch-up migration.
-- Align required_field_definitions with Prisma schema.

ALTER TABLE "required_field_definitions"
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;
