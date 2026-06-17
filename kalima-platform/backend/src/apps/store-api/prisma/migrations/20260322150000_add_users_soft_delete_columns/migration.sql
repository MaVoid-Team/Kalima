-- Add missing soft-delete columns for users table to match Prisma schema
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;
