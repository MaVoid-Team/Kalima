-- Fix schema drift: align database state with Prisma schema
-- All statements use IF EXISTS / IF NOT EXISTS for idempotency

-- Fix sample_sections.created_at default
ALTER TABLE "sample_sections" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Fix samples URL columns type from VARCHAR(255) to TEXT
ALTER TABLE "samples" ALTER COLUMN "high_quality_url" SET DATA TYPE TEXT;
ALTER TABLE "samples" ALTER COLUMN "low_quality_url" SET DATA TYPE TEXT;
