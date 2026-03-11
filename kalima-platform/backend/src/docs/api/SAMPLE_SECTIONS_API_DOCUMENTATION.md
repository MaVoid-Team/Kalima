# [NEW] Sample Sections API Documentation

## Base URL

```
/api/v2/sample-sections
```

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
   - [[NEW] Get All Sample Sections](#new-get-all-sample-sections)
   - [[NEW] Get Sample Section by ID](#new-get-sample-section-by-id)
   - [[NEW] Preview Sample](#new-preview-sample)
   - [[NEW] Download Sample](#new-download-sample)
2. [Admin Endpoints](#admin-endpoints)
   - [[NEW] Create Sample Section](#new-create-sample-section)
   - [[NEW] Update Sample Section](#new-update-sample-section)
   - [[NEW] Delete Sample Section](#new-delete-sample-section)
   - [[NEW] Create Sample (Multipart)](#new-create-sample-multipart)
   - [[NEW] Update Sample](#new-update-sample)
   - [[NEW] Delete Sample](#new-delete-sample)

---

## Authentication

Public endpoints do not require authentication. Admin endpoints require JWT authentication with **Admin** or **SubAdmin** role:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

### [NEW] Get All Sample Sections

List all sample sections.

**Endpoint:** `GET /`  
**Auth Required:** No

---

### [NEW] Get Sample Section by ID

Get a specific sample section with its associated samples.

**Endpoint:** `GET /:id`  
**Auth Required:** No

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Section ID  |

---

### [NEW] Preview Sample

Serve high-quality (protected) preview of a sample.

**Endpoint:** `GET /:sectionId/samples/:id/preview`  
**Auth Required:** No

**URL Parameters:**

| Param       | Type   | Description |
| ----------- | ------ | ----------- |
| `sectionId` | string | Section ID  |
| `id`        | string | Sample ID   |

---

### [NEW] Download Sample

Serve a low-quality version of the sample for downloading.

**Endpoint:** `GET /:sectionId/samples/:id/download`  
**Auth Required:** No

**URL Parameters:**

| Param       | Type   | Description |
| ----------- | ------ | ----------- |
| `sectionId` | string | Section ID  |
| `id`        | string | Sample ID   |

---

## Admin Endpoints

### [NEW] Create Sample Section

Create a new sample section.

**Endpoint:** `POST /`  
**Auth Required:** Yes (Admin)

**Request Body:**

```json
{
  "title": "Audio Samples",
  "description": "High quality audio files",
  "thumbnail_url": "https://example.com/thumb.png",
  "sort_order": 1,
  "active": true
}
```

| Field           | Type    | Required | Description |
| --------------- | ------- | -------- | ----------- |
| `title`         | string  | Yes      | Max 255 chars |
| `description`   | string  | No       | |
| `thumbnail_url` | string  | No       | |
| `sort_order`    | number  | No       | Min 0 |
| `active`        | boolean | No       | |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v2/sample-sections \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Audio Samples", "active": true}'
```

---

### [NEW] Update Sample Section

Update an existing sample section.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Section ID  |

**Request Body (All Optional):**

```json
{
  "title": "Video Samples",
  "active": false
}
```

| Field           | Type    | Required | Description |
| --------------- | ------- | -------- | ----------- |
| `title`         | string  | No       | Max 255 chars |
| `description`   | string  | No       | |
| `thumbnail_url` | string  | No       | |
| `sort_order`    | number  | No       | Min 0 |
| `active`        | boolean | No       | |

**Example Request:**
```bash
curl -X PATCH http://localhost:5000/api/v2/sample-sections/1 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Video Samples"}'
```

---

### [NEW] Delete Sample Section

Delete a sample section.

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Section ID  |

---

### [NEW] Create Sample (Multipart)

Create a sample within a specific section. This endpoint accepts multipart form data for file uploads.

**Endpoint:** `POST /:sectionId/samples`  
**Auth Required:** Yes (Admin)
**Content-Type:** `multipart/form-data`

**URL Parameters:**

| Param       | Type   | Description |
| ----------- | ------ | ----------- |
| `sectionId` | string | Section ID  |

**Form Data Fields:**

| Field        | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | number | Yes      | ID of the product this sample belongs to |
| `media_type` | enum   | No       | `Video`, `Audio`, `Document`, `Image` |
| `file`       | file   | Yes      | The actual sample file to upload |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v2/sample-sections/1/samples \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "product_id=5" \
  -F "media_type=Audio" \
  -F "file=@/path/to/sample.mp3"
```

---

### [NEW] Update Sample

Update an existing sample within a section.

**Endpoint:** `PATCH /:sectionId/samples/:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param       | Type   | Description |
| ----------- | ------ | ----------- |
| `sectionId` | string | Section ID  |
| `id`        | string | Sample ID   |

**Request Body (All Optional):**

```json
{
  "product_id": 10,
  "media_type": "Video"
}
```

| Field        | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | number | No       | The product ID |
| `media_type` | enum   | No       | `Video`, `Audio`, `Document`, `Image` |

**Example Request:**
```bash
curl -X PATCH http://localhost:5000/api/v2/sample-sections/1/samples/5 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"media_type": "Video"}'
```

---

### [NEW] Delete Sample

Delete an existing sample from a section.

**Endpoint:** `DELETE /:sectionId/samples/:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param       | Type   | Description |
| ----------- | ------ | ----------- |
| `sectionId` | string | Section ID  |
| `id`        | string | Sample ID   |

---
