-- Create appreciation page table
CREATE TABLE "user_appreciation_pages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_appreciation_pages_pkey" PRIMARY KEY ("id")
);

-- Create appreciation comments table
CREATE TABLE "user_appreciation_comments" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "author_name" VARCHAR(80) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_appreciation_comments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_appreciation_pages_user_id_key" ON "user_appreciation_pages"("user_id");
CREATE UNIQUE INDEX "user_appreciation_pages_token_key" ON "user_appreciation_pages"("token");
CREATE INDEX "ix_user_appreciation_comments_page_created" ON "user_appreciation_comments"("page_id", "created_at" DESC);

ALTER TABLE "user_appreciation_pages"
ADD CONSTRAINT "user_appreciation_pages_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "user_appreciation_comments"
ADD CONSTRAINT "user_appreciation_comments_page_id_fkey"
FOREIGN KEY ("page_id") REFERENCES "user_appreciation_pages"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;
