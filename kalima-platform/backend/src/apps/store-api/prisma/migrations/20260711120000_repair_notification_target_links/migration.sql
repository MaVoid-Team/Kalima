-- Keep historical notifications navigable after the e-booklet workspace routes changed.
UPDATE "notifications"
SET "target_link" = '/teacher/e-booklets'
WHERE "target_link" ~ '^/teacher/e-booklets/milestones/[^/?]+(?:[?].*)?$';

UPDATE "notifications"
SET "target_link" = '/admin/e-booklets/settings/terms-milestones'
WHERE "target_link" ~ '^/admin/e-booklets/milestones/[^/?]+(?:[?].*)?$';

UPDATE "notifications"
SET "target_link" = regexp_replace(
  "target_link",
  '^/admin/e-booklets/access-codes',
  '/admin/e-booklets/access'
)
WHERE "target_link" ~ '^/admin/e-booklets/access-codes(?:[?]|$)';
