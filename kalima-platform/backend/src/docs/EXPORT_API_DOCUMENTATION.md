# Export API Documentation

## Overview

Every list resource in the Store API v2 exposes a `GET /export` endpoint that returns **all records** (no pagination) as a downloadable CSV or Excel file. An optional `ids` query parameter restricts the export to selected records only.

---

## Common Query Parameters

| Param    | Type   | Required | Description                                             |
| -------- | ------ | -------- | ------------------------------------------------------- |
| `format` | string | Yes      | `"csv"` or `"xlsx"`                                     |
| `ids`    | string | No       | Comma-separated integer IDs to export specific records   |

**Examples:**

```
GET /api/v2/products/export?format=csv
GET /api/v2/products/export?format=xlsx&ids=1,5,12
GET /api/v2/coupons/export?format=csv&ids=3,7
```

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

### Public Endpoints (no auth)

| Resource     | Endpoint                          | Columns                                                    |
| ------------ | --------------------------------- | ---------------------------------------------------------- |
| Products     | `GET /api/v2/products/export`     | ID, Title, Serial, Type, Price, Price After Discount, Categories, Archived, Sample URL, Created At |
| Samples      | `GET /api/v2/samples/export`      | ID, Product ID, Product Title, URL, Original Name, MIME Type, Size (bytes), Created At |
| Governments  | `GET /api/v2/governments/export`  | ID, Title, Active, Created At                              |
| Zones        | `GET /api/v2/zones/export`        | ID, Title, Government ID, Active, Created At               |
| Sites        | `GET /api/v2/sites/export`        | ID, Title, Active, Created At                              |
| Levels       | `GET /api/v2/levels/export`       | ID, Title, Active, Created At                              |
| Subjects     | `GET /api/v2/subjects/export`     | ID, Title, Active, Created At                              |

### Authenticated Endpoints

| Resource     | Endpoint                          | Auth           | Columns                                  |
| ------------ | --------------------------------- | -------------- | ---------------------------------------- |
| Categories   | `GET /api/v2/categories/export`   | Any auth user  | ID, Title, Description, Parent ID, Active, Created At |

### Admin / SubAdmin Endpoints

| Resource               | Endpoint                                      | Columns                                                                                      |
| ---------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Coupons                | `GET /api/v2/coupons/export`                  | ID, Code, Product ID, Product Title, Discount Amount, Discount %, Active, Starts At, Expires At, Created At |
| Purchases              | `GET /api/v2/purchases/export`                | ID, Serial, User Name, User Email, User Phone, Items, Subtotal, Discount, Total, Status, Payment Method, Number Transferred From, Received By/At, Confirmed By/At, Returned By/At, Notes, Admin Notes, Created At |
| Users                  | `GET /api/v2/admin/users/export`              | ID, Name, Email, Phone, Secondary Phone, Gender, Roles, Email Verified, Confirmed, Created At |
| Required Fields        | `GET /api/v2/required-fields/definitions/export` | ID, Label, Field Type, Active, Created At |

### Admin-Only Endpoints

| Resource         | Endpoint                              | Columns                                    |
| ---------------- | ------------------------------------- | ------------------------------------------ |
| Payment Methods  | `GET /api/v2/payment-methods/export`  | ID, Name, Phone Number, Active, Created At |

---

## Usage Examples

### Export all products as CSV

```bash
curl -o products.csv \
  "https://api.example.com/api/v2/products/export?format=csv"
```

### Export selected purchases as Excel

```bash
curl -o purchases.xlsx \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/purchases/export?format=xlsx&ids=10,15,22"
```

### Export all coupons as Excel

```bash
curl -o coupons.xlsx \
  -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/v2/coupons/export?format=xlsx"
```

---

## Limits

- Maximum export size: **50,000 records** per request
- For larger datasets, use the `ids` parameter to export in batches

---

## Frontend Integration Guide

To trigger a file download from a browser:

```javascript
async function exportResource(resource, format, ids = []) {
  const params = new URLSearchParams({ format });
  if (ids.length > 0) params.set("ids", ids.join(","));

  const response = await fetch(
    `/api/v2/${resource}/export?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = response.headers.get("content-disposition")
    ?.match(/filename="(.+)"/)?.[1] ?? `${resource}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Architecture Notes

- Export logic is centralised in `backend/src/apps/store-api/export/`:
  - `export.service.ts` — registry + orchestration
  - `export.controller.ts` — generic Express handler factory
  - `mappers.ts` — per-resource row flattening
  - `register-resources.ts` — wires services to the registry at startup
- Serialization utilities live in `backend/src/libs/export/` (CSV + XLSX)
- Adding a new exportable resource requires only a mapper and a registration entry

---

*Last updated: February 2026*
