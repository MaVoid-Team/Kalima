# Zones API Documentation

## Base URL

/api/v2/zones

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/zones
   - GET /api/v2/zones/:id
   - POST /api/v2/zones
   - PATCH /api/v2/zones/:id
   - DELETE /api/v2/zones/:id
   - GET /api/v2/governments/:governmentId/zones (cross-reference)
4. Request & response examples
5. Validation rules & constraints
6. Error codes
7. Common response types
8. Rate limiting
9. Security considerations

---

## 1. Overview

Zones are subdivisions attached to a Government. Titles are unique per government (composite uniqueness: `title + government_id`). Zones are referenced by parents, students and teachers.

- Public: read endpoints
- Admin/SubAdmin: create & update
- Admin only: delete

---

## 2. Authentication / Authorization

- Read: public
- Create / Update: Admin or SubAdmin
- Delete: Admin only

Protected endpoints require JWT in `Authorization: Bearer <token>`.

---

## 3. Endpoints

### GET /api/v2/zones

- Description: list zones
- Query parameters:
  - `government_id` (optional) — filter zones of a particular government
  - `active` (optional)
- Auth: none (public)

### GET /api/v2/zones/:id

- Description: get single zone
- Auth: none (public)

### POST /api/v2/zones

- Description: create a zone
- Auth: Admin or SubAdmin
- Body: `{ "title": string, "government_id": number, "active"?: boolean }`
- Validation: `title` must be unique within the same `government_id`.

### PATCH /api/v2/zones/:id

- Description: update a zone
- Auth: Admin or SubAdmin
- Body: `{ "title"?: string, "government_id"?: number, "active"?: boolean }`
- Uniqueness validated when changing `title` or `government_id`.

### DELETE /api/v2/zones/:id

- Description: delete a zone
- Auth: Admin only
- Guard: deletion prevented when related parents/students/teachers exist

### GET /api/v2/governments/:governmentId/zones

- Description: convenience route to fetch all zones for a specific government
- Auth: none (public)

---

## 4. Request & response examples

1. Create zone (Admin/SubAdmin)

Request

```
POST /api/v2/zones
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Downtown", "government_id": 2 }
```

Success (201)

```json
{
  "success": true,
  "message": "Zone created successfully",
  "data": { "id": 21, "title": "Downtown", "government_id": 2 }
}
```

2. Get zones by government

Request

```
GET /api/v2/governments/2/zones
```

Success (200)

```json
{ "success": true, "results": 5, "data": [ { "id": 21, "title": "Downtown", "government_id": 2 }, ... ] }
```

3. Delete blocked (references exist)

Failure (400)

```json
{
  "error": "Cannot delete zone while related parents/students/teachers exist",
  "statusCode": 400
}
```

---

## 5. Validation rules & constraints

- Composite unique index: (`title`, `government_id`). Attempts to insert a duplicate combination return 409.
- `government_id` must reference an existing government (404 if missing).
- `title` length limited by DB/DTO (max 255 chars).

---

## 6. Error codes

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| 400    | Bad Request — validation or referential conflict |
| 401    | Unauthorized — missing/invalid token             |
| 403    | Forbidden — insufficient role                    |
| 404    | Not Found — zone or government not found         |
| 409    | Conflict — duplicate title within government     |

---

## 7. Common response types

Zone object

```json
{ "id": number, "title": string, "government_id": number, "active"?: boolean }
```

Standard list response

```json
{ "success": true, "results": number, "data": zone[] }
```

---

## 8. Rate limiting

- Standard API defaults apply. Protected endpoints subject to authenticated rate limits.

---

## 9. Security considerations

- Duplicate prevention via composite unique constraint.
- Deletion guarded to prevent orphaned references.
- Admin/SubAdmin restrictions enforced by `requireRole` middleware.

---

Cross reference: Government endpoints (`/api/v2/governments/:governmentId/zones`) provide the same listing filtered by government.
