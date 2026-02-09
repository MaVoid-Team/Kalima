# Cart Module (v2)

> Manages the user's shopping cart with **per-item coupon** support.  
> This is the v2 implementation — the v1 cart routes (`/api/v1/ec/carts`) use cart-level coupons and remain untouched.

---

## Table of Contents

- [Overview](#overview)
- [What Changed from v1](#what-changed-from-v1)
- [API Reference](#api-reference)
  - [Cart Management](#cart-management)
  - [Per-Item Coupon Management](#per-item-coupon-management)
  - [Checkout Preview](#checkout-preview)
- [Project Structure](#project-structure)
- [Helpers](#helpers)

---

## Overview

| Concern              | What it covers                                              |
| -------------------- | ----------------------------------------------------------- |
| **Cart CRUD**        | Add items, update quantity, remove items, clear cart         |
| **Per-Item Coupons** | Apply / remove a coupon on a specific cart item              |
| **Checkout Preview** | Preview required fields and pricing before creating a purchase |

---

## What Changed from v1

| Aspect            | v1 (`/api/v1/ec/carts`)                     | v2 (`/api/v2/ec/carts`)                           |
| ----------------- | -------------------------------------------- | ------------------------------------------------- |
| **Coupon scope**  | Single coupon on the whole cart               | Coupon per cart item                               |
| **Discount calc** | `cart.discount = coupon.value`                | `item.discount = coupon.value`, summed for cart    |
| **Apply coupon**  | `POST /apply-coupon` with `{ couponCode }`   | `POST /items/apply-coupon` with `{ couponCode, itemId }` |
| **Remove coupon** | Not supported                                | `DELETE /items/:itemId/coupon`                     |
| **Controller**    | `ec.cartController.js` (model methods)       | `cart/` folder (helper functions)                  |

---

## API Reference

**Base path:** `/api/v2/ec/carts`  
**Auth:** All routes require JWT (`verifyJWT` middleware).

---

### Cart Management

#### `GET /` — Get Active Cart

Returns the user's active cart with items, product details, and per-item coupon info.

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "itemCount": 2,
    "cart": {
      "_id": "...",
      "user": "...",
      "status": "active",
      "subtotal": 500,
      "discount": 50,
      "total": 450,
      "items": ["..."],
      "itemsWithDetails": [
        {
          "_id": "item1",
          "product": {
            "title": "Physics Book",
            "thumbnail": "...",
            "price": 300,
            "priceAfterDiscount": 250
          },
          "quantity": 1,
          "priceAtAdd": 250,
          "finalPrice": 200,
          "discount": 50,
          "couponCode": {
            "couponCode": "ABC12345",
            "value": 50,
            "isActive": true
          },
          "productSnapshot": { "..." }
        }
      ]
    }
  }
}
```

**Response `200` (empty):**

```json
{
  "status": "success",
  "data": {
    "cart": null,
    "itemCount": 0
  }
}
```

---

#### `POST /add` — Add Item to Cart

**Request Body:**

| Field       | Type       | Required | Default | Description                   |
| ----------- | ---------- | -------- | ------- | ----------------------------- |
| `productId` | `ObjectId` | Yes      | —       | The product to add            |
| `quantity`   | `Number`   | No       | `1`     | How many units to add         |

**Request:**

```json
{
  "productId": "664a1b2c3d4e5f6a7b8c9d0e",
  "quantity": 1
}
```

**Response `201` (new item):**

```json
{
  "status": "success",
  "message": "Item added to cart",
  "action": "created",
  "data": {
    "_id": "...",
    "cart": "...",
    "product": "...",
    "quantity": 1,
    "priceAtAdd": 250,
    "finalPrice": 250,
    "discount": 0,
    "couponCode": null,
    "productSnapshot": { "..." }
  }
}
```

**Response `200` (quantity updated):**

```json
{
  "status": "success",
  "message": "Item quantity updated",
  "action": "updated",
  "data": { "..." }
}
```

**Errors:**

| Status | Condition                          |
| ------ | ---------------------------------- |
| `400`  | Cannot mix product types in cart   |
| `404`  | Product not found                  |

---

#### `PATCH /items/:itemId/quantity` — Update Item Quantity

**URL Params:** `itemId` — the cart item ID.

**Request Body:**

| Field      | Type     | Required | Description              |
| ---------- | -------- | -------- | ------------------------ |
| `quantity` | `Number` | Yes      | New quantity (min: `1`)  |

**Request:**

```json
{
  "quantity": 3
}
```

**Response `200`:**

```json
{
  "status": "success",
  "message": "Item quantity updated",
  "data": {
    "_id": "...",
    "quantity": 3,
    "priceAtAdd": 250,
    "finalPrice": 700,
    "discount": 50
  }
}
```

---

#### `DELETE /items/:itemId` — Remove Item from Cart

**URL Params:** `itemId` — the cart item ID.

**Response `200`:**

```json
{
  "status": "success",
  "message": "Item removed from cart successfully"
}
```

---

#### `DELETE /clear` — Clear Cart

**Response `200`:**

```json
{
  "status": "success",
  "message": "Cart cleared successfully",
  "data": {
    "cart": {
      "items": [],
      "subtotal": 0,
      "discount": 0,
      "total": 0
    }
  }
}
```

---

### Per-Item Coupon Management

#### `POST /items/apply-coupon` — Apply Coupon to Item

Applies a coupon to a specific cart item. Each item can have at most one coupon. Each coupon can only be applied to one item in the cart.

**Request Body:**

| Field        | Type       | Required | Description                    |
| ------------ | ---------- | -------- | ------------------------------ |
| `couponCode` | `String`   | Yes      | The 8-character coupon code    |
| `itemId`     | `ObjectId` | Yes      | The cart item to apply it to   |

**Request:**

```json
{
  "couponCode": "ABC12345",
  "itemId": "664a1b2c3d4e5f6a7b8c9d0e"
}
```

**Response `200`:**

```json
{
  "status": "success",
  "message": "Coupon applied to item successfully",
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "product": "...",
    "quantity": 1,
    "priceAtAdd": 250,
    "finalPrice": 200,
    "discount": 50,
    "couponCode": "..."
  }
}
```

**Errors:**

| Status | Condition                                           |
| ------ | --------------------------------------------------- |
| `400`  | Coupon code is required                             |
| `400`  | Item ID is required                                 |
| `400`  | Coupon already used                                 |
| `400`  | Coupon expired                                      |
| `400`  | Item already has a coupon applied                   |
| `400`  | Coupon already applied to another item in the cart  |
| `404`  | Invalid coupon code                                 |
| `404`  | Cart not found                                      |
| `404`  | Cart item not found                                 |

---

#### `DELETE /items/:itemId/coupon` — Remove Coupon from Item

**URL Params:** `itemId` — the cart item ID.

**Response `200`:**

```json
{
  "status": "success",
  "message": "Coupon removed from item successfully",
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "quantity": 1,
    "priceAtAdd": 250,
    "finalPrice": 250,
    "discount": 0,
    "couponCode": null
  }
}
```

**Errors:**

| Status | Condition                                 |
| ------ | ----------------------------------------- |
| `400`  | Item does not have a coupon applied       |
| `404`  | Cart not found                             |
| `404`  | Cart item not found                        |

---

### Checkout Preview

#### `GET /checkout-preview` — Preview Checkout Requirements

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "cart": {
      "subtotal": 500,
      "discount": 50,
      "total": 450,
      "items": [ "..." ]
    },
    "hasBooks": true,
    "requiresBookDetails": true,
    "requiredFields": {
      "common": ["numberTransferredFrom", "paymentScreenShot"],
      "books": ["nameOnBook", "numberOnBook", "seriesName"]
    }
  }
}
```

---

## Project Structure

```
cart/
├── index.js              # Barrel export — all handlers
├── helper.js             # updateCartTotals, removeItemFromCart, clearCartItems, etc.
├── add-to-cart.js        # POST /add
├── get-cart.js           # GET /
├── update-item-quantity.js # PATCH /items/:itemId/quantity
├── remove-from-cart.js   # DELETE /items/:itemId
├── clear-cart.js         # DELETE /clear
├── apply-coupon.js       # POST /items/apply-coupon     (v2 — per-item)
├── remove-coupon.js      # DELETE /items/:itemId/coupon  (v2 — per-item)
├── get-preview.js        # GET /checkout-preview
├── checkout.js           # Legacy checkout (unused in v2 — use cart-purchase instead)
└── README.md
```

---

## Helpers

**File:** `helper.js`

| Export                  | Signature                                          | Description                                                                                             |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `updateCartTotals`      | `async (cartId) → void`                            | Aggregates `subtotal` (price × qty), `discount` (sum of per-item discounts), and `total` via MongoDB aggregation |
| `removeItemFromCart`    | `async (cartId, itemId) → ECCartItem`              | Deletes item, removes from cart array, recalculates totals                                               |
| `clearCartItems`        | `async (cartId) → ECCart`                           | Deletes all items, resets cart totals to 0                                                                |
| `validateCheckoutRules` | `(cartItems, body) → void`                          | Validates required fields based on product types (throws `AppError`)                                     |
| `createPurchaseRecords` | `async (user, cartItems, checkoutData, session) → []` | Creates `ECPurchase` / `ECBookPurchase` records (used by legacy checkout)                                |
| `getCheckoutRequirements` | `(cartItems) → Object`                            | Returns required fields info for checkout preview                                                        |
