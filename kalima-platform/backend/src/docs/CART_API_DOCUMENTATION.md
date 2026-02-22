# Cart API Documentation

## Base URL

```
/api/v2/cart
```

---

## Table of Contents

1. [Cart CRUD](#cart-crud)
   - [Get Cart](#get-cart)
   - [Add Item to Cart](#add-item-to-cart)
   - [Update Item Quantity](#update-item-quantity)
   - [Remove Item from Cart](#remove-item-from-cart)
   - [Clear Cart](#clear-cart)
2. [Coupon](#coupon)
   - [Apply Coupon to Cart Item](#apply-coupon-to-cart-item)
   - [Remove Coupon from Cart Item](#remove-coupon-from-cart-item)
3. [Required Fields](#required-fields)
   - [Update Cart Item Required Fields](#update-cart-item-required-fields)
4. [Checkout](#checkout)
   - [Get Checkout Preview](#get-checkout-preview)
   - [Checkout](#checkout-1)
5. [Enums & Types](#enums--types)
6. [Business Rules](#business-rules)
7. [Error Codes](#error-codes)

---

## Authentication

All cart endpoints require JWT authentication:

```
Authorization: Bearer <access_token>
```

---

## Cart CRUD

---

### Get Cart

Returns the authenticated user's active cart with all items, product details, and required field values. Uses Redis read-through caching for performance.

**Endpoint:** `GET /`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 42,
    "status": "active",
    "subtotal": "250.00",
    "discount": "25.00",
    "total": "225.00",
    "created_at": "2026-02-20T10:00:00.000Z",
    "cart_items": [
      {
        "id": 12,
        "cart_id": 5,
        "product_id": 10,
        "coupon_id": null,
        "quantity": 2,
        "price_at_add": "125.00",
        "final_price": "125.00",
        "discount": "0.00",
        "required_fields_filled": false,
        "products": {
          "id": 10,
          "title": "Algebra Book",
          "type": "Book",
          "price": "125.00"
        },
        "cart_item_required_fields": [
          {
            "id": 1,
            "field_definition_id": 7,
            "value": "Mohamed Ali"
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

| Status | Message                 | Condition                          |
| ------ | ----------------------- | ---------------------------------- |
| 404    | `Active cart not found` | User has no active cart            |

---

### Add Item to Cart

Adds a product to the cart. If the product already exists, increments the quantity. Creates a new cart if the user doesn't have an active one. Supports an optional image upload for image-type required fields.

**Endpoint:** `POST /items`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data` (if uploading image) or `application/json`

**Request Body:**

```json
{
  "product_id": "number (required)",
  "quantity": "number (required, >= 1)",
  "required_fields": [
    {
      "required_field_definition_id": "number (required)",
      "value": "string (required)"
    }
  ]
}
```

**File Fields:**

| Field   | Type  | Description                                      |
| ------- | ----- | ------------------------------------------------ |
| `image` | image | Required field image (for image-type fields only) |

> **Note:** `productId` is also accepted as an alias for `product_id`.

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "cart_id": 5,
    "product_id": 10,
    "quantity": 2,
    "price_at_add": "125.00",
    "final_price": "125.00",
    "discount": "0.00"
  }
}
```

**Error Responses:**

| Status | Message              | Condition            |
| ------ | -------------------- | -------------------- |
| 404    | `Product not found`  | Invalid product_id   |
| 422    | Validation errors    | Invalid body         |

---

### Update Item Quantity

Updates the quantity of a cart item.

**Endpoint:** `PATCH /items/:itemId/quantity`  
**Auth Required:** Yes

**URL Parameters:**

| Param    | Type   | Description  |
| -------- | ------ | ------------ |
| `itemId` | number | Cart item ID |

**Request Body:**

```json
{
  "quantity": "number (required, >= 1)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "quantity": 3
  }
}
```

**Error Responses:**

| Status | Message                                 | Condition                    |
| ------ | --------------------------------------- | ---------------------------- |
| 404    | `Cart item not found in user's cart`    | Item doesn't exist or wrong cart |
| 422    | Validation errors                       | Invalid body                 |

---

### Remove Item from Cart

Removes a single item from the cart and recalculates totals.

**Endpoint:** `DELETE /items/:itemId`  
**Auth Required:** Yes

**URL Parameters:**

| Param    | Type   | Description  |
| -------- | ------ | ------------ |
| `itemId` | number | Cart item ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Error Responses:**

| Status | Message                                 | Condition                    |
| ------ | --------------------------------------- | ---------------------------- |
| 404    | `Cart item not found in user's cart`    | Item doesn't exist or wrong cart |

---

### Clear Cart

Removes all items from the active cart.

**Endpoint:** `DELETE /`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "status": "active",
    "subtotal": "0.00",
    "discount": "0.00",
    "total": "0.00",
    "cart_items": []
  }
}
```

---

## Coupon

---

### Apply Coupon to Cart Item

Applies a coupon code to a specific cart item. Each coupon can only be applied to one item per cart, and each item can only have one coupon.

**Endpoint:** `POST /items/coupon`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "couponCode": "string (required)",
  "itemId": "number (required, cart item ID)"
}
```

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Message                                                      | Condition                              |
| ------ | ------------------------------------------------------------ | -------------------------------------- |
| 400    | `couponCode and itemId are required`                         | Missing required fields                |
| 400    | `Invalid coupon code`                                        | Coupon not found, expired, or inactive |
| 400    | `This coupon is already applied to another item in your cart` | Same coupon on different item          |
| 400    | `This item already has a coupon applied`                     | Item already has a coupon              |
| 400    | `You have already used this coupon`                          | Coupon already used by this user       |
| 404    | `Cart item not found in user's cart`                         | Invalid itemId                         |

---

### Remove Coupon from Cart Item

Removes the coupon from a cart item and resets the discount to 0.

**Endpoint:** `DELETE /items/:itemId/coupon`  
**Auth Required:** Yes

**URL Parameters:**

| Param    | Type   | Description  |
| -------- | ------ | ------------ |
| `itemId` | number | Cart item ID |

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Message                                 | Condition                    |
| ------ | --------------------------------------- | ---------------------------- |
| 404    | `Cart item not found in user's cart`    | Invalid itemId               |

---

## Required Fields

---

### Update Cart Item Required Fields

Updates the required field values for a cart item. Supports an image upload for image-type fields. Replaces all existing required fields for the item.

**Endpoint:** `PATCH /items/required-fields`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data` (if uploading image) or `application/json`

**Request Body:**

```json
{
  "cart_item_id": "number (required)",
  "required_fields": [
    {
      "required_field_definition_id": "number (required)",
      "value": "string (required)"
    }
  ]
}
```

**File Fields:**

| Field   | Type  | Description                                     |
| ------- | ----- | ----------------------------------------------- |
| `image` | image | Image for image-type required fields (optional) |

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Message                                          | Condition                       |
| ------ | ------------------------------------------------ | ------------------------------- |
| 400    | `Cart item does not belong to user's cart`       | Wrong user                      |
| 404    | `Cart item not found`                            | Invalid cart_item_id            |
| 422    | Validation errors                                | Invalid body                    |

---

## Checkout

---

### Get Checkout Preview

Returns checkout requirements based on the cart contents. It checks all items against the database to determine which exact products are missing which specific required fields. Returns an `isCheckoutReady` boolean that must be true to proceed to checkout.

**Endpoint:** `GET /checkout/preview`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "hasBooks": true,
    "requiredFields": {
      "common": [
        "numberTransferredFrom",
        "paymentScreenShot"
      ],
      "itemsMissingFields": [
        {
          "cart_item_id": 35,
          "product_id": 10,
          "product_name": "Algebra Book",
          "missing_fields": [
            {
              "id": 7,
              "label": "nameOnBook",
              "field_type": "text"
            }
          ]
        }
      ]
    },
    "isCheckoutReady": false
  }
}
```

**Error Responses:**

| Status | Message                 | Condition              |
| ------ | ----------------------- | ---------------------- |
| 404    | `Active cart not found` | No active cart         |

---

### Checkout

Processes the cart checkout: validates items & required fields, uploads payment screenshot, creates a purchase, records coupon usages, updates user analytics, clears the cart, and sends an admin notification.

**Endpoint:** `POST /checkout`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "payment_method_id": "number (required)",
  "numberTransferredFrom": "string (required)",
  "notes": "string (optional)"
}
```

> **Note:** `paymentMethod` is also accepted as an alias for `payment_method_id`.

**File Fields:**

| Field               | Type  | Description                         |
| ------------------- | ----- | ----------------------------------- |
| `paymentScreenshot` | image | Payment proof screenshot (required) |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "success": true,
    "purchase": {
      "id": 15,
      "user_id": 42,
      "status": "pending",
      "subtotal": "250.00",
      "discount": "25.00",
      "total": "225.00",
      "purchase_serial": "A1B2C3D4-CP-20260220-001",
      "payment_method_id": 3,
      "payment_screenshot_id": 88,
      "notes": "Please deliver before Thursday",
      "purchase_items": [
        {
          "id": 30,
          "product_id": 10,
          "price_at_purchase": "125.00",
          "discount": "12.50",
          "purchase_item_required_fields": [
            { "field_definition_id": 7, "value": "Mohamed Ali" }
          ]
        },
        {
          "id": 31,
          "product_id": 10,
          "price_at_purchase": "125.00",
          "discount": "12.50",
          "purchase_item_required_fields": [
            { "field_definition_id": 7, "value": "Mohamed Ali" }
          ]
        }
      ]
    },
    "subtotal": 250,
    "discount": 25,
    "total": 225,
    "itemCount": 2
  }
}
```

**Error Responses:**

| Status | Message                                                                   | Condition                              |
| ------ | ------------------------------------------------------------------------- | -------------------------------------- |
| 400    | `Cart is empty`                                                           | No items in cart                       |
| 400    | `Cart item for product X is missing required fields: ...`                 | Missing required fields for a product  |
| 400    | `Payment method is required`                                              | No payment_method_id                   |
| 400    | `Payment screenshot is required`                                          | No file uploaded                       |
| 400    | `Invalid or inactive payment method`                                      | Payment method not found or inactive   |
| 404    | `Active cart not found`                                                   | No active cart                         |
| 404    | `User not found`                                                          | Invalid user                           |

---

## Enums & Types

### Cart Status

| Value          | Description                   |
| -------------- | ----------------------------- |
| `active`       | Active cart, in use           |
| `checked_out`  | Cart has been checked out     |

### Cart Object

```json
{
  "id": "number (auto-increment PK)",
  "user_id": "number",
  "status": "active | checked_out",
  "subtotal": "decimal (10,2)",
  "discount": "decimal (10,2)",
  "total": "decimal (10,2)",
  "created_at": "timestamp",
  "updated_at": "timestamp | null",
  "cart_items": "CartItem[]"
}
```

### CartItem Object

```json
{
  "id": "number",
  "cart_id": "number",
  "product_id": "number",
  "coupon_id": "number | null",
  "quantity": "number (default: 1)",
  "price_at_add": "decimal (10,2) — price at the time the item was added",
  "final_price": "decimal (10,2)",
  "discount": "decimal (10,2) — applied coupon discount",
  "required_fields_filled": "boolean",
  "products": "Product object",
  "cart_item_required_fields": "CartItemRequiredField[]"
}
```

### CartItemRequiredField Object

```json
{
  "id": "number",
  "cart_item_id": "number",
  "field_definition_id": "number",
  "value": "string"
}
```

---

## Business Rules

- Each user can have at most **one active cart** at a time.
- Adding an existing product to the cart increments the quantity rather than creating a duplicate item.
- If no active cart exists when adding an item, one is created automatically.
- Cart totals (subtotal, discount, total) are recalculated on every item add/remove/coupon change.
- Each coupon can only be applied to **one item per cart**.
- Each item can only have **one coupon** at a time.
- Each user can use each coupon **only once** (enforced via `coupon_usages` table).
- On checkout, all product required fields must be filled for every cart item.
- Checkout creates a purchase, records coupon usages, updates user analytics, marks the cart as `checked_out`, deletes all cart items, and publishes an admin notification via Redis stream.
- Cart data is cached in Redis with automatic invalidation on mutations.

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

---

## Error Codes

| Status | Error Type          | Description                                             |
| ------ | ------------------- | ------------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input, empty cart, duplicate coupon, etc.        |
| 401    | `UnauthorizedError` | Missing or invalid authorization token                  |
| 404    | `NotFoundError`     | Cart, cart item, or product not found                   |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array          |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
