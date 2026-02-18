# Required Fields API Documentation

## Base URL

```
/api/v2/required-fields
```

---

## Table of Contents

1. [Field Definition Endpoints](#field-definition-endpoints)
   - [Create Field Definition](#create-field-definition)
   - [Get All Field Definitions](#get-all-field-definitions)
   - [Get Field Definition by ID](#get-field-definition-by-id)
   - [Update Field Definition](#update-field-definition)
   - [Delete Field Definition (Soft Delete)](#delete-field-definition-soft-delete)
2. [Product Field Attachment Endpoints](#product-field-attachment-endpoints)
   - [Attach Fields to Product](#attach-fields-to-product)
   - [Get Product Fields](#get-product-fields)
   - [Detach Field from Product](#detach-field-from-product)
3. [Enums & Types](#enums--types)
4. [Common Response Types](#common-response-types)
5. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

All endpoints in this API require the **Admin** or **SubAdmin** role.

---

## Field Definition Endpoints

Field definitions are a global dictionary of reusable fields. Once created, they can be attached to any product.

---

### Create Field Definition

Creates a new field definition in the dictionary. Labels must be unique.

**Endpoint:** `POST /definitions`  
**Auth Required:** Yes (Admin, SubAdmin)

**Request Body:**

```json
{
  "label": "string (required, unique)",
  "field_type": "text | number | date | image (required)"
}
```

**Example:**

```json
{
  "label": "Student Name",
  "field_type": "text"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Field definition created successfully",
  "data": {
    "id": 1,
    "label": "Student Name",
    "field_type": "text",
    "active": true,
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null
  }
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 409 | `Field definition with label "X" already exists` | Duplicate label |
| 422 | Validation errors array | Invalid or missing fields |

---

### Get All Field Definitions

Returns a paginated list of all non-deleted field definitions.

**Endpoint:** `GET /definitions`  
**Auth Required:** Yes (Admin, SubAdmin)

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `active` | boolean | — | Filter by active status (`true` or `false`) |

**Example:** `GET /definitions?page=1&limit=10&active=true`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "definitions": [
      {
        "id": 1,
        "label": "Student Name",
        "field_type": "text",
        "active": true,
        "created_at": "2026-02-18T10:00:00.000Z",
        "updated_at": null,
        "deleted_at": null
      },
      {
        "id": 2,
        "label": "Birth Date",
        "field_type": "date",
        "active": true,
        "created_at": "2026-02-18T10:05:00.000Z",
        "updated_at": null,
        "deleted_at": null
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

### Get Field Definition by ID

Returns a single field definition. Returns 404 if not found or soft-deleted.

**Endpoint:** `GET /definitions/:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Field definition ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "Student Name",
    "field_type": "text",
    "active": true,
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null
  }
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid field definition ID` | ID is not a number |
| 404 | `Field definition not found` | Does not exist or is soft-deleted |

---

### Update Field Definition

Updates one or more fields on an existing definition. Use this to rename, change the type, or activate/deactivate a field.

**Endpoint:** `PATCH /definitions/:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Field definition ID |

**Request Body (all fields optional):**

```json
{
  "label": "string (unique)",
  "field_type": "text | number | date | image",
  "active": "boolean"
}
```

**Example — Deactivate a field:**

```json
{
  "active": false
}
```

**Example — Rename and change type:**

```json
{
  "label": "Full Name",
  "field_type": "text"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Field definition updated successfully",
  "data": {
    "id": 1,
    "label": "Full Name",
    "field_type": "text",
    "active": true,
    "created_at": "2026-02-18T10:00:00.000Z",
    "updated_at": "2026-02-18T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid field definition ID` | ID is not a number |
| 404 | `Field definition not found` | Does not exist or is soft-deleted |
| 409 | `Field definition with label "X" already exists` | New label conflicts with another |
| 422 | Validation errors array | Invalid fields |

---

### Delete Field Definition (Soft Delete)

Soft-deletes a field definition by setting `deleted_at` and `active = false`. All `product_required_fields` linked to this definition are also deactivated.

**Endpoint:** `DELETE /definitions/:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Field definition ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Field definition deleted successfully"
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid field definition ID` | ID is not a number |
| 404 | `Field definition not found` | Does not exist or is already deleted |

---

## Product Field Attachment Endpoints

These endpoints manage which field definitions are attached to a specific product. Attached fields must be filled by the user before purchasing (product can be added to cart without them).

---

### Attach Fields to Product

Attaches one or more field definitions to a product. Duplicates are silently skipped.

**Endpoint:** `POST /products/:productId/fields`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `productId` | number | Product ID |

**Request Body:**

```json
{
  "fields": [
    {
      "field_definition_id": "number (required)",
      "is_required": "boolean (optional, defaults to true)"
    }
  ]
}
```

**Example:**

```json
{
  "fields": [
    { "field_definition_id": 1, "is_required": true },
    { "field_definition_id": 2, "is_required": false },
    { "field_definition_id": 3 }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Attached 2 field(s), skipped 1 duplicate(s)",
  "data": {
    "attached": 2,
    "skipped": 1
  }
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid product ID` | ID is not a number |
| 404 | `Product not found` | Product does not exist or is soft-deleted |
| 404 | `Field definition(s) not found: 5, 9` | One or more definition IDs are invalid |
| 422 | Validation errors array | Invalid body structure |

---

### Get Product Fields

Lists all active fields attached to a product, including the full definition details.

**Endpoint:** `GET /products/:productId/fields`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `productId` | number | Product ID |

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "id": 1,
      "product_id": 10,
      "field_definition_id": 1,
      "is_required": true,
      "active": true,
      "required_field_definitions": {
        "id": 1,
        "label": "Student Name",
        "field_type": "text",
        "active": true,
        "created_at": "2026-02-18T10:00:00.000Z",
        "updated_at": null,
        "deleted_at": null
      }
    },
    {
      "id": 2,
      "product_id": 10,
      "field_definition_id": 2,
      "is_required": false,
      "active": true,
      "required_field_definitions": {
        "id": 2,
        "label": "Birth Date",
        "field_type": "date",
        "active": true,
        "created_at": "2026-02-18T10:05:00.000Z",
        "updated_at": null,
        "deleted_at": null
      }
    }
  ]
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid product ID` | ID is not a number |
| 404 | `Product not found` | Product does not exist or is soft-deleted |

---

### Detach Field from Product

Removes a field definition from a product (hard deletes the junction row).

**Endpoint:** `DELETE /products/:productId/fields/:fieldDefId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `productId` | number | Product ID |
| `fieldDefId` | number | Field definition ID to detach |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Field detached from product successfully"
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid product ID` | ID is not a number |
| 400 | `Invalid field definition ID` | ID is not a number |
| 404 | `This field is not attached to the specified product` | Junction row does not exist |

---

## Enums & Types

### FieldType (`field_type_enum`)

| Value | Description |
|-------|-------------|
| `text` | Free-text input |
| `number` | Numeric input |
| `date` | Date picker |
| `image` | Image upload |

### Field Definition Object

```json
{
  "id": "number (auto-increment PK)",
  "label": "string (unique, max 255 chars)",
  "field_type": "text | number | date | image",
  "active": "boolean (defaults to true)",
  "created_at": "timestamp",
  "updated_at": "timestamp | null",
  "deleted_at": "timestamp | null (soft delete marker)"
}
```

### Product Required Field Object (junction)

```json
{
  "id": "number (auto-increment PK)",
  "product_id": "number (FK → products)",
  "field_definition_id": "number (FK → required_field_definitions)",
  "is_required": "boolean (defaults to true)",
  "active": "boolean (defaults to true)"
}
```

---

## Common Response Types

### Success Response

```json
{
  "success": true,
  "message": "string (optional)",
  "data": "object | array | null"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "definitions": [],
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

---

## Error Codes

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | `BadRequestError` | Invalid input (e.g. non-numeric ID) |
| 401 | `UnauthorizedError` | Missing or invalid authorization token |
| 403 | `ForbiddenError` | User does not have Admin or SubAdmin role |
| 404 | `NotFoundError` | Resource not found or soft-deleted |
| 409 | `ConflictError` | Duplicate label |
| 422 | `ValidationError` | DTO validation failed — returns `errors` array |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
