# Purchase API Documentation

## Base URL

```
/api/v2/purchases
```

---

## Table of Contents

1. [Authenticated Endpoints (Teacher)](#authenticated-endpoints-teacher)
   - [Get My Purchases](#get-my-purchases)
2. [Admin / SubAdmin Endpoints](#admin--subadmin-endpoints)
   - [Get All Purchases](#get-all-purchases)
   - [Get Purchase by ID](#get-purchase-by-id)
   - [Receive Purchase](#receive-purchase)
   - [Confirm Purchase](#confirm-purchase)
   - [Return Purchase](#return-purchase)
   - [Add Admin Note](#add-admin-note)
   - [Delete Purchase](#delete-purchase)
   - [Delete Item from Purchase](#delete-item-from-purchase)
3. [Status Flow](#status-flow)
4. [Enums & Types](#enums--types)
5. [Business Rules](#business-rules)
6. [Common Response Types](#common-response-types)
7. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication:

```
Authorization: Bearer <access_token>
```

Teacher endpoints require **Teacher** role. Admin endpoints require **Admin** or **SubAdmin** role.

---

## Authenticated Endpoints (Teacher)

---

### Get My Purchases

Returns the authenticated user's purchases, sorted by newest first.

**Endpoint:** `GET /my`  
**Auth Required:** Yes (Teacher)

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": {
    "purchases": [
      {
        "id": 15,
        "user_id": 42,
        "status": "confirmed",
        "subtotal": "250.00",
        "discount": "25.00",
        "total": "225.00",
        "purchase_serial": "A1B2C3D4-CP-20260220-001",
        "number_transferred_from": "01012345678",
        "payment_number": "01098765432",
        "notes": "Please deliver before Thursday",
        "admin_notes": null,
        "received_at": "2026-02-20T12:00:00.000Z",
        "confirmed_at": "2026-02-20T14:00:00.000Z",
        "returned_at": null,
        "created_at": "2026-02-20T10:00:00.000Z",
        "users": { "id": 42, "name": "Ahmed Hassan", "email": "ahmed@example.com", "phone": "01012345678" },
        "received_by_user": { "id": 1, "name": "Admin User" },
        "confirmed_by_user": { "id": 1, "name": "Admin User" },
        "returned_by_user": null,
        "payment_methods": { "id": 3, "name": "Vodafone Cash", "phone_number": "01098765432" },
        "payment_screenshot": { "id": 88, "url": "/uploads/images/screenshot.webp" },
        "watermark": null,
        "purchase_items": [
          {
            "id": 30,
            "product_id": 10,
            "price_at_purchase": "125.00",
            "discount": "0.00",
            "products": {
              "id": 10,
              "title": "Algebra Book",
              "serial": "ALG-101",
              "type": "Book",
              "price": "125.00",
              "thumbnail_image": { "id": 5, "url": "/uploads/images/thumb.webp" }
            },
            "purchase_item_required_fields": [
              {
                "id": 1,
                "field_definition_id": 7,
                "value": "Mohamed Ali",
                "required_field_definitions": { "id": 7, "label": "Student Name", "field_type": "text" }
              }
            ]
          }
        ],
        "coupon_usages": []
      }
    ]
  }
}
```

---
    "purchase": {
      "id": 16,
      "user_id": 42,
      "status": "pending",
      "subtotal": "125.00",
      "discount": "0",
      "total": "125.00",
      "purchase_serial": "A1B2C3D4-CP-20260223-002"
    }
  }
}
```

**Error Responses:**

| Status | Message                                                              | Condition                                    |
| ------ | -------------------------------------------------------------------- | -------------------------------------------- |
| 400    | `Product not found`                                                  | Invalid `product_id`                         |
| 400    | `Missing required product fields: <ids>`                             | Forgot to send required fields for product   |
| 400    | `Payment screenshot is required`                                     | Did not send the `payment_screenshot` file   |
| 400    | `Invalid validation for checkout payment`                            | Total/Payment mismatches                     |

---

## Admin / SubAdmin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** or **SubAdmin** role.

---

### Get All Purchases

Returns a paginated list of purchases with search and filters.

**Endpoint:** `GET /`  
**Auth Required:** Yes (Admin, SubAdmin)

**Query Parameters:**

| Param       | Type   | Default | Description                                                      |
| ----------- | ------ | ------- | ---------------------------------------------------------------- |
| `status`    | string | —       | Filter by status (`pending`, `received`, `confirmed`, `returned`) |
| `search`    | string | —       | Search in serial, phone, user name/email, product title/serial   |
| `startDate` | string | —       | Filter created_at ≥ (ISO date)                                   |
| `endDate`   | string | —       | Filter created_at ≤ (ISO date)                                   |
| `minTotal`  | number | —       | Filter total ≥                                                   |
| `maxTotal`  | number | —       | Filter total ≤                                                   |
| `page`      | number | 1       | Page number                                                      |
| `limit`     | number | 10      | Items per page                                                   |

**Example:** `GET /purchases?status=pending&search=ahmed&page=1&limit=10`

**Success Response (200):**

```json
{
  "success": true,
  "results": 1,
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  },
  "data": {
    "purchases": ["/* array of Purchase objects */"]
  }
}
```

---

### Get Purchase by ID

Returns a single purchase with all relations.

**Endpoint:** `GET /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "purchase": "/* full Purchase object */"
  }
}
```

**Error Responses:**

| Status | Message               | Condition                 |
| ------ | --------------------- | ------------------------- |
| 400    | `Invalid purchase ID` | ID is not a valid number  |
| 404    | `Purchase not found`  | Purchase does not exist   |

---

### Receive Purchase

Transitions a purchase from `pending` → `received`. Records who received it and when.

**Endpoint:** `PATCH /:id/receive`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Purchase marked as received",
  "data": {
    "purchase": {
      "status": "received",
      "received_at": "2026-02-20T12:00:00.000Z",
      "received_by_user": { "id": 1, "name": "Admin User" }
    }
  }
}
```

**Error Responses:**

| Status | Message                             | Condition                              |
| ------ | ----------------------------------- | -------------------------------------- |
| 400    | `Invalid purchase ID`               | ID is not a valid number               |
| 400    | `Purchase is already received`      | Status is not `pending`                |
| 404    | `Purchase not found`                | Purchase does not exist                |

---

### Confirm Purchase

Transitions a purchase from `received` or `returned` → `confirmed`.

**Endpoint:** `PATCH /:id/confirm`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Purchase confirmed successfully",
  "data": {
    "purchase": {
      "status": "confirmed",
      "confirmed_at": "2026-02-20T14:00:00.000Z",
      "confirmed_by_user": { "id": 1, "name": "Admin User" }
    }
  }
}
```

**Error Responses:**

| Status | Message                                                                    | Condition                                  |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------ |
| 400    | `Purchase is already confirmed`                                            | Already confirmed                          |
| 400    | `Purchase must be received or in returned status before it can be confirmed` | Status is not `received` or `returned`     |
| 404    | `Purchase not found`                                                       | Purchase does not exist                    |

---

### Return Purchase

Transitions a purchase from `received` or `confirmed` → `returned`.

**Endpoint:** `PATCH /:id/return`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Purchase returned successfully",
  "data": {
    "purchase": {
      "status": "returned",
      "returned_at": "2026-02-20T16:00:00.000Z",
      "returned_by_user": { "id": 2, "name": "SubAdmin" }
    }
  }
}
```

**Error Responses:**

| Status | Message                                                      | Condition                                |
| ------ | ------------------------------------------------------------ | ---------------------------------------- |
| 400    | `Purchase is already returned`                               | Already returned                         |
| 400    | `Only confirmed or received purchases can be returned`       | Status is not `confirmed` or `received`  |
| 404    | `Purchase not found`                                         | Purchase does not exist                  |

---

### Add Admin Note

Sets or updates the admin notes on a purchase.

**Endpoint:** `PATCH /:id/admin-note`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Request Body:**

```json
{
  "admin_notes": "string (required, max 5000 chars)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "purchase": {
      "admin_notes": "Customer called to confirm address",
      "admin_note_by": 1
    }
  }
}
```

**Error Responses:**

| Status | Message               | Condition               |
| ------ | --------------------- | ----------------------- |
| 400    | `Invalid purchase ID` | ID is not a valid number |
| 404    | `Purchase not found`  | Purchase does not exist  |
| 422    | Validation errors     | Invalid body             |

---

### Delete Purchase

Hard-deletes a purchase and all its items. If the purchase was confirmed and had coupons, the coupon usages are restored (deleted from `coupon_usages`).

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Purchase ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Purchase deleted successfully"
}
```

**Error Responses:**

| Status | Message               | Condition               |
| ------ | --------------------- | ----------------------- |
| 400    | `Invalid purchase ID` | ID is not a valid number |
| 404    | `Purchase not found`  | Purchase does not exist  |

---

### Delete Item from Purchase

Removes a single item from a purchase and recalculates totals. Cannot remove the last item — delete the entire purchase instead.

**Endpoint:** `DELETE /:id/items/:itemId`  
**Auth Required:** Yes (Admin, SubAdmin)

**URL Parameters:**

| Param    | Type   | Description      |
| -------- | ------ | ---------------- |
| `id`     | number | Purchase ID      |
| `itemId` | number | Purchase item ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Item removed from purchase",
  "data": {
    "purchase": "/* updated Purchase object with recalculated totals */"
  }
}
```

**Error Responses:**

| Status | Message                                                           | Condition                         |
| ------ | ----------------------------------------------------------------- | --------------------------------- |
| 400    | `Invalid purchase ID` / `Invalid item ID`                        | ID is not a valid number          |
| 400    | `Cannot remove the last item. Delete the entire purchase instead.` | Only one item remains             |
| 404    | `Purchase not found`                                              | Purchase does not exist           |
| 404    | `Item not found in this purchase`                                 | Item does not belong to purchase  |

---

## Status Flow

```
pending → received → confirmed
                   ↘ returned ↗
           received → returned → confirmed
```

| Transition | From | To | Endpoint |
|------------|------|----|----------|
| Receive    | `pending` | `received` | `PATCH /:id/receive` |
| Confirm    | `received` \| `returned` | `confirmed` | `PATCH /:id/confirm` |
| Return     | `received` \| `confirmed` | `returned` | `PATCH /:id/return` |

---

## Enums & Types

### Purchase Status

| Value       | Description                          |
| ----------- | ------------------------------------ |
| `pending`   | Newly created, awaiting admin review |
| `received`  | Admin has received the order         |
| `confirmed` | Order is confirmed/completed         |
| `returned`  | Order has been returned              |

### Purchase Object

```json
{
  "id": "number (auto-increment PK)",
  "user_id": "number",
  "status": "pending | received | confirmed | returned",
  "subtotal": "decimal (10,2)",
  "discount": "decimal (10,2)",
  "total": "decimal (10,2)",
  "purchase_serial": "string | null — format: XXXXXXXX-CP-YYYYMMDD-NNN",
  "payment_method_id": "number | null",
  "payment_screenshot_id": "number | null",
  "watermark_id": "number | null",
  "number_transferred_from": "string | null",
  "payment_number": "string | null",
  "notes": "string | null",
  "admin_notes": "string | null",
  "admin_note_by": "number | null",
  "received_at": "timestamp | null",
  "received_by": "number | null",
  "confirmed_at": "timestamp | null",
  "confirmed_by": "number | null",
  "returned_at": "timestamp | null",
  "returned_by": "number | null",
  "created_at": "timestamp",
  "updated_at": "timestamp | null"
}
```

### Related Objects

**PurchaseItem:**
```json
{
  "id": "number",
  "purchase_id": "number",
  "product_id": "number",
  "price_at_purchase": "decimal (10,2)",
  "discount": "decimal (10,2)",
  "products": "Product (select: id, title, serial, type, price, thumbnail_image)",
  "purchase_item_required_fields": "PurchaseItemRequiredField[]"
}
```

**PurchaseItemRequiredField:**
```json
{
  "id": "number",
  "purchase_item_id": "number",
  "field_definition_id": "number",
  "value": "string",
  "required_field_definitions": { "id": "number", "label": "string", "field_type": "text | number | date | image" }
}
```

**CouponUsage:**
```json
{
  "id": "number",
  "user_id": "number",
  "coupon_id": "number",
  "purchase_id": "number | null",
  "coupons": { "id": "number", "code": "string", "discount_amount": "decimal", "discount_percentage": "number" }
}
```

---

## Business Rules

- Purchases are created via the **cart checkout** flow (`POST /api/v2/cart/checkout`) or **fast-buy** — not directly via this API.
- A purchase serial follows the format `XXXXXXXX-CP-YYYYMMDD-NNN` (user hash + date + sequence).
- Status transitions are enforced: only valid transitions are allowed (see [Status Flow](#status-flow)).
- Deleting a confirmed purchase with coupons restores those coupon usages (deletes the `coupon_usages` records).
- Cannot remove the last item from a purchase — must delete the entire purchase.
- `admin_notes` and `admin_note_by` track which admin wrote the note.
- Each status transition records `<status>_at` (timestamp) and `<status>_by` (admin user ID).

---

## Common Response Types

### Success Response

```json
{
  "success": true,
  "message": "string (optional)",
  "data": "object | null"
}
```

### Paginated Response

```json
{
  "success": true,
  "results": 10,
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  },
  "data": {
    "purchases": []
  }
}
```

---

## Error Codes

| Status | Error Type          | Description                                           |
| ------ | ------------------- | ----------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input, wrong status transition, or missing data |
| 401    | `UnauthorizedError` | Missing or invalid authorization token                |
| 403    | `ForbiddenError`    | User does not have the required role                  |
| 404    | `NotFoundError`     | Purchase or item not found                            |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array        |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
