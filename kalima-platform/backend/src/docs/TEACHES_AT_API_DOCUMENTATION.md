# TeachesAt API Documentation

## Base URL

/api/v2/teaches-at

---

## Overview

`teaches_at` records represent locations where a teacher operates (e.g., "Main Campus").

- Public: read endpoints (list + single)
- Admin/SubAdmin: create, update, delete for any teacher
- Teacher: create/update/delete for their own records only

---

## Endpoints (summary)

- GET /api/v2/teaches-at — list
- GET /api/v2/teaches-at/:id — single
- POST /api/v2/teaches-at — create (authenticated)
- PATCH /api/v2/teaches-at/:id — update (authenticated)
- DELETE /api/v2/teaches-at/:id — delete (authenticated)

---

## Body (create)

```json
{ "user_id": number, "location_name": string, "location_type"?: "School"|"Center", "active"?: boolean }
```

- `user_id` — required for Admin/SubAdmin; omitted for teacher callers (controller will set to authenticated user)
- `location_name` — required

---

## Permissions

- Create: Admin/SubAdmin or Teacher (teacher creates for self)
- Read: public
- Update/Delete: Admin/SubAdmin or Teacher-owner

---

## Examples

Create (teacher creates for self)

```
POST /api/v2/teaches-at
Authorization: Bearer <teacher-token>
{ "location_name": "Main Campus", "location_type": "Center" }
```

Create (admin creates for a teacher)

```
POST /api/v2/teaches-at
Authorization: Bearer <admin-token>
{ "user_id": 45, "location_name": "Branch A" }
```

List

```
GET /api/v2/teaches-at?user_id=45&active=true
```

---

## Errors

- 400 Bad Request — invalid input
- 401 Unauthorized — missing/invalid token for protected routes
- 403 Forbidden — insufficient role / not owner
- 404 Not Found — record/user not found

---

Cross reference: see `users` and `teachers` data for relation to `teaches_at`.
