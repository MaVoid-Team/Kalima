# Product Sample API Documentation

## Base URL

```
/api/v2/samples
```

---

## Overview

Samples are rich media files (PDFs, images, videos, Word, PowerPoint) used to display previews of courses or products. They can stand alone within a sample section or be strictly linked to a `product_id`.

| Aspect | Details |
|--------|---------|
| **Read access** | Public — no authentication required |
| **Create/Update/Delete**| Managed via Sample Sections (`POST /api/v2/sample-sections/:sectionId/samples`) |
| **Relation** | Standalone or Many-to-One with products (optional `product_id`) |

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

Returns all samples globally, typically supporting pagination and search.

**Endpoint:** `GET /api/v2/samples`  
**Auth Required:** No

**Query Parameters:**
| Param  | Type   | Description                               |
| ------ | ------ | ----------------------------------------- |
| `page` | number | Page number (default: 1)                  |
| `limit`| number | Items per page (default: 20)              |
| `search`| string | Search by file name or attached product   |

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "id": 1,
      "media_type": "pdf",
      "title": "Sample Curriculum",
      "high_quality_url": "/uploads/samples/123-hq.pdf",
      "low_quality_url": "/uploads/samples/123-lq.pdf",
      "original_name": "Math_Curriculum_Sample.pdf",
      "mime_type": "application/pdf",
      "size": 102400,
      "created_at": "2026-02-20T10:30:00.000Z",
      "products": {
        "id": 5,
        "title": "Grade 3 Math Curriculum"
      },
      "is_displayable": true,
      "thumbnail": "/uploads/samples/123-hq.pdf"
    },
    {
      "id": 2,
      "media_type": "word",
      "title": "Independent Science Guide",
      "high_quality_url": "/uploads/samples/456-hq.docx",
      "low_quality_url": null,
      "original_name": "Science_Unit1_Sample.docx",
      "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size": 25600,
      "created_at": "2026-02-19T14:00:00.000Z",
      "products": null,
      "is_displayable": false,
      "thumbnail": "/uploads/samples/456-hq.docx"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20
  }
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
    "media_type": "pdf",
    "title": "Sample Curriculum",
    "high_quality_url": "/uploads/samples/123-hq.pdf",
    "low_quality_url": "/uploads/samples/123-lq.pdf",
    "original_name": "Math_Curriculum_Sample.pdf",
    "mime_type": "application/pdf",
    "size": 102400,
    "created_at": "2026-02-20T10:30:00.000Z",
    "products": {
      "id": 5,
      "title": "Grade 3 Math Curriculum"
    },
    "is_displayable": true,
    "thumbnail": "/uploads/samples/123-hq.pdf"
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

Samples are typically managed implicitly through Sample Sections endpoints.

**Endpoint:** `POST /api/v2/sample-sections/:sectionId/samples`  
**Auth Required:** Yes (Admin, SubAdmin, Moderator)

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field           | Type   | Required | Description                          |
| --------------- | ------ | -------- | ------------------------------------ |
| `title`         | string | No       | Sample title                         |
| `product_id`    | number | No       | Tied product ID (can be missing)     |
| `media_type`    | enum   | No       | Automatically interpreted if omitted |
| `high_quality`  | file   | No*      | Primary dense file upload            |
| `low_quality`   | file   | No*      | Lightweight variant                  |

*\* At least one file (`high_quality` or `low_quality`) is fully required.*

**Example Request (cURL):**

```bash
curl -X POST "https://api.example.com/api/v2/sample-sections/3/samples" \
  -H "Authorization: Bearer <access_token>" \
  -F "title=Sample Preview" \
  -F "product_id=5" \
  -F "high_quality=@/path/to/hq.pdf"
```

---

## Sample Object

| Field              | Type    | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| `id`               | number  | Unique identifier (auto-increment PK)                    |
| `product_id`       | number  | Tied product (nullable)                                  |
| `section_id`       | number  | Tied sample-section ID                                   |
| `media_type`       | enum    | E.g. `pdf`, `image`, `video`, `word`, `powerpoint`       |
| `high_quality_url` | string  | Path/url to HD artifact (nullable)                       |
| `low_quality_url`  | string  | Path/url to LD artifact (nullable)                       |
| `thumbnail`        | string  | Auto-inferred fallback thumbnail link                    |
| `is_displayable`   | boolean | If the client can preview it globally inline             |
| `original_name`    | string  | Original filename when uploaded                          |
| `mime_type`        | string  | MIME type of the file                                    |
| `size`             | number  | File size in bytes                                       |
| `created_at`       | string  | ISO 8601 timestamp                                       |

---

## Allowed File Types

Only the following MIME types are accepted for sample uploads:

| MIME Type                                                                 | Extension            | Description             |
| ------------------------------------------------------------------------ | -------------------- | ----------------------- |
| `application/pdf`                                                         | `.pdf`               | PDF document            |
| `image/jpeg`, `image/png`, `image/webp`, `image/gif`                      | `.jpg`, `.png`, etc. | Images                  |
| `video/mp4`, `video/webm`, `video/quicktime`                              | `.mp4`, `.mov`       | Videos                  |
| `application/msword`                                                      | `.doc`               | Microsoft Word 97-03    |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx`              | Microsoft Word 2007+    |
| `application/vnd.ms-powerpoint`                                           | `.ppt`               | Microsoft PowerPoint    |
| `application/vnd.openxmlformats-officedocument.presentationml.presentation`| `.pptx`              | Microsoft PPTX        |

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
