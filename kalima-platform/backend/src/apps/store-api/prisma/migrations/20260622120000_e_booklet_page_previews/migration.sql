CREATE TABLE "e_booklet_page_previews" (
  "id" SERIAL PRIMARY KEY,
  "document_file_id" INTEGER NOT NULL,
  "template_version_id" INTEGER,
  "page_number" INTEGER NOT NULL,
  "image_file_id" INTEGER NOT NULL,
  "width_px" INTEGER NOT NULL,
  "height_px" INTEGER NOT NULL,
  "format" VARCHAR(20) NOT NULL DEFAULT 'webp',
  "size_key" VARCHAR(40) NOT NULL DEFAULT 'default',
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "e_booklet_page_previews_document_file_id_fkey"
    FOREIGN KEY ("document_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "e_booklet_page_previews_template_version_id_fkey"
    FOREIGN KEY ("template_version_id") REFERENCES "e_booklet_template_versions"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT "e_booklet_page_previews_image_file_id_fkey"
    FOREIGN KEY ("image_file_id") REFERENCES "e_booklet_file_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "ux_e_booklet_page_previews_document_page_size"
  ON "e_booklet_page_previews"("document_file_id", "page_number", "size_key");

CREATE INDEX "ix_e_booklet_page_previews_version_page"
  ON "e_booklet_page_previews"("template_version_id", "page_number");

CREATE INDEX "ix_e_booklet_page_previews_image_file"
  ON "e_booklet_page_previews"("image_file_id");
