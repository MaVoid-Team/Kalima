-- CreateEnum
CREATE TYPE "field_type_enum" AS ENUM ('text', 'number', 'date', 'image');

-- AlterTable
ALTER TABLE "required_field_definitions" ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(6),
ADD COLUMN     "updated_at" TIMESTAMP(6),
DROP COLUMN "field_type",
ADD COLUMN     "field_type" "field_type_enum" NOT NULL DEFAULT 'text';
