# Parent-Children API Documentation

## Base URL

/api/v2/parent-children

---

## Overview

`parent_children` connects parent users to their students. The relation is unique per (parent_user_id, student_user_id).

Permissions

- Create: Admin/SubAdmin (any) or Parent (self)
- Read: public
- Update/Delete: Admin/SubAdmin or Parent-owner (parent can only manage their own relationships)

---

## Endpoints

- GET /api/v2/parent-children — list
- GET /api/v2/parent-children/:id — single
- POST /api/v2/parent-children — create (authenticated)
- PATCH /api/v2/parent-children/:id — update (authenticated)
- DELETE /api/v2/parent-children/:id — delete (authenticated)

---

## Body (create)

```json
{ "parent_user_id": number, "student_user_id": number }
```

- `parent_user_id` — required for Admin/SubAdmin; omitted for Parent callers (controller will set to authenticated user)
- `student_user_id` — required

---

## Examples

Create (parent creates for self)

```
POST /api/v2/parent-children
Authorization: Bearer <parent-token>
{ "student_user_id": 78 }
```

Create (admin creates)

```
POST /api/v2/parent-children
Authorization: Bearer <admin-token>
{ "parent_user_id": 45, "student_user_id": 78 }
```

---

## Errors

- 400 Bad Request — invalid input or referential conflict
- 401 Unauthorized — missing/invalid token for protected routes
- 403 Forbidden — insufficient role / not owner
- 404 Not Found — parent or student not found
- 409 Conflict — relation already exists
