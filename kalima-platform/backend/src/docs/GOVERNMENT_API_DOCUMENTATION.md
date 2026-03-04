# Government API Documentation

## Base URL

/api/v2/governments

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/governments
   - GET /api/v2/governments/:id
   - GET /api/v2/governments/:governmentId/zones
   - POST /api/v2/governments
   - PATCH /api/v2/governments/:id
   - DELETE /api/v2/governments/:id
4. Request & response examples
5. Error codes
6. Common response types
7. Rate limiting
8. Security considerations

---

## 1. Overview

Government records are top‑level administrative regions used by students, teachers and other entities. Titles are unique. Zones belong to governments and may be listed by government.

- Public: read endpoints (list + single + zones-by-government)
- Admin/SubAdmin: create & update
- Admin only: delete (guarded by FK checks)

---

## 2. Authentication / Authorization

- Read endpoints: public (no authentication required).
- Create / Update: require authentication and **role = Admin or SubAdmin**.
- Delete: require authentication and **role = Admin**.

Include JWT in requests that require auth:

```
Authorization: Bearer <access_token>
```

---

## 3. Endpoints

### GET /api/v2/governments

- Description: return all governments
- Query: `?active=true|false` (optional)
- Auth: none (public)
- Notes: returns full list (no pagination)

### GET /api/v2/governments/:id

- Description: return government by id
- Auth: none (public)

### GET /api/v2/governments/:governmentId/zones

- Description: return zones that belong to a government
- Auth: none (public)

### POST /api/v2/governments

- Description: create government
- Auth: Admin or SubAdmin
- Body: `{ "title": string, "active"?: boolean }` (title required)
- Validation: `title` must be unique

### PATCH /api/v2/governments/:id

- Description: update government
- Auth: Admin or SubAdmin
- Body: `{ "title"?: string, "active"?: boolean }`

### DELETE /api/v2/governments/:id

- Description: delete government
- Auth: Admin only
- Guard: prevented when related zones/teachers/students/parents exist (400)

---

## 4. Request & response examples

1. List governments

Request

```
GET /api/v2/governments
```

Success (200)

```json
{
  "success": true,
  "results": 3,
  "data": [
    { "id": 1, "title": "Administrative", "active": true },
    { "id": 2, "title": "Northern Region", "active": true }
  ]
}
```

2. Create government (Admin/SubAdmin)

Request

```
POST /api/v2/governments
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Central Governorate", "active": true }
```

Success (201)

```json
{
  "success": true,
  "message": "Government created successfully",
  "data": { "id": 10, "title": "Central Governorate", "active": true }
}
```

3. Get zones for a government

Request

```
GET /api/v2/governments/2/zones
```

Success (200)

```json
{ "success": true, "results": 4, "data": [ { "id": 11, "title": "Zone A", "government_id": 2 }, ... ] }
```

4. Delete (blocked when related records exist)

Failure (400)

```json
{
  "error": "Cannot delete government while related zones/teachers/students/parents exist",
  "statusCode": 400
}
```

---

## 5. Error codes

| Status | Meaning                                                                        |
| ------ | ------------------------------------------------------------------------------ |
| 400    | Bad Request — validation or referential conflict (e.g., related records exist) |
| 401    | Unauthorized — missing/invalid token                                           |
| 403    | Forbidden — insufficient role                                                  |
| 404    | Not Found — government does not exist                                          |
| 409    | Conflict — duplicate title                                                     |

---

## 6. Common response types

Government object

```json
{ "id": number, "title": string, "active": boolean }
```

Standard list response

```json
{ "success": true, "results": number, "data": government[] }
```

---

## 7. Rate limiting

- Standard API limits apply. Public reads subject to global rate limiting.

---

## 8. Security considerations

- `title` uniqueness prevents duplicate administrative regions.
- Deletion is guarded to avoid cascade issues — service prevents delete when dependent rows exist.
- Protected endpoints use `requireRole` middleware to enforce Admin/SubAdmin rules.

---

Cross reference: see `/api/v2/zones` for zone CRUD and `/api/v2/governments/:governmentId/zones` for listing zones by government.
