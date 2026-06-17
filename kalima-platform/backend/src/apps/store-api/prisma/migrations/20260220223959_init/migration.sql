-- CreateEnum
CREATE TYPE "auth_provider_enum" AS ENUM ('local', 'firebase', 'google', 'facebook');

-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "portal_enum" AS ENUM ('store', 'academy');

-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('Admin', 'SubAdmin', 'Teacher', 'Student', 'Parent', 'Lecturer', 'Moderator', 'Assistant');

-- CreateEnum
CREATE TYPE "field_type_enum" AS ENUM ('text', 'number', 'date', 'image');

-- CreateEnum
CREATE TYPE "image_mime_type_enum" AS ENUM ('jpeg', 'png', 'webp', 'gif', 'svg', 'avif');

-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('Book', 'Product');

-- CreateEnum
CREATE TYPE "location_type_enum" AS ENUM ('School', 'Center');

-- CreateTable
CREATE TABLE "auth_identities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "auth_provider_enum" NOT NULL,
    "provider_user_id" VARCHAR NOT NULL,
    "provider_email" VARCHAR,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "user_id" INTEGER NOT NULL,
    "views" INTEGER DEFAULT 0,
    "total_spent" DECIMAL(14,2) DEFAULT 0,
    "number_of_purchases" INTEGER DEFAULT 0,
    "successful_invites" INTEGER DEFAULT 0,
    "monthly_confirmed_count" INTEGER DEFAULT 0,
    "last_confirmed_count_update" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "portal" "portal_enum" NOT NULL,
    "role" "role_enum" NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "mongo_id" TEXT,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR,
    "password" VARCHAR,
    "phone" VARCHAR,
    "gender" "gender_enum",
    "is_email_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "secondary_phone" VARCHAR,
    "profile_pic_url" TEXT,
    "password_changed_at" TIMESTAMP(6),
    "confirmed" BOOLEAN DEFAULT false,
    "hasPromoCode" BOOLEAN DEFAULT false,
    "hasUsedPromoCode" BOOLEAN DEFAULT false,
    "email_verified_at" TIMESTAMPTZ(6),
    "role" "role_enum",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "revoked" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistants" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lecturer_user_id" INTEGER NOT NULL,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "government_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers" (
    "user_id" INTEGER NOT NULL,
    "bio" TEXT,
    "expertise" TEXT,

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_children" (
    "id" SERIAL NOT NULL,
    "parent_user_id" INTEGER NOT NULL,
    "student_user_id" INTEGER NOT NULL,

    CONSTRAINT "parent_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "user_id" INTEGER NOT NULL,
    "government_id" INTEGER,
    "zone_id" INTEGER,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media" (
    "id" SERIAL NOT NULL,
    "teacher_user_id" INTEGER NOT NULL,
    "site_id" INTEGER,
    "url" TEXT NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "user_id" INTEGER NOT NULL,
    "level_id" INTEGER,
    "government_id" INTEGER,
    "zone_id" INTEGER,
    "parent_phone_number" VARCHAR(255),
    "sequenced_id" INTEGER,
    "faction" VARCHAR(255),

    CONSTRAINT "students_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "user_id" INTEGER NOT NULL,
    "serial" VARCHAR(255),
    "is_primary" BOOLEAN DEFAULT false,
    "is_preparatory" BOOLEAN DEFAULT false,
    "is_secondary" BOOLEAN DEFAULT false,
    "government_id" INTEGER,
    "zone_id" INTEGER,
    "subject_id" INTEGER,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "teaches_at" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "location_name" VARCHAR(255),
    "location_type" "location_type_enum",
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "teaches_at_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "government_id" INTEGER NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "description" TEXT DEFAULT '',
    "parent_id" INTEGER,
    "mongo_id" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_amount" DECIMAL(10,2) DEFAULT 0,
    "discount_percentage" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "starts_at" TIMESTAMP(6),
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "mongo_id" TEXT,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "purchase_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_required_fields" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "field_definition_id" INTEGER NOT NULL,
    "is_required" BOOLEAN DEFAULT true,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "product_required_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "product_type_enum" NOT NULL DEFAULT 'Product',
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "price_after_discount" DECIMAL(10,2),
    "serial" VARCHAR(255),
    "thumbnail_id" INTEGER,
    "sample_url" TEXT,
    "coupon_id" INTEGER,
    "is_archived" BOOLEAN DEFAULT false,
    "mongo_id" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "required_field_definitions" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "field_type" "field_type_enum" NOT NULL DEFAULT 'text',
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "required_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "coupon_id" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_at_add" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "final_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "required_fields_filled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item_required_fields" (
    "id" SERIAL NOT NULL,
    "cart_item_id" INTEGER NOT NULL,
    "field_definition_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "cart_item_required_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_method_id" INTEGER,
    "payment_screenshot_id" INTEGER,
    "watermark_id" INTEGER,
    "purchase_serial" VARCHAR(255),
    "number_transferred_from" VARCHAR(50),
    "payment_number" VARCHAR(50),
    "notes" TEXT,
    "admin_notes" TEXT,
    "admin_note_by" INTEGER,
    "received_at" TIMESTAMP(6),
    "received_by" INTEGER,
    "confirmed_at" TIMESTAMP(6),
    "confirmed_by" INTEGER,
    "returned_at" TIMESTAMP(6),
    "returned_by" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price_at_purchase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "required_fields_filled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_item_required_fields" (
    "id" SERIAL NOT NULL,
    "purchase_item_id" INTEGER NOT NULL,
    "field_definition_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "purchase_item_required_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "image_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" "image_mime_type_enum" NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_gallery" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    "sort_order" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_user_id_key" ON "auth_identities"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_portal_role_key" ON "user_roles"("user_id", "portal", "role");

-- CreateIndex
CREATE UNIQUE INDEX "users_mongo_id_key" ON "users"("mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ix_users_mongo_id" ON "users"("mongo_id");

-- CreateIndex
CREATE INDEX "ix_refresh_tokens_user" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "government_title_key" ON "government"("title");

-- CreateIndex
CREATE UNIQUE INDEX "levels_title_key" ON "levels"("title");

-- CreateIndex
CREATE UNIQUE INDEX "parent_children_parent_user_id_student_user_id_key" ON "parent_children"("parent_user_id", "student_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sites_title_key" ON "sites"("title");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_title_key" ON "subjects"("title");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_serial_key" ON "teachers"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "zones_title_government_id_key" ON "zones"("title", "government_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_user_id_key" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "ix_email_verification_tokens_hash" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_user_id_key" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "ix_password_reset_tokens_hash" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "categories_mongo_id_key" ON "categories"("mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_product_id_category_id_key" ON "product_categories"("product_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_mongo_id_key" ON "coupons"("mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_user_id_coupon_id_key" ON "coupon_usages"("user_id", "coupon_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_required_fields_product_id_field_definition_id_key" ON "product_required_fields"("product_id", "field_definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_mongo_id_key" ON "products"("mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "samples_product_id_key" ON "samples"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "required_field_definitions_label_key" ON "required_field_definitions"("label");

-- CreateIndex
CREATE UNIQUE INDEX "product_gallery_product_id_image_id_key" ON "product_gallery"("product_id", "image_id");

-- AddForeignKey
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_lecturer_user_id_fkey" FOREIGN KEY ("lecturer_user_id") REFERENCES "lecturers"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parent_children" ADD CONSTRAINT "parent_children_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "parents"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parent_children" ADD CONSTRAINT "parent_children_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "students"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_government_id_fkey" FOREIGN KEY ("government_id") REFERENCES "government"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "social_media" ADD CONSTRAINT "social_media_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "social_media" ADD CONSTRAINT "social_media_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_government_id_fkey" FOREIGN KEY ("government_id") REFERENCES "government"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_government_id_fkey" FOREIGN KEY ("government_id") REFERENCES "government"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teaches_at" ADD CONSTRAINT "teaches_at_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_government_id_fkey" FOREIGN KEY ("government_id") REFERENCES "government"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_required_fields" ADD CONSTRAINT "product_required_fields_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "required_field_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_required_fields" ADD CONSTRAINT "product_required_fields_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item_required_fields" ADD CONSTRAINT "cart_item_required_fields_cart_item_id_fkey" FOREIGN KEY ("cart_item_id") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item_required_fields" ADD CONSTRAINT "cart_item_required_fields_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "required_field_definitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_returned_by_fkey" FOREIGN KEY ("returned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_payment_screenshot_id_fkey" FOREIGN KEY ("payment_screenshot_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_watermark_id_fkey" FOREIGN KEY ("watermark_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_item_required_fields" ADD CONSTRAINT "purchase_item_required_fields_purchase_item_id_fkey" FOREIGN KEY ("purchase_item_id") REFERENCES "purchase_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_item_required_fields" ADD CONSTRAINT "purchase_item_required_fields_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "required_field_definitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_gallery" ADD CONSTRAINT "product_gallery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_gallery" ADD CONSTRAINT "product_gallery_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
