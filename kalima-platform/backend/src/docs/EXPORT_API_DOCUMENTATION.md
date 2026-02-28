# Export API Documentation

## Overview

Every list resource in the Store API v2 exposes a `GET /export` endpoint that returns **all matching records** (no pagination) as a downloadable CSV or Excel file. You can narrow results using `ids` and/or **resource-specific filters** — the same filters available on the resource's "Get All" endpoint.

---

## Common Query Parameters

These parameters are accepted by **every** export endpoint:

| Param    | Type   | Required | Description                                            |
| -------- | ------ | -------- | ------------------------------------------------------ |
| `format` | string | Yes      | `"csv"` or `"xlsx"`                                    |
| `ids`    | string | No       | Comma-separated integer IDs to export specific records |

> **Note:** `ids` can be combined with resource-specific filters. When both are provided, only records matching **both** criteria are exported.

---

## Response

- **Content-Type:**
  - CSV: `text/csv; charset=utf-8`
  - XLSX: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="<resource>-<date>.csv"` (or `.xlsx`)
- **Body:** The file content (string for CSV, binary buffer for XLSX)

---

## Error Responses

| Status | Message                                 | Condition                                        |
| ------ | --------------------------------------- | ------------------------------------------------ |
| 400    | `Query parameter "format" is required…` | Missing or invalid `format` value                |
| 400    | `Invalid ID value: "…"`                 | Non-integer value in `ids`                       |
| 400    | `Export limit exceeded: …`              | More than 50,000 records (narrow your selection) |
| 401    | Unauthorized                            | Missing/invalid token (on protected endpoints)   |
| 403    | Forbidden                               | Insufficient role                                |

---

## Endpoint Reference

**All export endpoints require Admin or SubAdmin authentication.** Include `Authorization: Bearer <token>` in the request.

---

### Products

**Endpoint:** `GET /api/v2/products/export`

**Columns:** ID, Title, Serial, Type, Price, Price After Discount, Categories, Archived, Sample URL, Created At

**Filters:**

| Param         | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| `is_archived` | boolean | Filter by archived status       |
| `category_id` | number  | Filter by category ID           |
| `search`      | string  | Search in title and description |

**Examples:**

```
GET /api/v2/products/export?format=csv
GET /api/v2/products/export?format=csv&is_archived=false
GET /api/v2/products/export?format=xlsx&search=math&category_id=3
GET /api/v2/products/export?format=csv&ids=1,5,12&is_archived=false
```

---

### Categories

**Endpoint:** `GET /api/v2/categories/export`

**Columns:** ID, Title, Description, Parent ID, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/categories/export?format=csv
GET /api/v2/categories/export?format=csv&active=true
```

---

### Coupons

**Endpoint:** `GET /api/v2/coupons/export`

**Columns:** ID, Code, Product ID, Product Title, Discount Amount, Discount %, Active, Starts At, Expires At, Created At

**Filters:**

| Param        | Type    | Description                                            |
| ------------ | ------- | ------------------------------------------------------ |
| `active`     | boolean | Filter by active status                                |
| `product_id` | number  | Filter by product ID                                   |
| `startDate`  | string  | ISO date — only coupons created on or after this date  |
| `endDate`    | string  | ISO date — only coupons created on or before this date |
| `isAmount`   | boolean | `true` = fixed amount coupons, `false` = percentage    |

**Examples:**

```
GET /api/v2/coupons/export?format=csv&active=true
GET /api/v2/coupons/export?format=xlsx&product_id=5&isAmount=true
GET /api/v2/coupons/export?format=csv&startDate=2026-01-01&endDate=2026-02-28
```

---

### Purchases

**Endpoint:** `GET /api/v2/purchases/export`

**Columns:** ID, Serial, User Name, User Email, User Phone, Items, Subtotal, Discount, Total, Status, Payment Method, Number Transferred From, Received By/At, Confirmed By/At, Returned By/At, Notes, Admin Notes, Created At

**Filters:**

| Param       | Type   | Description                                                                            |
| ----------- | ------ | -------------------------------------------------------------------------------------- |
| `status`    | string | Filter by purchase status (e.g. `pending`, `confirmed`)                                |
| `search`    | string | Search in serial, user name/email/phone, product title/serial, transferred-from number |
| `startDate` | string | ISO date — purchases created on or after this date                                     |
| `endDate`   | string | ISO date — purchases created on or before this date                                    |
| `minTotal`  | number | Minimum total amount                                                                   |
| `maxTotal`  | number | Maximum total amount                                                                   |

**Examples:**

```
GET /api/v2/purchases/export?format=xlsx&status=pending
GET /api/v2/purchases/export?format=csv&startDate=2026-01-01&endDate=2026-02-28
GET /api/v2/purchases/export?format=csv&search=ahmed&minTotal=100&maxTotal=500
GET /api/v2/purchases/export?format=xlsx&status=confirmed&startDate=2026-02-01
```

---

### Samples

**Endpoint:** `GET /api/v2/samples/export`

**Columns:** ID, Product ID, Product Title, URL, Original Name, MIME Type, Size (bytes), Created At

**Filters:**

| Param    | Type   | Description                     |
| -------- | ------ | ------------------------------- |
| `search` | string | Search in title and description |

**Examples:**

```
GET /api/v2/samples/export?format=csv
GET /api/v2/samples/export?format=csv&search=physics
```

---

### Governments

**Endpoint:** `GET /api/v2/governments/export`

**Columns:** ID, Title, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/governments/export?format=csv
GET /api/v2/governments/export?format=csv&active=true
```

---

### Zones

**Endpoint:** `GET /api/v2/zones/export`

**Columns:** ID, Title, Government ID, Active, Created At

**Filters:**

| Param           | Type    | Description                    |
| --------------- | ------- | ------------------------------ |
| `government_id` | number  | Filter by parent government ID |
| `active`        | boolean | Filter by active status        |

**Examples:**

```
GET /api/v2/zones/export?format=csv&government_id=1
GET /api/v2/zones/export?format=xlsx&active=true
GET /api/v2/zones/export?format=csv&government_id=3&active=false
```

---

### Sites

**Endpoint:** `GET /api/v2/sites/export`

**Columns:** ID, Title, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/sites/export?format=csv
GET /api/v2/sites/export?format=csv&active=true
```

---

### Levels

**Endpoint:** `GET /api/v2/levels/export`

**Columns:** ID, Title, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/levels/export?format=csv
GET /api/v2/levels/export?format=xlsx&active=false
```

---

### Subjects

**Endpoint:** `GET /api/v2/subjects/export`

**Columns:** ID, Title, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/subjects/export?format=csv&active=true
```

---

### Required Field Definitions

**Endpoint:** `GET /api/v2/required-fields/definitions/export`

**Columns:** ID, Label, Field Type, Active, Created At

**Filters:**

| Param    | Type    | Description             |
| -------- | ------- | ----------------------- |
| `active` | boolean | Filter by active status |

**Examples:**

```
GET /api/v2/required-fields/definitions/export?format=csv
GET /api/v2/required-fields/definitions/export?format=csv&active=true
```

---

### Users (Admin)

**Endpoint:** `GET /api/v2/admin/users/export`

**Columns:** ID, Name, Email, Phone, Secondary Phone, Gender, Roles, Email Verified, Confirmed, Created At

**Filters:**

| Param    | Type   | Description                                         |
| -------- | ------ | --------------------------------------------------- |
| `search` | string | Search in name, email and phone                     |
| `role`   | string | Filter by role (e.g. `Teacher`, `Student`, `Admin`) |
| `portal` | string | Filter by portal (e.g. `store`, `academy`)          |

**Examples:**

```
GET /api/v2/admin/users/export?format=csv&role=Teacher
GET /api/v2/admin/users/export?format=xlsx&search=ahmed&portal=store
GET /api/v2/admin/users/export?format=csv&role=Student&portal=academy
```

---

### Payment Methods

**Endpoint:** `GET /api/v2/payment-methods/export`

**Columns:** ID, Name, Phone Number, Active, Created At

**Filters:**

| Param    | Type    | Description                      |
| -------- | ------- | -------------------------------- |
| `status` | boolean | Filter by active/inactive status |
| `search` | string  | Search by payment method name    |

**Examples:**

```
GET /api/v2/payment-methods/export?format=csv
GET /api/v2/payment-methods/export?format=csv&status=true&search=vodafone
```

---

## Usage Examples (curl)

### Export all active products as CSV

```bash
curl -o products.csv \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/products/export?format=csv&is_archived=false"
```

### Export pending purchases in a date range as Excel

```bash
curl -o purchases.xlsx \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/purchases/export?format=xlsx&status=pending&startDate=2026-01-01&endDate=2026-02-28"
```

### Export active coupons for a specific product

```bash
curl -o coupons.csv \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/coupons/export?format=csv&active=true&product_id=5"
```

### Export selected IDs combined with filters

```bash
curl -o products-subset.csv \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/products/export?format=csv&ids=1,5,12&is_archived=false"
```

### Export teachers only

```bash
curl -o teachers.xlsx \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/admin/users/export?format=xlsx&role=Teacher"
```

---

## Limits

- Maximum export size: **50,000 records** per request
- For larger datasets, use filters and/or the `ids` parameter to export in batches

---

## Frontend Integration Guide

To trigger a filtered file download from a browser:

```javascript
async function exportResource(resource, format, ids = [], filters = {}) {
  const params = new URLSearchParams({ format, ...filters });
  if (ids.length > 0) params.set("ids", ids.join(","));

  const response = await fetch(`/api/v2/${resource}/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    response.headers
      .get("content-disposition")
      ?.match(/filename="(.+)"/)?.[1] ?? `${resource}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

// Example: export active products as CSV
exportResource("products", "csv", [], { is_archived: false });

// Example: export pending purchases in date range as Excel
exportResource("purchases", "xlsx", [], {
  status: "pending",
  startDate: "2026-01-01",
  endDate: "2026-02-28",
});
```

---

## Architecture Notes

- Export logic is centralised in `backend/src/apps/store-api/export/`:
  - `export.service.ts` — registry + orchestration
  - `export.controller.ts` — generic Express handler factory (parses filters)
  - `mappers.ts` — per-resource row flattening
  - `register-resources.ts` — wires services to the registry at startup (applies filters)
- Serialization utilities live in `backend/src/libs/export/` (CSV + XLSX)
- Adding a new exportable resource requires only a mapper and a registration entry
- Filter query params are auto-coerced: `"true"`/`"false"` → boolean, numeric strings → number

---

_Last updated: February 2026_
