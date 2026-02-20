# Sites API Documentation

## Base URL

/api/v2/sites

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/sites
   - GET /api/v2/sites/:id
   - POST /api/v2/sites
   - PATCH /api/v2/sites/:id
   - DELETE /api/v2/sites/:id
4. Request & response examples
5. Validation rules & constraints
6. Error codes
7. Common response types
8. Rate limiting
9. Security considerations

---

## 1. Overview

`Site` records represent physical locations (branches/centers) used by the platform. Sites are independent top‑level locations in the database (not tied to governments/zones).

- Public: read endpoints (list + single)
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

### GET /api/v2/sites

- Description: list sites
- Query: `?active` (optional filter)
- Auth: none (public)
- Notes: returns full list (no pagination)

### GET /api/v2/sites/:id

- Description: return site by id
- Auth: none (public)

### POST /api/v2/sites

- Description: create a site
- Auth: Admin or SubAdmin
- Body example: `{ "title": string, "active"?: boolean }`
- Validation: `title` is required and must be unique

### PATCH /api/v2/sites/:id

- Description: update site
- Auth: Admin or SubAdmin
- Body: partial site object (same fields as POST)

### DELETE /api/v2/sites/:id

- Description: delete site
- Auth: Admin only
- Guard: prevented when related teachers/students/parents or other dependent records exist (400)



---

## 4. Request & response examples

1. Create site (Admin/SubAdmin)

Request

```
POST /api/v2/sites
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Main Campus", "active": true }
```

Success (201)

```json
{
  "success": true,
  "message": "Site created successfully",
  "data": { "id": 12, "title": "Main Campus", "active": true }
}
```

2. List sites

Request

```
GET /api/v2/sites?active=true
```

Success (200)

```json
{ "success": true, "results": 3, "data": [ { "id": 12, "title": "Main Campus", "active": true }, ... ] }
```

3. Delete blocked (references exist)

Failure (400)

```json
{
  "error": "Cannot delete site while related teachers/students/parents exist",
  "statusCode": 400
}
```

---

## 5. Validation rules & constraints

- `title` length limited by DB/DTO (max 255 chars) and must be unique.
- Deletion prevented when dependent rows exist.

---

## 6. Error codes

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| 400    | Bad Request — validation or referential conflict |
| 401    | Unauthorized — missing/invalid token             |
| 403    | Forbidden — insufficient role                    |
| 404    | Not Found — site not found                       |
| 409    | Conflict — duplicate title                       |

---

## 7. Common response types

Site object

```json
{ "id": number, "title": string, "active"?: boolean }
```

Standard list response

```json
{ "success": true, "results": number, "data": site[] }
```

---

## 8. Rate limiting

Standard API limits apply. Public reads subject to global rate limiting.

---

## 9. Security considerations

- Deletion is guarded to prevent cascade/orphaned references.
- Admin/SubAdmin restrictions enforced by `requireRole` middleware.

---
