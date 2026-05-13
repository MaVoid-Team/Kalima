UPDATE "samples" AS s
SET "thumbnail_url" = i."url"
FROM "products" AS p
JOIN "images" AS i ON i."id" = p."thumbnail_id"
WHERE s."product_id" = p."id"
  AND s."thumbnail_url" IS NULL
  AND i."url" IS NOT NULL;
