# Social Media API Documentation

## Base URL

/api/v2/social-media

---

## Table of contents

1. Overview
2. Authentication / Authorization
3. Endpoints
   - GET /api/v2/social-media
   - GET /api/v2/social-media/:id
   - POST /api/v2/social-media
   - PATCH /api/v2/social-media/:id
   - DELETE /api/v2/social-media/:id
4. Request & response examples
5. Validation rules & constraints
6. Error codes
7. Common response types
8. Rate limiting
9. Security considerations

---

## 1. Overview

`SocialMedia` records are external/profile links associated with teachers (or global entries). Each record may optionally belong to a `teacher_user_id`.

- Public: read endpoints
- Admin/SubAdmin **or the teacher-owner**: create & update
- Admin/SubAdmin **or the teacher-owner**: delete

---

## 2. Authentication / Authorization

- Read endpoints: public (no authentication required).
- Create / Update: require authentication and **(role = Admin|SubAdmin) OR owner (teacher_user_id === requester.id)**.
- Delete: require authentication and **(role = Admin|SubAdmin) OR owner (teacher_user_id === requester.id)**.

Include JWT in requests that require auth:

```
Authorization: Bearer <access_token>
```

---

## 3. Endpoints

### GET /api/v2/social-media

- Description: list social media links
- Query: `?teacher_user_id` (optional filter)
- Auth: none (public)

### GET /api/v2/social-media/:id

- Description: return social media record by id
- Auth: none (public)

### POST /api/v2/social-media

- Description: create social media link
- Auth: Admin/SubAdmin OR teacher (owner)
- Body example: `{ "title": string, "url": string, "teacher_user_id"?: number }`
- Notes: when `teacher_user_id` omitted and requester is a teacher, record is created for that teacher

### PATCH /api/v2/social-media/:id

- Description: update social media link
- Auth: Admin/SubAdmin OR teacher-owner
- Body: partial social-media object

### DELETE /api/v2/social-media/:id

- Description: delete social media link
- Auth: Admin/SubAdmin OR teacher-owner

---

## 4. Request & response examples

1. Teacher creates their own social link

Request

```
POST /api/v2/social-media
Authorization: Bearer <teacher-token>
Content-Type: application/json

{ "title": "Twitter", "url": "https://twitter.com/myprofile" }
```

Success (201)

```json
{
  "success": true,
  "message": "Social media link created",
  "data": {
    "id": 99,
    "title": "Twitter",
    "url": "https://twitter.com/myprofile",
    "teacher_user_id": 45
  }
}
```

2. Admin updates any social link

Request

```
PATCH /api/v2/social-media/99
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "title": "X (Twitter)" }
```

Success (200)

```json
{
  "success": true,
  "message": "Social media updated",
  "data": {
    "id": 99,
    "title": "X (Twitter)",
    "url": "https://twitter.com/myprofile"
  }
}
```

3. Forbidden update attempt by other teacher

Failure (403)

```json
{
  "error": "Forbidden — only owner or admin/subadmin can modify this record",
  "statusCode": 403
}
```

---

## 5. Validation rules & constraints

- `url` must be a valid URL.
- If `teacher_user_id` is provided, it must reference an existing teacher.
- Creation by non-admin requires the authenticated user to be a teacher and `teacher_user_id` (if provided) must equal requester id.

---

## 6. Error codes

| Status | Meaning                                            |
| ------ | -------------------------------------------------- |
| 400    | Bad Request — validation failed                    |
| 401    | Unauthorized — missing/invalid token               |
| 403    | Forbidden — insufficient role or not owner         |
| 404    | Not Found — record or referenced teacher not found |

---

## 7. Common response types

SocialMedia object

```json
{ "id": number, "title": string, "url": string, "teacher_user_id"?: number }
```

Standard list response

```json
{ "success": true, "results": number, "data": socialMedia[] }
```

---

## 8. Rate limiting

Standard API limits apply. Authenticated endpoints subject to user rate limits.

---

## 9. Security considerations

- Ownership checks enforced in controller/service (owner OR Admin/SubAdmin).
- URLs are validated and sanitized before persistence.
- Deletion/update restricted to owner or Admin/SubAdmin to prevent tampering.

---

Cross reference: `/api/v2/teachers/:id/social-media` (if present) may be used to fetch a teacher's social links.
