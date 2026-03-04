# Category API Documentation

## Base URL

```
/api/v2/categories
```

---

## Table of Contents

1. [Public Endpoints (Authenticated)](#public-endpoints-authenticated)
   - [Get All Categories (Tree)](#get-all-categories-tree)
   - [Get Category by ID](#get-category-by-id)
2. [Admin / SubAdmin Endpoints](#admin--subadmin-endpoints)
   - [Create Category](#create-category)
   - [Update Category](#update-category)
   - [Delete Category](#delete-category)
3. [Data Model](#data-model)
4. [Business Rules](#business-rules)
5. [Common Response Types](#common-response-types)
6. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

### Unauthenticated (no auth required)

- GET `/roots` — return all root categories (no parents).
- GET `/:id/children` — return direct child categories of the given parent ID.

These two endpoints are intentionally public and do **not** require a JWT.

---

### Authenticated (any role)

> Any authenticated user can access these endpoints regardless of role.

---

### Get All Categories (Tree)

Returns root-level categories (with nested children up to **3 levels deep**) and supports optional pagination and active filtering.

**Endpoint:** `GET /`  
**Auth Required:** Yes (any role)

**Query Parameters:**

| Param    | Type    | Default | Description                                                   |
| -------- | ------- | ------- | ------------------------------------------------------------- |
| `active` | boolean | —       | Filter by active status (`true` or `false`). Omit to get all. |
| `page`   | number  | 1       | Page number (1-based)                                         |
| `limit`  | number  | 50      | Items per page (root categories per page)                     |

**Example:** `GET /?active=true&page=1&limit=50`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Electronics",
      "description": "Electronic devices and accessories",
      "parent_id": null,
      "active": true,
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": null,
      "product_categories": [{ "product_id": 10 }, { "product_id": 15 }],
      "other_categories": [
        {
          "id": 3,
          "title": "Phones",
          "description": null,
          "parent_id": 1,
          "active": true,
          "created_at": "2026-01-16T08:00:00.000Z",
          "updated_at": null,
          "product_categories": [],
          "other_categories": [
            {
              "id": 5,
              "title": "Smartphones",
              "description": null,
              "parent_id": 3,
              "active": true,
              "created_at": "2026-01-17T12:00:00.000Z",
              "product_categories": [{ "product_id": 20 }]
            }
          ]
        }
      ]
    },
    {
      "id": 2,
      "title": "Books",
      "description": "All book categories",
      "parent_id": null,
      "active": true,
      "created_at": "2026-01-15T11:00:00.000Z",
      "updated_at": null,
      "product_categories": [],
      "other_categories": []
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 50
}
```

---

### Get Category by ID

Returns a single category with its nested children (up to 3 levels) and linked product IDs.

**Endpoint:** `GET /:id`  
**Auth Required:** Yes (any role)

**URL Parameters:**

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | int  | Yes      | Category ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Electronics",
    "description": "Electronic devices and accessories",
    "parent_id": null,
    "active": true,
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": null,
    "product_categories": [{ "product_id": 10 }],
    "other_categories": [
      {
        "id": 3,
        "title": "Phones",
        "description": null,
        "parent_id": 1,
        "active": true,
        "other_categories": [],
        "product_categories": []
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Category not found"
}
```

---

## Admin / SubAdmin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** or **SubAdmin** role.

---

### Create Category

Creates a new category. Optionally nest it under a parent category.

**Endpoint:** `POST /`  
**Auth Required:** Yes (Admin, SubAdmin)

**Request Body:**

| Field         | Type    | Required | Description                             |
| ------------- | ------- | -------- | --------------------------------------- |
| `title`       | string  | Yes      | Category name (max 255 chars)           |
| `description` | string  | No       | Category description                    |
| `parent_id`   | integer | No       | ID of the parent category to nest under |

**Example Request:**

```json
{
  "title": "Smartphones",
  "description": "All smartphone products",
  "parent_id": 3
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 5,
    "title": "Smartphones",
    "description": "All smartphone products",
    "parent_id": 3,
    "active": true,
    "created_at": "2026-02-18T14:30:00.000Z",
    "updated_at": null
  }
}
```

**Error Responses:**

| Status | Condition                                          |
| ------ | -------------------------------------------------- |
| 400    | Maximum nesting depth of 3 exceeded                |
| 400    | Validation errors (empty title, invalid parent_id) |
| 404    | Parent category not found                          |

```json
{
  "success": false,
  "error": "Maximum nesting depth of 3 reached. Cannot create a child under this category."
}
```

---

### Update Category

Updates a category's title, description, parent, or active status.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | int  | Yes      | Category ID |

**Request Body (all fields optional):**

| Field         | Type    | Description                                                 |
| ------------- | ------- | ----------------------------------------------------------- |
| `title`       | string  | New title (max 255 chars)                                   |
| `description` | string  | New description                                             |
| `parent_id`   | integer | Move category under a different parent (or `null` for root) |
| `active`      | boolean | Set active status (archiving cascades to all children)      |

**Example — Rename:**

```json
{
  "title": "Mobile Phones"
}
```

**Example — Archive (cascades to children):**

```json
{
  "active": false
}
```

**Example — Move to root:**

```json
{
  "parent_id": null
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 5,
    "title": "Mobile Phones",
    "description": "All smartphone products",
    "parent_id": 3,
    "active": true,
    "created_at": "2026-02-18T14:30:00.000Z",
    "updated_at": "2026-02-18T15:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition                                               |
| ------ | ------------------------------------------------------- |
| 400    | Category cannot be its own parent                       |
| 400    | Cannot move under one of its own descendants (circular) |
| 400    | Moving would exceed max nesting depth of 3              |
| 404    | Category not found                                      |
| 404    | Parent category not found                               |

---

### Delete Category

Permanently deletes a category and all its descendant categories. Admin chooses what happens to linked products.

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | int  | Yes      | Category ID |

**Query Parameters:**

| Param            | Type    | Default | Description                                                                                                                           |
| ---------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `deleteProducts` | boolean | `false` | `true` → delete all products linked to the category and its descendants. `false` → unlink products (remove from junction table only). |

**Example Requests:**

```
DELETE /categories/5                        → unlink products, delete category
DELETE /categories/5?deleteProducts=true    → delete products AND category
DELETE /categories/5?deleteProducts=false   → unlink products, delete category
```

**Success Response (200) — with product deletion:**

```json
{
  "success": true,
  "message": "Category and its products deleted successfully"
}
```

**Success Response (200) — without product deletion:**

```json
{
  "success": true,
  "message": "Category deleted successfully (products unlinked)"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Category not found"
}
```

---

## Data Model

### Category

| Column        | Type         | Description                                          |
| ------------- | ------------ | ---------------------------------------------------- |
| `id`          | int (PK)     | Auto-incremented primary key                         |
| `title`       | varchar(255) | Category name                                        |
| `description` | text         | Optional description                                 |
| `parent_id`   | int (FK)     | Self-referencing FK to parent category (null = root) |
| `active`      | boolean      | Whether the category is active (default: true)       |
| `created_at`  | timestamp    | Auto-set on creation                                 |
| `updated_at`  | timestamp    | Set on every update                                  |

### Product–Category Junction (`product_categories`)

| Column        | Type     | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| `id`          | int (PK) | Auto-incremented primary key                   |
| `product_id`  | int (FK) | References `products.id` (CASCADE on delete)   |
| `category_id` | int (FK) | References `categories.id` (CASCADE on delete) |

**Unique Constraint:** `(product_id, category_id)` — a product can only be linked to the same category once.

---

## Business Rules

### Tree Structure

- Categories form a **tree** (self-referencing via `parent_id`).
- **Maximum nesting depth: 3 levels** (root → child → grandchild).
- Root categories have `parent_id = null`.
- The `GET /` endpoint returns the full tree structure starting from root nodes.

### Archive Cascade

- Setting `active: false` on a category **cascades the archive to all children** recursively.
- Re-activating a parent does **not** automatically re-activate children — each must be activated individually.

### Deletion Behavior

- **Hard delete** — categories are permanently removed, not soft-deleted.
- **Descendant cascade**: deleting a category always deletes all its descendant categories.
- **Product handling** is controlled by the `deleteProducts` query parameter:
  - `true` → products linked to the category (or any descendant) are permanently deleted.
  - `false` (default) → products are only unlinked from the junction table; the products themselves remain in the database.

### Reparenting Validation

When moving a category to a new parent (`parent_id` update):

1. A category **cannot be its own parent**.
2. A category **cannot be moved under one of its own descendants** (prevents circular references).
3. The resulting tree depth **must not exceed 3 levels** (the new parent's depth + the subtree's depth is validated).

### Many-to-Many Products

- Products are linked to categories via the `product_categories` junction table.
- A product can belong to **multiple categories**.
- A category can contain **multiple products**.
- The junction table enforces uniqueness — no duplicate links.

---

## Common Response Types

### Success Response

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### List Response

```json
{
  "success": true,
  "results": 5,
  "data": [ ... ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Error Codes

| Status | Error Type          | Description                                 |
| ------ | ------------------- | ------------------------------------------- |
| 400    | BadRequestError     | Invalid input, depth exceeded, circular ref |
| 400    | ValidationError     | DTO validation failed                       |
| 401    | UnauthorizedError   | Missing or invalid JWT token                |
| 403    | ForbiddenError      | Insufficient role permissions               |
| 404    | NotFoundError       | Category or parent category not found       |
| 500    | InternalServerError | Unexpected server error                     |
