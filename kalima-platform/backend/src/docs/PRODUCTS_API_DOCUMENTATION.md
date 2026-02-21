# Product API Documentation

## Base URL

```
/api/v2/products
```

---

## Table of Contents

1. [Public Endpoints](#public-endpoints-no-auth-required)
   - [Get All Products](#get-all-products)
   - [Get Product by ID](#get-product-by-id)
   - [Get Product Gallery](#get-product-gallery)
   - [Get Product Required Fields](#get-product-required-fields)
2. [Admin / SubAdmin Endpoints](#admin--subadmin-endpoints)
   - [Create Product](#create-product)
   - [Update Product](#update-product)
   - [Delete Product (Soft Delete)](#delete-product-soft-delete)
   - [Upload Thumbnail](#upload-thumbnail)
   - [Remove Thumbnail](#remove-thumbnail)
   - [Add Gallery Images](#add-gallery-images)
   - [Update Gallery Entry](#update-gallery-entry)
   - [Remove Gallery Entry](#remove-gallery-entry)
   - [Attach Categories](#attach-categories)
   - [Detach Category](#detach-category)
   - [Attach Required Fields](#attach-required-fields)
   - [Detach Required Field](#detach-required-field)
3. [Enums & Types](#enums--types)
4. [Business Rules](#business-rules)
5. [Common Response Types](#common-response-types)
6. [Error Codes](#error-codes)

---

## Authentication

Most read endpoints are public (no auth). Admin operations require JWT authentication with **Admin** or **SubAdmin** role:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints (no auth required)

---

### Get All Products

Returns a paginated list of products with optional filters.

**Endpoint:** `GET /`  
**Auth Required:** No

**Query Parameters:**

| Param         | Type    | Default | Description                                  |
| ------------- | ------- | ------- | -------------------------------------------- |
| `is_archived` | boolean | —       | Filter by archived status                    |
| `category_id` | number  | —       | Filter by category ID                        |
| `search`      | string  | —       | Text search on title and description         |
| `page`        | number  | 1       | Page number                                  |
| `limit`       | number  | 20      | Items per page                               |

**Example:** `GET /products?search=algebra&page=1&limit=10`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Algebra Book",
      "description": "A comprehensive guide to algebra",
      "type": "Book",
      "price": "100.00",
      "price_after_discount": null,
      "serial": "ALG-101",
      "sample_url": null,
      "coupon_id": null,
      "is_archived": false,
      "thumbnail_image": {
        "id": 5,
        "url": "/uploads/images/abc.webp",
        "original_name": "abc.webp",
        "mime_type": "webp",
        "size": 12345,
        "created_at": "2026-02-20T10:00:00.000Z"
      },
      "product_categories": [
        { "id": 12, "category_id": 1, "categories": { "id": 1, "title": "Books" } }
      ],
      "product_gallery": [],
      "product_required_fields": [],
      "samples": null,
      "coupons": null,
      "created_at": "2026-02-20T10:00:00.000Z",
      "updated_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### Get Product by ID

Returns a single product with linked categories, gallery entries, sample, coupon, and required-field definitions. Returns 404 if the product does not exist or has been soft-deleted.

**Endpoint:** `GET /:id`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Algebra Book",
    "description": "A comprehensive guide to algebra",
    "type": "Book",
    "price": "100.00",
    "price_after_discount": null,
    "serial": "ALG-101",
    "sample_url": null,
    "coupon_id": null,
    "is_archived": false,
    "thumbnail_image": {
      "id": 5,
      "url": "/uploads/images/abc.webp",
      "original_name": "abc.webp",
      "mime_type": "webp",
      "size": 12345,
      "created_at": "2026-02-20T10:00:00.000Z"
    },
    "product_categories": [
      { "id": 12, "category_id": 1, "categories": { "id": 1, "title": "Books" } }
    ],
    "product_gallery": [
      { "id": 3, "sort_order": 0, "active": true, "images": { "id": 8, "url": "/uploads/images/gallery1.webp" } }
    ],
    "product_required_fields": [
      { "id": 2, "field_definition_id": 7, "required_field_definitions": { "id": 7, "label": "Student Name" } }
    ],
    "samples": {
      "id": 1,
      "url": "/uploads/samples/sample.pdf",
      "original_name": "sample.pdf",
      "mime_type": "application/pdf",
      "size": 204800,
      "created_at": "2026-02-20T10:00:00.000Z"
    },
    "coupons": null,
    "created_at": "2026-02-20T10:00:00.000Z",
    "updated_at": null
  }
}
```

**Error Responses:**

| Status | Message              | Condition                                 |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                        |
| 404    | `Product not found`  | Product does not exist or is soft-deleted |

---

### Get Product Thumbnail

Returns the thumbnail image details for a product. Returns 404 if the product does not exist or has no thumbnail.

**Endpoint:** `GET /:id/thumbnail`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "url": "/uploads/images/abc.webp",
    "original_name": "abc.webp",
    "mime_type": "webp",
    "size": 12345,
    "created_at": "2026-02-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                                  | Condition                                    |
| ------ | ---------------------------------------- | -------------------------------------------- |
| 400    | `Invalid product ID`                     | ID is not a number                           |
| 404    | `Product not found`                      | Product does not exist or is soft-deleted    |
| 404    | `Thumbnail not found for this product`   | Product has no thumbnail                     |

---

### Get Product Gallery

Returns gallery entries for a product. Optionally include inactive (hidden) entries.

**Endpoint:** `GET /:id/gallery`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Query Parameters:**

| Param             | Type    | Default | Description                        |
| ----------------- | ------- | ------- | ---------------------------------- |
| `includeInactive` | boolean | false   | Include deactivated gallery entries |

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "id": 3,
      "product_id": 10,
      "image_id": 8,
      "sort_order": 0,
      "active": true,
      "created_at": "2026-02-20T10:00:00.000Z",
      "images": {
        "id": 8,
        "url": "/uploads/images/gallery1.webp",
        "original_name": "gallery1.webp",
        "mime_type": "webp",
        "size": 54321,
        "created_at": "2026-02-20T10:00:00.000Z"
      }
    }
  ]
}
```

**Error Responses:**

| Status | Message              | Condition          |
| ------ | -------------------- | ------------------ |
| 400    | `Invalid product ID` | ID is not a number |

---

### Get Product Required Fields

Returns required-field definitions attached to the product (used for checkout validations).

**Endpoint:** `GET /:id/required-fields`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200):**

```json
{
  "success": true,
  "results": 1,
  "data": [
    {
      "id": 2,
      "product_id": 10,
      "field_definition_id": 7,
      "is_required": true,
      "active": true,
      "required_field_definitions": {
        "id": 7,
        "label": "Student Name",
        "field_type": "text",
        "active": true
      }
    }
  ]
}
```

**Error Responses:**

| Status | Message              | Condition                                 |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                        |
| 404    | `Product not found`  | Product does not exist or is soft-deleted |

> **Note:** An admin-only management endpoint also exists at `/api/v2/required-fields/products/:productId/fields` — see the required-fields docs.

---

## Admin / SubAdmin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** or **SubAdmin** role.

---

### Create Product

Creates a new product. Supports `multipart/form-data` with an optional `thumbnail` image and an optional `sample` PDF. The `category_ids` array must be sent as a JSON string when using form-data.

**Endpoint:** `POST /`  
**Auth Required:** Yes (Admin, SubAdmin)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string (required, max 255)",
  "price": "number (required, >= 0)",
  "type": "Book | Product (optional, default: Product)",
  "description": "string (optional)",
  "price_after_discount": "number (optional, >= 0)",
  "serial": "string (optional, max 255)",
  "sample_url": "string (optional)",
  "coupon_id": "number (optional, must reference existing coupon)",
  "category_ids": "JSON array of ints (optional, e.g. [1, 3])"
}
```

**File Fields:**

| Field       | Type  | Max Size | Description                  |
| ----------- | ----- | -------- | ---------------------------- |
| `thumbnail` | image | 150 MB   | Product thumbnail (optional) |
| `sample`    | PDF   | 150 MB   | Sample file (optional)       |

**Example — JSON body (no file upload):**

```json
{
  "title": "Algebra Book",
  "price": 100,
  "type": "Book",
  "description": "A comprehensive guide to algebra for students of all levels.",
  "category_ids": [5]
}
```

**Example — form-data (with file upload):**

| Field          | Value                   |
| -------------- | ----------------------- |
| `title`        | Algebra Book            |
| `price`        | 100                     |
| `type`         | Book                    |
| `category_ids` | [1,3]                   |
| `thumbnail`    | *(image file)*          |
| `sample`       | *(PDF file)*            |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 10,
    "title": "Algebra Book",
    "description": "A comprehensive guide to algebra",
    "type": "Book",
    "price": "100.00",
    "price_after_discount": null,
    "serial": null,
    "sample_url": null,
    "coupon_id": null,
    "is_archived": false,
    "thumbnail_image": null,
    "product_categories": [
      { "id": 1, "category_id": 5, "categories": { "id": 5, "title": "Mathematics" } }
    ],
    "product_gallery": [],
    "product_required_fields": [],
    "samples": null,
    "coupons": null,
    "created_at": "2026-02-20T10:00:00.000Z",
    "updated_at": null
  }
}
```

**Error Responses:**

| Status | Message                                              | Condition                     |
| ------ | ---------------------------------------------------- | ----------------------------- |
| 400    | `category_ids must be a valid JSON array of integers` | Malformed category_ids string |
| 404    | `Category ID(s) not found: 99`                       | Invalid category ID           |
| 404    | `Coupon not found`                                   | Invalid coupon_id             |
| 422    | Validation errors array                              | Invalid or missing fields     |

---

### Update Product

Updates one or more fields on an existing product. All fields are optional.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Request Body (all fields optional):**

```json
{
  "title": "string (max 255)",
  "description": "string",
  "type": "Book | Product",
  "price": "number (>= 0)",
  "price_after_discount": "number (>= 0)",
  "serial": "string (max 255)",
  "sample_url": "string",
  "coupon_id": "number",
  "is_archived": "boolean"
}
```

**Example — Update price and archive:**

```json
{
  "price": 75,
  "is_archived": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { "/* full product object */" }
}
```

**Error Responses:**

| Status | Message              | Condition                                 |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                        |
| 404    | `Product not found`  | Product does not exist or is soft-deleted |
| 404    | `Coupon not found`   | Invalid coupon_id                         |
| 422    | Validation errors    | Invalid fields                            |

---

### Delete Product (Soft Delete)

Soft-deletes a product by setting `deleted_at` to the current timestamp. The product will no longer appear in public listings.

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses:**

| Status | Message              | Condition                                 |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                        |
| 404    | `Product not found`  | Product does not exist or is already deleted |

---

### Upload Thumbnail

Uploads or replaces the product thumbnail image. If a thumbnail already exists, it is replaced.

**Endpoint:** `POST /:id/thumbnail`  
**Auth Required:** Yes (Admin, SubAdmin)  
**Content-Type:** `multipart/form-data`

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**File Fields:**

| Field       | Type  | Max Size | Description             |
| ----------- | ----- | -------- | ----------------------- |
| `thumbnail` | image | 5 MB     | Thumbnail image (required) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Thumbnail uploaded successfully",
  "data": { "/* full product object with updated thumbnail_image */" }
}
```

**Error Responses:**

| Status | Message                       | Condition                                 |
| ------ | ----------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`          | ID is not a number                        |
| 400    | `No thumbnail file provided`  | No file in request                        |
| 404    | `Product not found`           | Product does not exist or is soft-deleted |

---

### Remove Thumbnail

Removes the thumbnail image from a product.

**Endpoint:** `DELETE /:id/thumbnail`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Thumbnail removed successfully",
  "data": { "/* full product object with thumbnail_image: null */" }
}
```

**Error Responses:**

| Status | Message                      | Condition                                 |
| ------ | ---------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`         | ID is not a number                        |
| 400    | `Product has no thumbnail`   | Product has no thumbnail to remove        |
| 404    | `Product not found`          | Product does not exist or is soft-deleted |

---

### Add Gallery Images

Uploads 1–10 images to the product gallery. Images are compressed by default.

**Endpoint:** `POST /:id/gallery`  
**Auth Required:** Yes (Admin, SubAdmin)  
**Content-Type:** `multipart/form-data`

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Query Parameters:**

| Param      | Type    | Default | Description                  |
| ---------- | ------- | ------- | ---------------------------- |
| `compress` | boolean | true    | Set to `false` to skip compression |

**File Fields:**

| Field     | Type  | Max Size | Max Count | Description         |
| --------- | ----- | -------- | --------- | ------------------- |
| `gallery` | image | 5 MB     | 10        | Gallery images      |

**Success Response (201):**

```json
{
  "success": true,
  "message": "3 image(s) added to gallery",
  "data": [
    {
      "id": 5,
      "product_id": 10,
      "image_id": 15,
      "sort_order": 0,
      "active": true,
      "created_at": "2026-02-20T10:00:00.000Z",
      "images": {
        "id": 15,
        "url": "/uploads/images/gallery1.webp",
        "original_name": "photo.jpg",
        "mime_type": "webp",
        "size": 54321,
        "created_at": "2026-02-20T10:00:00.000Z"
      }
    }
  ]
}
```

**Error Responses:**

| Status | Message              | Condition                                 |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                        |
| 400    | `No images provided` | No files in request                       |
| 404    | `Product not found`  | Product does not exist or is soft-deleted |

---

### Update Gallery Entry

Updates the sort order or active status of a gallery entry.

**Endpoint:** `PATCH /:id/gallery/:galleryId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param       | Type   | Description      |
| ----------- | ------ | ---------------- |
| `id`        | number | Product ID       |
| `galleryId` | number | Gallery entry ID |

**Request Body (all fields optional):**

```json
{
  "sort_order": "number (>= 0)",
  "active": "boolean"
}
```

**Example:**

```json
{
  "sort_order": 2,
  "active": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Gallery entry updated",
  "data": { "/* gallery entry object */" }
}
```

**Error Responses:**

| Status | Message                                | Condition                    |
| ------ | -------------------------------------- | ---------------------------- |
| 400    | `Invalid product ID or gallery ID`     | ID is not a number           |
| 404    | `Gallery entry not found`              | Entry does not exist         |

---

### Remove Gallery Entry

Deletes a gallery entry and its associated image from disk.

**Endpoint:** `DELETE /:id/gallery/:galleryId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param       | Type   | Description      |
| ----------- | ------ | ---------------- |
| `id`        | number | Product ID       |
| `galleryId` | number | Gallery entry ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Image removed from gallery"
}
```

**Error Responses:**

| Status | Message                                | Condition                    |
| ------ | -------------------------------------- | ---------------------------- |
| 400    | `Invalid product ID or gallery ID`     | ID is not a number           |
| 404    | `Gallery entry not found`              | Entry does not exist         |

---

### Attach Categories

Attaches one or more categories to a product. Already-attached categories are skipped.

**Endpoint:** `POST /:id/categories`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Request Body:**

```json
{
  "category_ids": [1, 2, 3]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 category(ies) attached, 1 skipped (already attached)",
  "data": {
    "attached": 2,
    "skipped": 1
  }
}
```

**Error Responses:**

| Status | Message                                | Condition                                 |
| ------ | -------------------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`                   | ID is not a number                        |
| 404    | `Product not found`                    | Product does not exist or is soft-deleted |
| 404    | `Category ID(s) not found: 99`         | Invalid category IDs                      |
| 422    | Validation errors                      | Invalid body                              |

---

### Detach Category

Removes a category from a product.

**Endpoint:** `DELETE /:id/categories/:categoryId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param        | Type   | Description |
| ------------ | ------ | ----------- |
| `id`         | number | Product ID  |
| `categoryId` | number | Category ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Category detached from product"
}
```

**Error Responses:**

| Status | Message                                       | Condition                     |
| ------ | --------------------------------------------- | ----------------------------- |
| 400    | `Invalid product ID or category ID`           | ID is not a number            |
| 404    | `Category is not attached to this product`    | Link does not exist           |

---

### Attach Required Fields

Attaches one or more required-field definitions to a product. Already-attached fields are skipped.

**Endpoint:** `POST /:id/required-fields`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Request Body:**

```json
{
  "fields": [
    { "field_definition_id": 7, "is_required": true },
    { "field_definition_id": 12 }
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 field(s) attached, 0 skipped",
  "data": {
    "attached": 2,
    "skipped": 0
  }
}
```

**Error Responses:**

| Status | Message                                    | Condition                                 |
| ------ | ------------------------------------------ | ----------------------------------------- |
| 400    | `Invalid product ID`                       | ID is not a number                        |
| 404    | `Product not found`                        | Product does not exist or is soft-deleted |
| 404    | `Field definition(s) not found: 99`        | Invalid field definition IDs              |
| 422    | Validation errors                          | Invalid body                              |

---

### Detach Required Field

Removes a required-field definition from a product.

**Endpoint:** `DELETE /:id/required-fields/:fieldDefinitionId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param               | Type   | Description         |
| ------------------- | ------ | ------------------- |
| `id`                | number | Product ID          |
| `fieldDefinitionId` | number | Field definition ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Required field detached from product"
}
```

**Error Responses:**

| Status | Message                                              | Condition                          |
| ------ | ---------------------------------------------------- | ---------------------------------- |
| 400    | `Invalid product ID or field definition ID`          | ID is not a number                 |
| 404    | `This field is not attached to the specified product` | Link does not exist                |

---

## Enums & Types

### ProductType

| Value     | Description                        |
| --------- | ---------------------------------- |
| `Book`    | Digital book product               |
| `Product` | General product (default)          |

### Product Object

```json
{
  "id": "number (auto-increment PK)",
  "title": "string (max 255)",
  "description": "string | null",
  "type": "Book | Product (default: Product)",
  "price": "decimal (10,2) — defaults to 0",
  "price_after_discount": "decimal (10,2) | null",
  "serial": "string (max 255) | null",
  "thumbnail_id": "number | null",
  "thumbnail_image": "Image object | null",
  "sample_url": "string | null",
  "coupon_id": "number | null",
  "is_archived": "boolean — defaults to false",
  "created_at": "timestamp",
  "updated_at": "timestamp | null",
  "product_categories": "ProductCategory[]",
  "product_gallery": "GalleryEntry[]",
  "product_required_fields": "ProductRequiredField[]",
  "samples": "Sample object | null",
  "coupons": "Coupon object | null"
}
```

### Related Objects

**Image:**
```json
{
  "id": "number",
  "url": "string",
  "original_name": "string",
  "mime_type": "string (jpeg | png | webp | gif | svg | avif)",
  "size": "number (bytes)",
  "created_at": "timestamp"
}
```

**GalleryEntry:**
```json
{
  "id": "number",
  "product_id": "number",
  "image_id": "number",
  "sort_order": "number (default: 0)",
  "active": "boolean (default: true)",
  "created_at": "timestamp",
  "images": "Image object"
}
```

**ProductCategory:**
```json
{
  "id": "number",
  "product_id": "number",
  "category_id": "number",
  "categories": { "id": "number", "title": "string" }
}
```

**Sample:**
```json
{
  "id": "number",
  "product_id": "number",
  "url": "string",
  "original_name": "string",
  "mime_type": "string (application/pdf | application/msword | ...)",
  "size": "number (bytes)",
  "created_at": "timestamp"
}
```

---

## Business Rules

- Max gallery images per upload request: **10**
- Product thumbnail and gallery images are stored via the `imageService` under `/uploads/images`.
- Sample files (PDF, Word) are stored under `/uploads/samples`.
- `category_ids` may be attached on create; invalid category IDs return 404.
- Setting `is_archived = true` hides the product from public listings; archiving does not delete the DB record.
- Required fields attached to a product are validated at checkout time (the client must fill them before purchase).

---

## Common Response Types

### Success Response

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "string (optional)",
  "data": "object | array | null"
}
```

### Paginated Response

List endpoints return pagination metadata:

```json
{
  "success": true,
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

### Gallery List Response

```json
{
  "success": true,
  "results": 0,
  "data": []
}
```

---

## Error Codes

| Status | Error Type          | Description                                             |
| ------ | ------------------- | ------------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input, malformed IDs, or missing files          |
| 401    | `UnauthorizedError` | Missing or invalid authorization token                  |
| 403    | `ForbiddenError`    | User does not have the required role                    |
| 404    | `NotFoundError`     | Product, category, gallery entry, or field not found    |
| 409    | `ConflictError`     | Duplicate serial or unique constraint violation         |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array          |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
