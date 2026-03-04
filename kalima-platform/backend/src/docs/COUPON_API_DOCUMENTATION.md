# Coupon API Documentation

## Base URL

```
/api/v2/coupons
```

---

## Product Coupons Endpoint

**Endpoint:** `GET /api/v2/products/:id/coupons`  
**Auth Required:** No (public)

Returns active coupons for a specific product. Query param `active` (default `true`) filters by active status.

---

## Table of Contents

1. [Admin / SubAdmin Endpoints](#admin--subadmin-endpoints)
   - [Generate Coupon Code](#generate-coupon-code)
   - [Create Coupon](#create-coupon)
   - [Get All Coupons](#get-all-coupons)
   - [Get Coupon by ID](#get-coupon-by-id)
   - [Update Coupon](#update-coupon)
   - [Delete Coupon (Soft Delete)](#delete-coupon-soft-delete)
2. [Teacher Endpoints](#teacher-endpoints)
   - [Validate Coupon](#validate-coupon)
   - [Use Coupon](#use-coupon)
3. [Enums & Types](#enums--types)
4. [Common Response Types](#common-response-types)
5. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Admin / SubAdmin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** or **SubAdmin** role.

---

### Generate Coupon Code

Generates a unique coupon code in the format `KLM-XXXXXX`. This is a helper endpoint — the admin can use the returned code when creating a coupon, or provide their own.

**Endpoint:** `GET /generate-code`  
**Auth Required:** Yes (Admin, SubAdmin)

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "code": "KLM-A3F1B2"
  }
}
```

---

### Create Coupon

Creates a new coupon. The code must be unique. Only **one** discount type is allowed per coupon — either a fixed amount or a percentage.

**Endpoint:** `POST /`  
**Auth Required:** Yes (Admin, SubAdmin)

**Request Body:**

```json
{
  "code": "string (required, unique, max 50 chars, [A-Z0-9-] only)",
  "product_id": "number (required) — the product this coupon applies to",
  "discount_type": "amount | percentage (required)",
  "discount_amount": "number (required when discount_type is 'amount', must be > 0 and <= product price)",
  "discount_percentage": "number (required when discount_type is 'percentage', must be > 0 and <= 100)",
  "expires_at": "ISO 8601 date string (required)",
  "starts_at": "ISO 8601 date string (optional) — must be before expires_at"
}
```

**Product-Coupon Relation:** Each coupon belongs to exactly one product. A product can have many coupons.

**Example — Fixed Amount:**

```json
{
  "code": "KLM-A3F1B2",
  "product_id": 1,
  "discount_type": "amount",
  "discount_amount": 50.0,
  "expires_at": "2026-06-01T00:00:00.000Z"
}
```

**Example — Percentage:**

```json
{
  "code": "SUMMER20",
  "product_id": 1,
  "discount_type": "percentage",
  "discount_percentage": 20,
  "expires_at": "2026-06-01T00:00:00.000Z"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": 1,
    "code": "KLM-A3F1B2",
    "product_id": 1,
    "discount_amount": "50.00",
    "discount_percentage": 0,
    "active": true,
    "expires_at": "2026-06-01T00:00:00.000Z",
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null,
    "mongo_id": null
  }
}
```

**Error Responses:**

| Status | Message                            | Condition                 |
| ------ | ---------------------------------- | ------------------------- |
| 409    | `Coupon code "XYZ" already exists` | Code is not unique        |
| 422    | Validation errors array            | Invalid or missing fields |

---

### Get All Coupons

Returns a paginated list of all non-deleted coupons. Supports filtering by active status.

**Endpoint:** `GET /`  
**Auth Required:** Yes (Admin, SubAdmin)

**Query Parameters:**

| Param        | Type    | Default | Description                                          |
| ------------ | ------- | ------- | ---------------------------------------------------- |
| `page`       | number  | 1       | Page number                                          |
| `limit`      | number  | 20      | Items per page                                       |
| `active`     | boolean | —       | Filter by active status (`true` or `false`)          |
| `product_id` | number  | —       | Filter by product (returns coupons for that product) |
| `search`     | string  | —       | Search for coupons by code (case-insensitive)        |

**Example:** `GET /coupons?page=1&limit=10&active=true&product_id=1`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "KLM-A3F1B2",
        "discount_amount": "50.00",
        "discount_percentage": 0,
        "active": true,
        "expires_at": "2026-06-01T00:00:00.000Z",
        "created_at": "2026-02-18T10:00:00.000Z",
        "updated_at": null,
        "deleted_at": null,
        "mongo_id": null
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### Get Coupon by ID

Returns a single coupon by its ID. Returns 404 if the coupon does not exist or has been soft-deleted.

**Endpoint:** `GET /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Coupon ID   |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "KLM-A3F1B2",
    "discount_amount": "50.00",
    "discount_percentage": 0,
    "active": true,
    "expires_at": "2026-06-01T00:00:00.000Z",
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null,
    "mongo_id": null
  }
}
```

**Error Responses:**

| Status | Message             | Condition                                |
| ------ | ------------------- | ---------------------------------------- |
| 400    | `Invalid coupon ID` | ID is not a number                       |
| 404    | `Coupon not found`  | Coupon does not exist or is soft-deleted |

---

### Update Coupon

Updates one or more fields on an existing coupon. All fields are optional. If `discount_type` is changed, the corresponding value field becomes required.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Coupon ID   |

**Request Body (all fields optional):**

```json
{
  "code": "string (unique)",
  "discount_type": "amount | percentage",
  "discount_amount": "number (> 0)",
  "discount_percentage": "number (> 0, <= 100)",
  "expires_at": "ISO 8601 date string",
  "is_active": "boolean"
}
```

**Example — Deactivate & change discount:**

```json
{
  "discount_type": "percentage",
  "discount_percentage": 15,
  "is_active": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "id": 1,
    "code": "KLM-A3F1B2",
    "discount_amount": "0.00",
    "discount_percentage": 15,
    "active": false,
    "expires_at": "2026-06-01T00:00:00.000Z",
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": "2026-02-18T12:00:00.000Z",
    "deleted_at": null,
    "mongo_id": null
  }
}
```

**Error Responses:**

| Status | Message                            | Condition                                |
| ------ | ---------------------------------- | ---------------------------------------- |
| 400    | `Invalid coupon ID`                | ID is not a number                       |
| 404    | `Coupon not found`                 | Coupon does not exist or is soft-deleted |
| 409    | `Coupon code "XYZ" already exists` | New code conflicts with another coupon   |
| 422    | Validation errors array            | Invalid fields                           |

---

### Delete Coupon (Soft Delete)

Soft-deletes a coupon by setting `deleted_at` to the current timestamp and `active` to `false`. The coupon will no longer appear in list queries.

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Coupon ID   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

**Error Responses:**

| Status | Message             | Condition                                   |
| ------ | ------------------- | ------------------------------------------- |
| 400    | `Invalid coupon ID` | ID is not a number                          |
| 404    | `Coupon not found`  | Coupon does not exist or is already deleted |

---

## Teacher Endpoints

> All endpoints in this section require the authenticated user to have the **Teacher** role.

---

### Validate Coupon

Checks whether a coupon code is valid (exists, is active, and has not expired). Does **not** consume the coupon.

**Endpoint:** `POST /validate`  
**Auth Required:** Yes (Teacher)

**Request Body:**

```json
{
  "code": "string (required)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "coupon": {
      "id": 1,
      "code": "KLM-A3F1B2",
      "discount_amount": "50.00",
      "discount_percentage": 0,
      "active": true,
      "expires_at": "2026-06-01T00:00:00.000Z",
      "created_at": "2026-02-18T10:00:00.000Z",
      "updated_at": null,
      "deleted_at": null,
      "mongo_id": null
    }
  }
}
```

**Error Responses:**

| Status | Message                                     | Condition                                                          |
| ------ | ------------------------------------------- | ------------------------------------------------------------------ |
| 400    | `This coupon is no longer active`           | Coupon exists but `active` is `false`                              |
| 400    | `This coupon has expired`                   | Coupon exists but `expires_at` is in the past                      |
| 400    | `This coupon is not valid for this product` | Coupon applies to a different product (when `product_id` provided) |
| 404    | `Invalid coupon code`                       | Code does not exist or is soft-deleted                             |
| 422    | Validation errors array                     | Missing `code` field                                               |

---

### Use Coupon

Applies a coupon code. The coupon is deactivated (`active = false`) after use and cannot be used again.

**Endpoint:** `POST /use`  
**Auth Required:** Yes (Teacher)

**Request Body:**

```json
{
  "code": "string (required)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "id": 1,
    "code": "KLM-A3F1B2",
    "discount_amount": "50.00",
    "discount_percentage": 0,
    "active": false,
    "expires_at": "2026-06-01T00:00:00.000Z",
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": "2026-02-18T14:00:00.000Z",
    "deleted_at": null,
    "mongo_id": null
  }
}
```

**Error Responses:**

| Status | Message                                            | Condition                                     |
| ------ | -------------------------------------------------- | --------------------------------------------- |
| 400    | `This coupon has already been used or deactivated` | Coupon exists but `active` is `false`         |
| 400    | `This coupon has expired`                          | Coupon exists but `expires_at` is in the past |
| 404    | `Invalid coupon code`                              | Code does not exist or is soft-deleted        |
| 422    | Validation errors array                            | Missing `code` field                          |

---

## Enums & Types

### DiscountType

| Value        | Description                                 |
| ------------ | ------------------------------------------- |
| `amount`     | Fixed monetary discount (e.g. 50 EGP off)   |
| `percentage` | Percentage discount (e.g. 20% off, max 100) |

### Coupon Object

```json
{
  "id": "number (auto-increment PK)",
  "code": "string (unique, max 50 chars)",
  "discount_amount": "decimal (10,2) — defaults to 0",
  "discount_percentage": "integer — defaults to 0",
  "active": "boolean — defaults to true",
  "expires_at": "timestamp | null",
  "created_at": "timestamp",
  "updated_at": "timestamp | null",
  "deleted_at": "timestamp | null (soft delete marker)",
  "mongo_id": "string | null (legacy migration ID)"
}
```

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
  "data": {
    "coupons": [],
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

---

## Error Codes

| Status | Error Type          | Description                                           |
| ------ | ------------------- | ----------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input, expired coupon, or already used coupon |
| 401    | `UnauthorizedError` | Missing or invalid authorization token                |
| 403    | `ForbiddenError`    | User does not have the required role                  |
| 404    | `NotFoundError`     | Coupon not found or soft-deleted                      |
| 409    | `ConflictError`     | Duplicate coupon code                                 |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array        |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
