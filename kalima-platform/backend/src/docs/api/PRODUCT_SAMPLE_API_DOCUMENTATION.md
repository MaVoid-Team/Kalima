# Product Sample API Documentation

## Base URL

```
/api/v2/samples
```

---

## Overview

Product samples are downloadable files (PDF or Word documents) that provide a preview of a product. Each product can have at most **one** sample file. Samples are stored on the server and linked to products via `product_id`.

| Aspect | Details |
|--------|---------|
| **Read access** | Public — no authentication required |
| **Create** | Via product creation (`POST /api/v2/products`) with `sample` file |
| **Relation** | One-to-one: one sample per product |

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
   - [Get All Samples](#get-all-samples)
   - [Get Sample by ID](#get-sample-by-id)
2. [Sample Creation](#sample-creation)
3. [Sample Object](#sample-object)
4. [Allowed File Types](#allowed-file-types)
5. [Error Codes](#error-codes)

---

## Public Endpoints

> Both endpoints are **public** — no `Authorization` header is required.

---

### Get All Samples

Returns all product samples, ordered by creation date (newest first). Each sample includes its linked product.

**Endpoint:** `GET /api/v2/samples`  
**Auth Required:** No

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "id": 1,
      "product_id": 5,
      "url": "/uploads/samples/1739876543210-a1b2c3d4.pdf",
      "original_name": "Math_Curriculum_Sample.pdf",
      "mime_type": "application/pdf",
      "size": 102400,
      "created_at": "2026-02-20T10:30:00.000Z",
      "products": {
        "id": 5,
        "title": "Grade 3 Math Curriculum",
        "description": "Full curriculum for grade 3 mathematics.",
        "type": "Book",
        "price": "150.00",
        "price_after_discount": "120.00",
        "serial": "MATH-G3-001",
        "thumbnail_id": 12,
        "sample_url": null,
        "is_archived": false,
        "mongo_id": null,
        "created_at": "2026-02-20T10:00:00.000Z",
        "updated_at": null,
        "deleted_at": null
      }
    },
    {
      "id": 2,
      "product_id": 7,
      "url": "/uploads/samples/1739876500000-e5f6g7h8.docx",
      "original_name": "Science_Unit1_Sample.docx",
      "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size": 25600,
      "created_at": "2026-02-19T14:00:00.000Z",
      "products": {
        "id": 7,
        "title": "Grade 4 Science Unit 1",
        "description": "Introduction to life sciences.",
        "type": "Product",
        "price": "80.00",
        "price_after_discount": null,
        "serial": "SCI-G4-U1",
        "thumbnail_id": 15,
        "sample_url": null,
        "is_archived": false,
        "mongo_id": null,
        "created_at": "2026-02-19T13:45:00.000Z",
        "updated_at": null,
        "deleted_at": null
      }
    }
  ]
}
```

---

### Get Sample by ID

Returns a single sample by its ID. Includes the linked product. Returns 404 if the sample does not exist.

**Endpoint:** `GET /api/v2/samples/:id`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Sample ID   |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "product_id": 5,
    "url": "/uploads/samples/1739876543210-a1b2c3d4.pdf",
    "original_name": "Math_Curriculum_Sample.pdf",
    "mime_type": "application/pdf",
    "size": 102100,
    "created_at": "2026-02-20T10:30:00.000Z",
    "products": {
      "id": 5,
      "title": "Grade 3 Math Curriculum",
      "description": "Full curriculum for grade 3 mathematics.",
      "type": "Book",
      "price": "150.00",
      "price_after_discount": "120.00",
      "serial": "MATH-G3-001",
      "thumbnail_id": 12,
      "sample_url": null,
      "is_archived": false,
      "mongo_id": null,
      "created_at": "2026-02-20T10:00:00.000Z",
      "updated_at": null,
      "deleted_at": null
    }
  }
}
```

**Error Responses:**

| Status | Message             | Condition                   |
| ------ | ------------------- | --------------------------- |
| 400    | `Invalid sample ID` | ID is not a valid number    |
| 404    | `Sample not found`  | Sample does not exist       |

---

## Sample Creation

Samples are **not** created via the Samples API. They are created when an Admin or SubAdmin creates a product and uploads a sample file.

**Endpoint:** `POST /api/v2/products`  
**Auth Required:** Yes (Admin, SubAdmin)

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field           | Type   | Required | Description                          |
| --------------- | ------ | -------- | ------------------------------------ |
| `title`         | string | Yes      | Product title                        |
| `description`   | string | No       | Product description                  |
| `type`          | string | Yes      | `"Book"` or `"Product"`              |
| `price`         | number | Yes      | Product price                        |
| `price_after_discount` | number | No  | Discounted price                     |
| `serial`        | string | No       | Product serial number                |
| `sample_url`    | string | No       | External sample URL (alternative to file) |
| `category_ids`  | string | No       | JSON array of category IDs, e.g. `"[1,2,3]"` |
| `thumbnail`     | file   | No       | Thumbnail image                      |
| `sample`        | file   | No       | Sample file — PDF or Word (.doc, .docx) |

**Example Request (cURL):**

```bash
curl -X POST "https://api.example.com/api/v2/products" \
  -H "Authorization: Bearer <access_token>" \
  -F "title=Grade 3 Math Curriculum" \
  -F "description=Full curriculum for grade 3" \
  -F "type=Book" \
  -F "price=150" \
  -F "category_ids=[1,2]" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "sample=@/path/to/sample.pdf"
```

**Notes:**

- Max file size per file: **150 MB**
- If both `sample` (file) and `sample_url` (string) are provided, the uploaded file takes precedence
- Products can have either an uploaded sample file, a `sample_url`, or neither — not both at once
- Deleting a product cascades to its sample (file and database record)

---

## Sample Object

| Field         | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `id`          | number | Unique identifier (auto-increment PK)           |
| `product_id`  | number | Product this sample belongs to (unique per sample) |
| `url`         | string | Path to the file (e.g. `/uploads/samples/...`)   |
| `original_name` | string | Original filename when uploaded                 |
| `mime_type`   | string | MIME type of the file                            |
| `size`        | number | File size in bytes                               |
| `created_at`  | string | ISO 8601 timestamp                               |

---

## Allowed File Types

Only the following MIME types are accepted for sample uploads:

| MIME Type                                                                 | Extension | Description          |
| ------------------------------------------------------------------------ | --------- | -------------------- |
| `application/pdf`                                                         | `.pdf`    | PDF document         |
| `application/msword`                                                      | `.doc`    | Microsoft Word 97-03 |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx`   | Microsoft Word 2007+  |

Uploading a file with any other MIME type returns **400 Bad Request** with:

```json
{
  "success": false,
  "message": "Invalid sample type: <mimetype>. Allowed: PDF, Word docs"
}
```

---

## Downloading Samples

The `url` field contains a relative path. To construct a full download URL, prepend your API host:

```
{API_HOST}{url}
```

Example:
```
https://api.example.com/uploads/samples/1739876543210-a1b2c3d4.pdf
```

Ensure static file serving is configured for `/uploads/samples` on your server.

---

## Error Codes

| Status | Error Type          | Description                                      |
| ------ | ------------------- | ------------------------------------------------ |
| 400    | `BadRequestError`   | Invalid sample ID or invalid file type            |
| 404    | `NotFoundError`    | Sample not found                                 |
| 500    | `Internal Server Error` | Server error during file operations         |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Related Documentation

- `STORE_API_FRONTEND_GUIDE.md` — Quick endpoint reference
- `API_DOCS_INDEX.md` — Full list of API docs
- Products API — Sample creation via product create

---

*Last updated: February 2026*
