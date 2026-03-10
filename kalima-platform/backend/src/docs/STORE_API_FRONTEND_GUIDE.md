# Store API — Frontend Developer Guide

A consolidated reference for integrating the Kalima Store API into the frontend.

---

## Base URL & Environment

| Environment | Base URL | Auth |
|-------------|----------|------|
| All endpoints | `{API_HOST}/api/v2` | JWT Bearer token (where required) |
| Auth endpoints | `{API_HOST}/api/v2/auth` | See per-endpoint |
| Admin endpoints | `{API_HOST}/api/v2/admin` | Admin / SubAdmin only |

**Health check:** `GET /api/v2/health` → `{ "status": "ok", "version": "v2 new" }`

---

## Authentication

### Sending the token

Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token lifecycle

1. **Login / Register** → Receive `accessToken` and `refreshToken`
2. **Store tokens** (e.g. `localStorage` or httpOnly cookies)
3. **Attach** `accessToken` to every protected request
4. When access token expires (**401**) → call `POST /api/v2/auth/refresh` with `refreshToken` to get new tokens

### Refresh token request

```
POST /api/v2/auth/refresh
Content-Type: application/json

{ "refreshToken": "<your_refresh_token>" }
```

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

For lists with pagination:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

For validation errors (422):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["error message 1", "error message 2"]
}
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| **400** | Bad Request — invalid input or business rule violation |
| **401** | Unauthorized — missing or invalid token |
| **403** | Forbidden — insufficient role |
| **404** | Not Found — resource does not exist |
| **409** | Conflict — duplicate or constraint violation |
| **422** | Validation Error — DTO validation failed (see `errors` array) |
| **500** | Internal Server Error |

---

## Quick Endpoint Reference

### Auth (`/api/v2/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register/teacher` | No | Register teacher |
| POST | `/register/student` | No | Register student |
| POST | `/register/parent` | No | Register parent |
| POST | `/register/lecturer` | No | Register lecturer |
| POST | `/register/*/firebase` | No | Firebase OAuth registration |
| POST | `/login` | No | Email/password login |
| POST | `/login/firebase` | No | Firebase login |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | No | Logout (invalidate refresh token) |
| POST | `/forgot-password` | No | Request password reset email |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/verify-email` | No | Verify email with token |
| POST | `/change-password` | Yes | Change password (authenticated) |
| POST | `/link/firebase` | Yes | Link Firebase account |

See `api/AUTH_API_DOCUMENTATION.md` for full request/response bodies.

---

### Products (`/api/v2/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List products (paginated, filterable) |
| GET | `/:id` | No | Get product by ID |
| GET | `/:id/gallery` | No | Get product gallery |
| GET | `/:id/required-fields` | No | Get required checkout fields |
| POST | `/` | Admin | Create product (multipart) |
| PATCH | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft-delete product |
| POST | `/:id/thumbnail` | Admin | Upload thumbnail |
| DELETE | `/:id/thumbnail` | Admin | Remove thumbnail |
| POST | `/:id/gallery` | Admin | Add gallery images |
| PATCH | `/:id/gallery/:galleryId` | Admin | Update gallery entry |
| DELETE | `/:id/gallery/:galleryId` | Admin | Remove gallery entry |
| POST | `/:id/categories` | Admin | Attach categories |
| DELETE | `/:id/categories/:categoryId` | Admin | Detach category |
| POST | `/:id/required-fields` | Admin | Attach required fields |
| DELETE | `/:id/required-fields/:fieldDefinitionId` | Admin | Detach required field |

**List products query params:**

| Param | Type | Description |
|-------|------|-------------|
| `is_archived` | boolean | Filter archived |
| `category_id` | int | Filter by category |
| `search` | string | Search title/serial |
| `page` | int | Page (default 1) |
| `limit` | int | Per page (default 20) |

---

### Categories (`/api/v2/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roots` | No | Get root categories |
| GET | `/:id/children` | No | Get children of category |
| GET | `/` | Yes | List all categories |
| GET | `/:id` | Yes | Get category by ID |
| POST | `/` | Admin | Create category |
| PATCH | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

---

### Coupons (`/api/v2/coupons`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/generate-code` | Admin | Generate unique coupon code |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | List all coupons |
| GET | `/:id` | Admin | Get coupon by ID |
| PATCH | `/:id` | Admin | Update coupon |
| DELETE | `/:id` | Admin | Delete coupon |
| POST | `/validate` | Teacher | Validate coupon code |
| POST | `/use` | Teacher | Use coupon (one-time) |

---

### Required Fields (`/api/v2/required-fields`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/definitions` | Admin | Create field definition |
| GET | `/definitions` | Admin | List definitions |
| GET | `/definitions/:id` | Admin | Get definition |
| PATCH | `/definitions/:id` | Admin | Update definition |
| DELETE | `/definitions/:id` | Admin | Delete definition |
| POST | `/products/:productId/fields` | Admin | Attach fields to product |
| GET | `/products/:productId/fields` | Admin | Get product fields |
| DELETE | `/products/:productId/fields/:fieldDefId` | Admin | Detach field |

---

### Samples (`/api/v2/samples`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all samples |
| GET | `/:id` | No | Get sample by ID |

---

### Geography & Reference Data

**Governments** (`/api/v2/governments`)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | No |
| GET | `/:id` | No |
| GET | `/:governmentId/zones` | No |
| POST | `/` | Admin |
| PATCH | `/:id` | Admin |
| DELETE | `/:id` | Admin |

**Zones** (`/api/v2/zones`)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | No |
| GET | `/:id` | No |
| POST | `/` | Admin |
| PATCH | `/:id` | Admin |
| DELETE | `/:id` | Admin |

**Sites** (`/api/v2/sites`) — physical centers

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | No |
| GET | `/:id` | No |
| POST | `/` | Admin |
| PATCH | `/:id` | Admin |
| DELETE | `/:id` | Admin |

**Levels** (`/api/v2/levels`), **Subjects** (`/api/v2/subjects`)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | No |
| GET | `/:id` | No |
| POST | `/` | Admin |
| PATCH | `/:id` | Admin |
| DELETE | `/:id` | Admin |

**Social Media** (`/api/v2/social-media`), **Teaches At** (`/api/v2/teaches-at`), **Parent Children** (`/api/v2/parent-children`)

See respective API docs for full request/response shapes.

---

### Admin (`/api/v2/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List/search users |
| GET | `/users/:userId` | Admin | Get user details |
| GET | `/users/:userId/roles` | Admin | Get user roles |
| POST | `/users/:userId/roles` | Admin | Assign role |
| PUT | `/users/:userId/roles` | Admin | Replace all roles |
| DELETE | `/users/:userId/roles` | Admin | Revoke role |

---

## Cart & Checkout (Coming Soon)

> **Note:** Cart routes are currently disabled in the API. The backend support exists; routes will be enabled in a future release. Use this section when integrating.

**Base path:** `/api/v2/cart` (when enabled)

### Cart endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get active cart |
| POST | `/add` | Yes | Add item to cart |
| PATCH | `/items/:itemId/quantity` | Yes | Update quantity |
| DELETE | `/items/:itemId` | Yes | Remove item |
| DELETE | `/clear` | Yes | Clear cart |
| POST | `/items/apply-coupon` | Yes | Apply coupon to item |
| DELETE | `/items/:itemId/coupon` | Yes | Remove coupon from item |
| PATCH | `/items/required-fields` | Yes | Update cart item required fields |
| GET | `/checkout-preview` | Yes | Get checkout requirements |
| POST | `/checkout` | Yes | Checkout (multipart: payment screenshot) |

### Add item to cart

```
POST /api/v2/cart/add
Authorization: Bearer <token>
Content-Type: application/json
// Optional: multipart for image-type required fields

{
  "product_id": 1,
  "quantity": 2,
  "required_fields": [
    { "required_field_definition_id": 1, "value": "John Doe" }
  ]
}
```

### Checkout

```
POST /api/v2/cart/checkout
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- payment_method_id (number, required)
- numberTransferredFrom (string, required for paid orders)
- notes (string, optional)
- paymentScreenShot (file, required) — payment screenshot image
```

**Success (201):**

```json
{
  "success": true,
  "data": {
    "purchase": { "id": 1, "purchase_serial": "...", ... },
    "subtotal": 100,
    "discount": 10,
    "total": 90,
    "itemCount": 2
  }
}
```

---

## Data Types Reference

### Product (summary)

```ts
{
  id: number;
  title: string;
  description: string | null;
  type: "Book" | "Product";
  price: string;           // decimal as string
  price_after_discount: string | null;
  serial: string | null;
  thumbnail_url?: string;
  is_archived: boolean;
  categories?: { id: number; title: string }[];
  product_gallery?: Array<{ id: number; sort_order: number; image: { url: string } }>;
}
```

### Required field (for checkout)

```ts
{
  id: number;
  label: string;
  field_type: "text" | "number" | "date" | "image";
  is_required: boolean;
}
```

### Cart item required field

```ts
{
  required_field_definition_id: number;
  value: string;  // For image type: image ID as string
}
```

---

## File Uploads

### Content-Type

Use `multipart/form-data` for endpoints that accept files (e.g. product create, thumbnail, gallery, checkout screenshot).

### Field names

- Product create: `thumbnail`, `category_ids` (JSON string)
- Gallery: `gallery` (multiple files)
- Thumbnail: `thumbnail`
- Checkout: `paymentScreenShot`
- Cart item required fields (image type): field name varies by implementation

---

## Roles

| Role | Typical access |
|------|----------------|
| **Admin** | Full access, user management, delete operations |
| **SubAdmin** | Same as Admin except some delete restrictions |
| **Teacher** | Validate/use coupons, own profile |
| **Student** | Own profile, cart, purchases |
| **Parent** | Own profile, children |
| **Lecturer** | Own profile |

---

## Export Endpoints

Every list resource supports a `GET /export` endpoint for CSV and XLSX download. **All export endpoints require Admin or SubAdmin authentication.**

```
GET /api/v2/<resource>/export?format=csv
GET /api/v2/<resource>/export?format=xlsx&ids=1,2,3
```

| Param    | Type   | Required | Description                            |
|----------|--------|----------|----------------------------------------|
| `format` | string | Yes      | `"csv"` or `"xlsx"`                    |
| `ids`    | string | No       | Comma-separated IDs for selected rows  |

See `api/EXPORT_API_DOCUMENTATION.md` for full details.

---

## Related Documentation

- `api/AUTH_API_DOCUMENTATION.md` — Auth endpoints in detail
- `api/PRODUCT_SAMPLE_API_DOCUMENTATION.md` — Product sample read API and creation flow
- `api/EXPORT_API_DOCUMENTATION.md` — CSV/XLSX export endpoints for all resources
- `api/PRODUCTS_API_DOCUMENTATION.md` — Product CRUD and media
- `api/COUPON_API_DOCUMENTATION.md` — Coupon admin and usage
- `api/REQUIRED_FIELDS_API_DOCUMENTATION.md` — Checkout required fields
- `API_DOCS_INDEX.md` — Full list of docs

---

*Last updated: February 2026*
