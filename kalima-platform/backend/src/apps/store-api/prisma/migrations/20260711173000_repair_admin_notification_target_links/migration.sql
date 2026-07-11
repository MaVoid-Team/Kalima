-- Generic role notifications are administrative notifications, so their legacy targets
-- must resolve to the protected admin detail routes rather than public paths that do not exist.
UPDATE "notifications"
SET "target_link" = regexp_replace("target_link", '^/orders/', '/admin/orders/')
WHERE "target_link" ~ '^/orders/[^/?]+(?:[?].*)?$';

UPDATE "notifications"
SET "target_link" = regexp_replace("target_link", '^/users/', '/admin/users/')
WHERE "target_link" ~ '^/users/[^/?]+(?:[?].*)?$';
