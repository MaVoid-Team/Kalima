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
   - [Get Product Coupons](#get-product-coupons)
   - [Get Product Gallery](#get-product-gallery)
   - [[NEW] Get Product Gallery Full](#new-get-product-gallery-full)
   - [Get Product Required Fields](#get-product-required-fields)
2. [Customer Endpoints](#customer-endpoints)
   - [Check Review Eligibility](#check-review-eligibility)
   - [Create Product Review](#create-product-review)
   - [Update Product Review](#update-product-review)
   - [Delete Product Review](#delete-product-review)
3. [Admin / SubAdmin Endpoints](#admin--subadmin-endpoints)
   - [Create Product](#create-product)
   - [Update Product](#update-product)
   - [Delete Product (Soft Delete)](#delete-product-soft-delete)
   - [Upload Thumbnail](#upload-thumbnail)
   - [Remove Thumbnail](#remove-thumbnail)
   - [Add Gallery Images](#add-gallery-images)
   - [[NEW] Add Gallery Videos](#new-add-gallery-videos)
   - [[NEW] Add External Gallery Video](#new-add-external-gallery-video)
   - [[NEW] Remove Gallery Video](#new-remove-gallery-video)
   - [Update Gallery Entry](#update-gallery-entry)
   - [Remove Gallery Entry](#remove-gallery-entry)
   - [Attach Categories](#attach-categories)
   - [Detach Category](#detach-category)
   - [Attach Required Fields](#attach-required-fields)
   - [Detach Required Field](#detach-required-field)
4. [Enums & Types](#enums--types)
5. [Business Rules](#business-rules)
6. [Common Response Types](#common-response-types)
7. [Error Codes](#error-codes)

---

## Authentication

Most read endpoints are public (no auth). Admin operations require JWT authentication with **Admin** or **SubAdmin** role:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints (no auth required)

---

### Get Product Reviews

Returns a paginated list of reviews for a specific product, including the total count and average rating.

**Endpoint:** `GET /:id/reviews`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Query Parameters:**

| Param   | Type   | Default | Description    |
| ------- | ------ | ------- | -------------- |
| `page`  | number | 1       | Page number    |
| `limit` | number | 10      | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 10,
      "user_id": 42,
      "rating": 5,
      "review_text": "Great product, highly recommended!",
      "created_at": "2026-03-01T10:00:00.000Z",
      "updated_at": "2026-03-01T10:00:00.000Z",
      "users": {
        "id": 42,
        "name": "John Doe",
        "profile_pic_url": "/uploads/profiles/john.jpg"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  },
  "averageRating": 4.8,
  "reviewCount": 15
}
```

**Error Responses:**

| Status | Message              | Condition          |
| ------ | -------------------- | ------------------ |
| 400    | `Invalid product ID` | ID is not a number |

---

### Get All Products

Returns a paginated list of products with optional filters.

**Endpoint:** `GET /`  
**Auth Required:** No

**Query Parameters:**

| Param         | Type    | Default | Description                          |
| ------------- | ------- | ------- | ------------------------------------ |
| `is_archived` | boolean | —       | Filter by archived status            |
| `category_id` | number  | —       | Filter by category ID                |
| `search`      | string  | —       | Text search on title and description |
| `page`        | number  | 1       | Page number                          |
| `limit`       | number  | 20      | Items per page                       |

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
      "release_at": "2026-04-01T08:00:00.000Z",
      "is_released": false,
      "time_until_release_ms": 604800000,
      "serial": "ALG-101",
      "sample_url": null,
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
        {
          "id": 12,
          "category_id": 1,
          "categories": { "id": 1, "title": "Books" }
        }
      ],
      "product_gallery": [],
      "product_required_fields": [],
      "samples": null,
      "coupons": [],
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

Returns a single product with linked categories, gallery entries, sample, coupons (array of active coupons for this product), and required-field definitions. Returns 404 if the product does not exist or has been soft-deleted.

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
    "release_at": "2026-04-01T08:00:00.000Z",
    "is_released": false,
    "time_until_release_ms": 604800000,
    "serial": "ALG-101",
    "sample_url": null,
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
      {
        "id": 12,
        "category_id": 1,
        "categories": { "id": 1, "title": "Books" }
      }
    ],
    "product_gallery": [
      {
        "id": 3,
        "sort_order": 0,
        "active": true,
        "images": { "id": 8, "url": "/uploads/images/gallery1.webp" }
      }
    ],
    "product_required_fields": [
      {
        "id": 2,
        "field_definition_id": 7,
        "required_field_definitions": { "id": 7, "label": "Student Name" }
      }
    ],
    "samples": {
      "id": 1,
      "url": "/uploads/samples/sample.pdf",
      "original_name": "sample.pdf",
      "mime_type": "application/pdf",
      "size": 204800,
      "created_at": "2026-02-20T10:00:00.000Z"
    },
    "coupons": [
      {
        "id": 1,
        "code": "KLM-ABC123",
        "discount_amount": "50.00",
        "discount_percentage": 0,
        "expires_at": "2026-06-01T00:00:00.000Z"
      }
    ],
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

### Get Product Coupons

Returns active coupons for a specific product.

**Endpoint:** `GET /:id/coupons`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Query Parameters:**

| Param    | Type    | Default | Description                              |
| -------- | ------- | ------- | ---------------------------------------- |
| `active` | boolean | true    | Filter by active status (`true`/`false`) |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "KLM-ABC123",
      "product_id": 1,
      "discount_amount": "50.00",
      "discount_percentage": 0,
      "active": true,
      "expires_at": "2026-06-01T00:00:00.000Z",
      "product": { "id": 1, "title": "Algebra Book" }
    }
  ]
}
```

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

| Status | Message                                | Condition                                 |
| ------ | -------------------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`                   | ID is not a number                        |
| 404    | `Product not found`                    | Product does not exist or is soft-deleted |
| 404    | `Thumbnail not found for this product` | Product has no thumbnail                  |

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

| Param             | Type    | Default | Description                         |
| ----------------- | ------- | ------- | ----------------------------------- |
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

### [NEW] Get Product Gallery Full

Returns combined images and videos from the gallery, sorted by `sort_order`.

**Endpoint:** `GET /:id/gallery/full`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

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

## Customer Endpoints

---

### Check Review Eligibility

Checks if the currently authenticated user is eligible to review a specific product. Returns reasons if not eligible (e.g. not authenticated, no confirmed purchase, or already reviewed).

**Endpoint:** `GET /:id/reviews/can-review`  
**Auth Required:** Yes (Optional, if no auth token is provided it returns `canReview: false` with reason `not_authenticated`)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Success Response (200 - Eligible):**

```json
{
  "success": true,
  "data": {
    "canReview": true
  }
}
```

**Success Response (200 - Not Eligible):**

```json
{
  "success": true,
  "data": {
    "canReview": false,
    "reason": "no_confirmed_purchase | already_reviewed | not_authenticated",
    "existingReview": { "/* populated if reason is already_reviewed */" }
  }
}
```

**Error Responses:**

| Status | Message              | Condition          |
| ------ | -------------------- | ------------------ |
| 400    | `Invalid product ID` | ID is not a number |

---

### Create Product Review

Creates a new review for a product. Requires the user to have a confirmed purchase of the product and not have already reviewed it.

**Endpoint:** `POST /:id/reviews`  
**Auth Required:** Yes (Teacher, Student, or Parent in Store portal)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Request Body:**

```json
{
  "rating": "number (required, 1-5)",
  "review_text": "string (optional, max 2000 chars)"
}
```

**Example:**

```json
{
  "rating": 5,
  "review_text": "Excellent book for learning algebra."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "product_id": 10,
    "user_id": 42,
    "rating": 5,
    "review_text": "Excellent book for learning algebra.",
    "created_at": "2026-03-01T10:00:00.000Z",
    "updated_at": "2026-03-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                                                | Condition                                  |
| ------ | ------------------------------------------------------ | ------------------------------------------ |
| 400    | `Invalid product ID`                                   | ID is not a number                         |
| 400    | `User not authenticated`                               | Token missing or invalid                   |
| 403    | `You must have a confirmed purchase to leave a review` | User hasn't purchased the product          |
| 403    | `You have already reviewed this product`               | User already has a review for this product |
| 422    | Validation errors                                      | Rating out of bounds, text too long        |

---

### Update Product Review

Updates an existing review.

**Endpoint:** `PATCH /:id/reviews/:reviewId`  
**Auth Required:** Yes (Any authenticated user)

**URL Parameters:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `id`       | number | Product ID  |
| `reviewId` | number | Review ID   |

**Request Body (all fields optional):**

```json
{
  "rating": "number (1-5)",
  "review_text": "string (max 2000 chars)"
}
```

**Example:**

```json
{
  "rating": 4,
  "review_text": "Good book, but could use more examples."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": { "/* full review object */" }
}
```

**Error Responses:**

| Status | Message                                | Condition                           |
| ------ | -------------------------------------- | ----------------------------------- |
| 400    | `Invalid product ID or review ID`      | ID is not a number                  |
| 400    | `User not authenticated`               | Token missing or invalid            |
| 403    | `You can only update your own reviews` | Review belongs to another user      |
| 404    | `Review not found`                     | Review ID does not exist            |
| 422    | Validation errors                      | Rating out of bounds, text too long |

---

### Delete Product Review

Deletes an existing review.

**Endpoint:** `DELETE /:id/reviews/:reviewId`  
**Auth Required:** Yes (Any authenticated user)

**URL Parameters:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `id`       | number | Product ID  |
| `reviewId` | number | Review ID   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**

| Status | Message                                | Condition                      |
| ------ | -------------------------------------- | ------------------------------ |
| 400    | `Invalid review ID`                    | ID is not a number             |
| 400    | `User not authenticated`               | Token missing or invalid       |
| 403    | `You can only delete your own reviews` | Review belongs to another user |
| 404    | `Review not found`                     | Review ID does not exist       |

---

## Admin / SubAdmin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** or **SubAdmin** role.

---

### Create Product

Creates a new product. Supports `multipart/form-data` with an optional `thumbnail` image and optional `high_quality` and `low_quality` sample files. The `category_ids` array must be sent as a JSON string when using form-data.

**Sample Attachment Options:**

1. **Upload new sample**: Send `high_quality` and/or `low_quality` files + `sample_section_id`.
2. **Link existing sample**: Send `sample_id` (ID of an already-uploaded sample) to re-assign it to this product.
   _(If both are provided, `sample_id` takes precedence and files are replaced on the existing sample)._

> **Validation**: If `high_quality` or `low_quality` files are provided **without** `sample_section_id` **and without** `sample_id`, the request will fail with a `400 Bad Request`.

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
  "release_at": "string (optional, ISO 8601 datetime)",
  "serial": "string (optional, max 255)",
  "sample_url": "string (optional)",
  "sample_section_id": "number (optional, required if uploading new sample files)",
  "sample_id": "number (optional, ID of an existing sample to link)",
  "category_id": "number (optional, e.g. 1)"
}
```

**File Fields:**

| Field          | Type            | Max Size | Description                         |
| -------------- | --------------- | -------- | ----------------------------------- |
| `thumbnail`    | image           | 150 MB   | Product thumbnail (optional)        |
| `high_quality` | PDF/Image/Video | 150 MB   | High-quality sample file (optional) |
| `low_quality`  | PDF/Image/Video | 150 MB   | Low-quality sample file (optional)  |

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

| Field               | Value          |
| ------------------- | -------------- |
| `title`             | Algebra Book   |
| `price`             | 100            |
| `type`              | Book           |
| `category_id`       | 1              |
| `thumbnail`         | _(image file)_ |
| `sample_section_id` | 2              |
| `high_quality`      | _(PDF file)_   |
| `low_quality`       | _(PDF file)_   |

**Example — form-data (link existing sample):**

| Field       | Value        |
| ----------- | ------------ |
| `title`     | Algebra Book |
| `price`     | 100          |
| `sample_id` | 42           |

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
    "release_at": "2026-04-01T08:00:00.000Z",
    "is_released": false,
    "time_until_release_ms": 604800000,
    "serial": null,
    "sample_url": null,
    "is_archived": false,
    "thumbnail_image": null,
    "product_categories": [
      {
        "id": 1,
        "category_id": 5,
        "categories": { "id": 5, "title": "Mathematics" }
      }
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

| Status | Message                                               | Condition                     |
| ------ | ----------------------------------------------------- | ----------------------------- |
| 400    | `category_ids must be a valid JSON array of integers` | Malformed category_ids string |
| 404    | `Category ID(s) not found: 99`                        | Invalid category ID           |
| 422    | Validation errors array                               | Invalid or missing fields     |

---

### Update Product

Updates one or more fields on an existing product. All fields are optional. Supports `multipart/form-data` for replacing `high_quality` and `low_quality` sample files. **Note**: Thumbnail updates must be performed using the dedicated `POST /:id/thumbnail` endpoint.

**Sample Update Options:**

1. **Upload brand new sample**: Send `high_quality` and/or `low_quality` files + `sample_section_id`. This deletes the old sample and creates a new one.
2. **Link existing sample**: Send `sample_id` without files. Re-assigns the sample to this product.
3. **Replace files on existing sample**: Send `sample_id` + `high_quality` and/or `low_quality` files.

> **Validation**: If `high_quality` or `low_quality` files are provided **without** `sample_section_id` **and without** `sample_id`, the request will fail with a `400 Bad Request`.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin, SubAdmin)
**Content-Type:** `application/json` or `multipart/form-data`

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
  "release_at": "string (optional, ISO 8601 datetime)",
  "serial": "string (max 255)",
  "sample_url": "string",
  "sample_section_id": "number (optional, required if uploading brand new sample files)",
  "sample_id": "number (optional, ID of sample to link/replace files for)",
  "is_archived": "boolean"
}
```

**File Fields (multipart/form-data only):**

| Field          | Type            | Max Size | Description                         |
| -------------- | --------------- | -------- | ----------------------------------- |
| `high_quality` | PDF/Image/Video | 150 MB   | High-quality sample file (optional) |
| `low_quality`  | PDF/Image/Video | 150 MB   | Low-quality sample file (optional)  |

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

| Status | Message              | Condition                                    |
| ------ | -------------------- | -------------------------------------------- |
| 400    | `Invalid product ID` | ID is not a number                           |
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

| Field       | Type  | Max Size | Description                |
| ----------- | ----- | -------- | -------------------------- |
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

| Status | Message                      | Condition                                 |
| ------ | ---------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`         | ID is not a number                        |
| 400    | `No thumbnail file provided` | No file in request                        |
| 404    | `Product not found`          | Product does not exist or is soft-deleted |

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

| Status | Message                    | Condition                                 |
| ------ | -------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`       | ID is not a number                        |
| 400    | `Product has no thumbnail` | Product has no thumbnail to remove        |
| 404    | `Product not found`        | Product does not exist or is soft-deleted |

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

| Param      | Type    | Default | Description                        |
| ---------- | ------- | ------- | ---------------------------------- |
| `compress` | boolean | true    | Set to `false` to skip compression |

**File Fields:**

| Field     | Type  | Max Size | Max Count | Description    |
| --------- | ----- | -------- | --------- | -------------- |
| `gallery` | image | 5 MB     | 10        | Gallery images |

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

### [NEW] Add Gallery Videos

Uploads a video to the product gallery (multipart, mp4/webm/quicktime, max 100MB).

**Endpoint:** `POST /:id/gallery/videos`  
**Auth Required:** Yes (Admin, SubAdmin)  
**Content-Type:** `multipart/form-data`

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**File Fields:**

| Field   | Type  | Max Size | Description |
| ------- | ----- | -------- | ----------- |
| `video` | video | 100 MB   | Video file  |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/v2/products/1/gallery/videos \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@/path/to/myvideo.mp4"
```

---

### [NEW] Add External Gallery Video

Adds an external video URL to the product gallery.

**Endpoint:** `POST /:id/gallery/videos/external`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Product ID  |

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

| Field | Type   | Required | Description            |
| ----- | ------ | -------- | ---------------------- |
| `url` | string | Yes      | The external video URL |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/v2/products/1/gallery/videos/external \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

---

### [NEW] Remove Gallery Video

Removes a video from the product gallery.

**Endpoint:** `DELETE /:id/gallery/videos/:videoId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param     | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Product ID  |
| `videoId` | number | Video ID    |

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

| Status | Message                            | Condition            |
| ------ | ---------------------------------- | -------------------- |
| 400    | `Invalid product ID or gallery ID` | ID is not a number   |
| 404    | `Gallery entry not found`          | Entry does not exist |

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

| Status | Message                            | Condition            |
| ------ | ---------------------------------- | -------------------- |
| 400    | `Invalid product ID or gallery ID` | ID is not a number   |
| 404    | `Gallery entry not found`          | Entry does not exist |

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

| Status | Message                        | Condition                                 |
| ------ | ------------------------------ | ----------------------------------------- |
| 400    | `Invalid product ID`           | ID is not a number                        |
| 404    | `Product not found`            | Product does not exist or is soft-deleted |
| 404    | `Category ID(s) not found: 99` | Invalid category IDs                      |
| 422    | Validation errors              | Invalid body                              |

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

| Status | Message                                    | Condition           |
| ------ | ------------------------------------------ | ------------------- |
| 400    | `Invalid product ID or category ID`        | ID is not a number  |
| 404    | `Category is not attached to this product` | Link does not exist |

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

| Status | Message                             | Condition                                 |
| ------ | ----------------------------------- | ----------------------------------------- |
| 400    | `Invalid product ID`                | ID is not a number                        |
| 404    | `Product not found`                 | Product does not exist or is soft-deleted |
| 404    | `Field definition(s) not found: 99` | Invalid field definition IDs              |
| 422    | Validation errors                   | Invalid body                              |

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

| Status | Message                                               | Condition           |
| ------ | ----------------------------------------------------- | ------------------- |
| 400    | `Invalid product ID or field definition ID`           | ID is not a number  |
| 404    | `This field is not attached to the specified product` | Link does not exist |

---

## Enums & Types

### ProductType

| Value     | Description               |
| --------- | ------------------------- |
| `Book`    | Digital book product      |
| `Product` | General product (default) |

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
  "is_archived": "boolean — defaults to false",
  "created_at": "timestamp",
  "updated_at": "timestamp | null",
  "product_categories": "ProductCategory[]",
  "product_gallery": "GalleryEntry[]",
  "product_required_fields": "ProductRequiredField[]",
  "samples": "Sample object | null",
  "coupons": "Coupon[] — array of active coupons for this product"
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
- `release_at` schedules product availability; omitted or null means immediately released.
- Product read endpoints return computed fields: `is_released` and `time_until_release_ms`.
- Products with a future `release_at` cannot be added to cart until the release time is reached.
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

| Status | Error Type          | Description                                          |
| ------ | ------------------- | ---------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input, malformed IDs, or missing files       |
| 401    | `UnauthorizedError` | Missing or invalid authorization token               |
| 403    | `ForbiddenError`    | User does not have the required role                 |
| 404    | `NotFoundError`     | Product, category, gallery entry, or field not found |
| 409    | `ConflictError`     | Duplicate serial or unique constraint violation      |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array       |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
