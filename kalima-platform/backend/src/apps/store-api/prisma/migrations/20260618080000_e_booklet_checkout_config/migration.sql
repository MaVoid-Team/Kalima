-- Unify e-booklet checkout configuration with normal store payment methods and required fields.

ALTER TABLE "e_booklet_purchases"
  ADD COLUMN IF NOT EXISTS "payment_method_id" INTEGER;

CREATE TABLE IF NOT EXISTS "e_booklet_template_payment_methods" (
  "id" SERIAL PRIMARY KEY,
  "template_id" INTEGER NOT NULL,
  "payment_method_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "e_booklet_template_payment_methods_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "e_booklet_template_payment_methods_payment_method_id_fkey"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "e_booklet_template_payment_methods_template_id_payment_method_id_key"
  ON "e_booklet_template_payment_methods"("template_id", "payment_method_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_template_payment_methods_template"
  ON "e_booklet_template_payment_methods"("template_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_template_payment_methods_method"
  ON "e_booklet_template_payment_methods"("payment_method_id");

CREATE TABLE IF NOT EXISTS "e_booklet_template_required_fields" (
  "id" SERIAL PRIMARY KEY,
  "template_id" INTEGER NOT NULL,
  "field_definition_id" INTEGER NOT NULL,
  "is_required" BOOLEAN DEFAULT true,
  "active" BOOLEAN DEFAULT true,
  CONSTRAINT "e_booklet_template_required_fields_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "e_booklet_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "e_booklet_template_required_fields_field_definition_id_fkey"
    FOREIGN KEY ("field_definition_id") REFERENCES "required_field_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "e_booklet_template_required_fields_template_id_field_definition_id_key"
  ON "e_booklet_template_required_fields"("template_id", "field_definition_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_template_required_fields_active"
  ON "e_booklet_template_required_fields"("template_id", "is_required", "active");

CREATE TABLE IF NOT EXISTS "e_booklet_purchase_required_fields" (
  "id" SERIAL PRIMARY KEY,
  "purchase_id" INTEGER NOT NULL,
  "field_definition_id" INTEGER NOT NULL,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "e_booklet_purchase_required_fields_purchase_id_fkey"
    FOREIGN KEY ("purchase_id") REFERENCES "e_booklet_purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "e_booklet_purchase_required_fields_field_definition_id_fkey"
    FOREIGN KEY ("field_definition_id") REFERENCES "required_field_definitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "e_booklet_purchase_required_fields_purchase_id_field_definition_id_key"
  ON "e_booklet_purchase_required_fields"("purchase_id", "field_definition_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_purchase_required_fields_purchase"
  ON "e_booklet_purchase_required_fields"("purchase_id");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_purchases_payment_method"
  ON "e_booklet_purchases"("payment_method_id");

ALTER TABLE "e_booklet_purchases"
  ADD CONSTRAINT "e_booklet_purchases_payment_method_id_fkey"
  FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
