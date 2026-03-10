# [NEW] Sample Sections API Documentation

## Base URL

```
/api/v2/sample-sections
```

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
   - [Get All Sample Sections](#get-all-sample-sections)
   - [Get Sample Section by ID](#get-sample-section-by-id)
   - [Preview Sample](#preview-sample)
   - [Download Sample](#download-sample)
2. [Admin Endpoints](#admin-endpoints)
   - [Create Sample Section](#create-sample-section)
   - [Update Sample Section](#update-sample-section)
   - [Delete Sample Section](#delete-sample-section)
   - [Create Sample (Multipart)](#create-sample-multipart)
   - [Update Sample](#update-sample)
   - [Delete Sample](#delete-sample)

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

---

### [NEW] Update Sample Section

Update an existing sample section.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Section ID  |

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
