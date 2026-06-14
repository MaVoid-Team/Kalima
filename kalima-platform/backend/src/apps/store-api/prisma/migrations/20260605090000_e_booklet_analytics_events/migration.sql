CREATE TABLE IF NOT EXISTS "e_booklet_analytics_events" (
  "id" SERIAL PRIMARY KEY,
  "event_type" VARCHAR(80) NOT NULL,
  "teacher_id" INTEGER,
  "student_id" INTEGER,
  "anonymous_session_id" VARCHAR(128),
  "template_id" INTEGER,
  "booklet_instance_id" INTEGER,
  "invite_id" INTEGER,
  "access_id" INTEGER,
  "purchase_id" INTEGER,
  "source" VARCHAR(40),
  "marketing_price_snapshot" DECIMAL(10, 2),
  "internal_price_snapshot" DECIMAL(10, 2),
  "metadata" JSONB,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_instance_event_created"
  ON "e_booklet_analytics_events" ("booklet_instance_id", "event_type", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_teacher_created"
  ON "e_booklet_analytics_events" ("teacher_id", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_student_created"
  ON "e_booklet_analytics_events" ("student_id", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_invite_created"
  ON "e_booklet_analytics_events" ("invite_id", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_anon_created"
  ON "e_booklet_analytics_events" ("anonymous_session_id", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_source_created"
  ON "e_booklet_analytics_events" ("source", "created_at");
CREATE INDEX IF NOT EXISTS "ix_e_booklet_analytics_event_created"
  ON "e_booklet_analytics_events" ("event_type", "created_at");
