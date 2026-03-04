# Levels API Documentation

## Base URL

/api/v2/levels

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/levels
   - GET /api/v2/levels/:id
   - POST /api/v2/levels
   - PATCH /api/v2/levels/:id
   - DELETE /api/v2/levels/:id
4. Request & Response examples
5. Error codes
6. Common response types
7. Rate limiting
8. Security considerations

---

## 1. Overview

Levels represent academic grade/level records used across the system (students reference `level_id`).

- Public: read endpoints (list + single) are accessible to any caller.
- Admin/SubAdmin: may create and update levels.
- Admin only: may delete levels (deletion is blocked when students reference the level).

---

## 2. Authentication / Authorization

- Read endpoints: public (no authentication required).
- Create / Update: require authentication and **role = Admin or SubAdmin**.
- Delete: require authentication and **role = Admin**.

Include JWT in requests that require authentication:

```
Authorization: Bearer <access_token>
```

---

## 3. Endpoints

### GET /api/v2/levels

- Description: Return all levels.
- Query parameters:
  - `active` (optional): `true|false` — filter active/inactive.
- Auth: none (public)
- Notes: returns full list (no pagination).

### GET /api/v2/levels/:id

- Description: Return a single level by id.
- Auth: none (public)

### POST /api/v2/levels

- Description: Create a new level.
- Auth: Admin or SubAdmin
- Body (JSON):
  - `title` (string, required) — unique
  - `active` (boolean, optional)
- Validation: `title` must be unique among non-deleted levels.

### PATCH /api/v2/levels/:id

- Description: Update an existing level.
- Auth: Admin or SubAdmin
- Body (JSON):
  - `title` (string, optional)
  - `active` (boolean, optional)
- Validation: when changing `title`, uniqueness is enforced.

### DELETE /api/v2/levels/:id

- Description: Delete a level.
- Auth: Admin only
- Behavior: deletion is prevented if any students reference the level (returns 400).

---

## 4. Request & Response examples

1. List levels

Request

```
GET /api/v2/levels
```

Success (200)

```json
{
  "success": true,
  "results": 2,
  "data": [
    { "id": 1, "title": "Grade 1", "active": true },
    { "id": 2, "title": "Grade 2", "active": true }
  ]
}
```

2. Get single level

Request

```
GET /api/v2/levels/2
```

Success (200)

```json
{ "success": true, "data": { "id": 2, "title": "Grade 2", "active": true } }
```

3. Create level (Admin/SubAdmin)

Request

```
POST /api/v2/levels
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Grade 7", "active": true }
```

Success (201)

```json
{
  "success": true,
  "message": "Level created successfully",
  "data": { "id": 10, "title": "Grade 7", "active": true }
}
```

4. Update level (Admin/SubAdmin)

Request

```
PATCH /api/v2/levels/10
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Grade 7A" }
```

Success (200)

```json
{
  "success": true,
  "message": "Level updated successfully",
  "data": { "id": 10, "title": "Grade 7A", "active": true }
}
```

5. Delete level (Admin)

Request

```
DELETE /api/v2/levels/10
Authorization: Bearer <admin-token>
```

Success (200)

```json
{ "success": true, "message": "Level deleted successfully" }
```

Failure (400) — when students reference the level

```json
{
  "error": "Cannot delete level while students are assigned to it",
  "statusCode": 400
}
```

---

## 5. Error codes

| Status | Meaning                                                                           |
| ------ | --------------------------------------------------------------------------------- |
| 400    | Bad Request — validation or referential conflict (e.g., students reference level) |
| 401    | Unauthorized — missing/invalid token                                              |
| 403    | Forbidden — insufficient role                                                     |
| 404    | Not Found — level does not exist                                                  |
| 409    | Conflict — duplicate title                                                        |

Error response format (example):

```json
{ "error": "Level not found", "statusCode": 404 }
```

---

## 6. Common response types

Level object

```json
{ "id": number, "title": string, "active": boolean }
```

Standard list response

```json
{ "success": true, "results": number, "data": Level[] }
```

---

## 7. Rate limiting

- Standard API rate limits apply (see global API docs). Typical defaults:
  - Authenticated requests: 100/min
  - Public reads: subject to global rate limits

---

## 8. Security considerations

- `title` uniqueness prevents duplicate logical records.
- Deletes are guarded to avoid accidental data loss when FK references exist.
- All protected endpoints require JWT with proper roles (use `requireRole` middleware).

---

If you want, I can add examples to the Postman collection and create unit/integration tests for these endpoints.
