# Product API Documentation

## Base URL

```
/api/v2/products
```

---

## Table of Contents

1. Public Endpoints (no auth required)
   - Get all products
   - Get product by ID
   - Get product gallery
   - Get product required fields
2. Admin / SubAdmin Endpoints
   - Create product (multipart/form-data)
   - Update product
   - Delete product (soft delete)
   - Thumbnail upload / remove
   - Gallery add / update / remove
   - Attach / detach categories
   - Attach / detach required fields
3. Data model
4. Business rules
5. Common response types
6. Error codes

---

## Authentication

Most read endpoints are public (no auth). Admin operations require **Admin** or **SubAdmin** role (JWT + role check).

---

## Public Endpoints (no auth required)

### Get all products

List products with optional filters and pagination.

- Endpoint: `GET /`
- Query parameters:
  - `is_archived` (boolean) — filter archived products
  - `category_id` (int) — filter by category
  - `search` (string) — text search on title/serial
  - `page` (int) — page number (default: 1)
  - `limit` (int) — items per page (default: 20)
- Auth: none

Success (200):

```json
{
  "success": true,
  "data": {
    "products": [
      /* product objects */
    ],
    "total": 123,
    "page": 1,
    "limit": 20
  }
}
```

---

### Get product by ID

Returns a product with linked categories, gallery entries and any required-field definitions.

- Endpoint: `GET /:id`
- URL params: `id` (int)
- Auth: none

Success (200):

```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Algebra Book",
    "price": "100.00",
    "thumbnail_url": "/uploads/images/abc.webp",
    "categories": [{ "id": 1, "title": "Books" }],
    "product_gallery": [
      /* entries */
    ]
  }
}
```

---

### Get product gallery

Return product gallery entries. Query `?includeInactive=true` to include inactive images.

- Endpoint: `GET /:id/gallery`
- Auth: none

---

### Get product required fields

Returns required-field definitions attached to the product (used for checkout validations).

- Endpoint: `GET /:id/required-fields`
- Auth: none

---

## Admin / SubAdmin Endpoints

> All endpoints below require role = Admin or SubAdmin.

### Create product

Create a product. Supports `multipart/form-data` with an optional `thumbnail` file and a JSON `category_ids` array (send as string when using form-data).

- Endpoint: `POST /`
- Content-Type: `multipart/form-data`
- Fields:
  - `title` (string, required)
  - `price` (number, required)
  - `type` ("Book" | "Product") optional
  - `description`, `serial`, `sample_url`, `coupon_id` optional
  - `category_ids` (JSON array of ints) optional — when sending as form-data provide the JSON string
  - `thumbnail` (file) optional — form field name `thumbnail`

Success (201): returns the created product object.

**Example (form-data):**

- field `title` = "Algebra Book"
- field `price` = 100
- field `category_ids` = "[1,3]"
- file `thumbnail` = (image)

---

### Update product

Patch product fields (all optional).

- Endpoint: `PATCH /:id`
- Body: JSON — any of `title`, `description`, `type`, `price`, `price_after_discount`, `serial`, `sample_url`, `coupon_id`, `is_archived`
- Auth: Admin/SubAdmin

---

### Delete product (soft delete)

Sets `deleted_at` and removes product from public lists.

- Endpoint: `DELETE /:id`
- Auth: Admin/SubAdmin

---

### Thumbnail upload / remove

- Upload thumbnail: POST `/:id/thumbnail` (form field `thumbnail`, Admin only)
- Remove thumbnail: DELETE `/:id/thumbnail` (Admin only)

Success returns the updated product object.

---

### Gallery

- Add images: POST `/:id/gallery` (multipart `gallery` files, 1–10 images). Query `?compress=false` to skip compression. Admin only.
- Get gallery: GET `/:id/gallery` (public)
- Update gallery entry: PATCH `/:id/gallery/:galleryId` (body: `{ sort_order?: number, active?: boolean }`) — Admin only
- Remove gallery entry: DELETE `/:id/gallery/:galleryId` — Admin only

---

### Categories management

- Attach categories: POST `/:id/categories` — body `{ category_ids: [1,2] }` — Admin only
- Detach category: DELETE `/:id/categories/:categoryId` — Admin only

---

### Required fields (product-level)

- Attach required fields: POST `/:id/required-fields` — body: `{ fields: [{ field_definition_id, is_required? }] }` — Admin only
- Get required fields: GET `/:id/required-fields` — public
- Detach required field: DELETE `/:id/required-fields/:fieldDefinitionId` — Admin only

---

## Data model (selected fields)

Product object (selected fields):

```json
{
  "id": number,
  "title": string,
  "description": string | null,
  "type": "Book" | "Product",
  "price": string,                // decimal as string
  "price_after_discount": string | null,
  "serial": string | null,
  "thumbnail_id": number | null,
  "sample_url": string | null,
  "coupon_id": number | null,
  "is_archived": boolean,
  "created_at": string,
  "updated_at": string | null
}
```

Related objects:

- `product_gallery` — gallery entries with `image` metadata
- `product_categories` — linked category IDs
- `product_required_fields` — required-field definitions

---

## Business rules

- Max gallery images per request: 10
- Product thumbnail and gallery images are stored via the `imageService` and saved under `/uploads/images`.
- `category_ids` may be attached on create; invalid category IDs return 404.
- Setting `is_archived=true` hides product from public listings; archiving does not delete DB record.
- Required fields attached to product are validated at checkout time (client must fill them before purchase).

---

## Common response types

- Standard product response: `{ success: true, data: product }`
- List response: `{ success: true, products: [...], total, page, limit }`
- Gallery list: `{ success: true, results: N, data: [ galleryEntry ] }`

---

## Error codes

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Bad Request — validation or invalid ID                   |
| 401    | Unauthorized — missing/invalid token (admin endpoints)   |
| 403    | Forbidden — insufficient role                            |
| 404    | Not Found — product / category / gallery entry not found |
| 409    | Conflict — duplicate serial or unique constraint         |
| 422    | Validation error (DTO constraints)                       |

---

If you want this converted into an OpenAPI spec or added to the Postman collection, I can add examples next.
