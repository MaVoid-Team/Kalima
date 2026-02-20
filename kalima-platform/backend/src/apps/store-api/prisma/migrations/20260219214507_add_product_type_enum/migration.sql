-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('Book', 'Product');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "type" "product_type_enum" NOT NULL DEFAULT 'Product';
