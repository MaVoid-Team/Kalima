# Subjects API Documentation

## Base URL

/api/v2/subjects

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/subjects
   - GET /api/v2/subjects/:id
   - POST /api/v2/subjects
   - PATCH /api/v2/subjects/:id
   - DELETE /api/v2/subjects/:id
4. Request & response examples
5. Validation rules & constraints
6. Error codes
7. Common response types
8. Rate limiting
9. Security considerations

---

## 1. Overview

Subjects represent academic subjects taught on the platform (e.g., Mathematics, English). Titles are unique. Subjects are referenced by `teachers`.

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

### GET /api/v2/subjects

- Description: return all subjects
- Query: `?active=true|false` (optional)
- Auth: none (public)
- Notes: returns full list (no pagination)

### GET /api/v2/subjects/:id

- Description: return subject by id
- Auth: none (public)

### POST /api/v2/subjects

- Description: create subject
- Auth: Admin or SubAdmin
- Body: `{ "title": string, "active"?: boolean }` (title required)
- Validation: `title` must be unique

### PATCH /api/v2/subjects/:id

- Description: update subject
- Auth: Admin or SubAdmin
- Body: `{ "title"?: string, "active"?: boolean }`

### DELETE /api/v2/subjects/:id

- Description: delete subject
- Auth: Admin only
- Guard: prevented when related teachers exist (400)

---

## 4. Request & response examples

1. List subjects

Request

```
GET /api/v2/subjects
```

Success (200)

```json
{
  "success": true,
  "results": 4,
  "data": [
    { "id": 1, "title": "Mathematics", "active": true },
    { "id": 2, "title": "English", "active": true }
  ]
}
```

2. Create subject (Admin/SubAdmin)

Request

```
POST /api/v2/subjects
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Science", "active": true }
```

Success (201)

```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": { "id": 10, "title": "Science", "active": true }
}
```

3. Delete blocked (references exist)

Failure (400)

```json
{
  "error": "Cannot delete subject while related teachers exist",
  "statusCode": 400
}
```

---

## 5. Validation rules & constraints

- `title` length limited by DB/DTO (max 255 chars) and must be unique.
- Deletion prevented when teachers reference the subject.

---

## 6. Error codes

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| 400    | Bad Request — validation or referential conflict |
| 401    | Unauthorized — missing/invalid token             |
| 403    | Forbidden — insufficient role                    |
| 404    | Not Found — subject does not exist               |
| 409    | Conflict — duplicate title                       |

---

## 7. Common response types

Subject object

```json
{ "id": number, "title": string, "active"?: boolean }
```

Standard list response

```json
{ "success": true, "results": number, "data": subject[] }
```

---

## 8. Rate limiting

- Standard API limits apply. Public reads subject to global rate limiting.

---

## 9. Security considerations

- `title` uniqueness prevents duplicate subjects.
- Deletion is guarded to avoid orphaned teacher references.
- Protected endpoints use `requireRole` middleware to enforce Admin/SubAdmin rules.
