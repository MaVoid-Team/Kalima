# User Profile API Documentation

## Base URL

```
/api/v2/profile
```

---

## Table of Contents

1. [Self-Service Endpoints (`/me`)](#self-service-endpoints-me)
   - [Get My Profile](#get-my-profile)
   - [Update My Profile](#update-my-profile)
   - [Upload Avatar](#upload-avatar)
   - [Delete Avatar](#delete-avatar)
2. [Teaches At (Teacher)](#teaches-at-teacher)
   - [Get My Locations](#get-my-locations)
   - [Add Location](#add-location)
   - [Update Location](#update-location)
   - [Delete Location](#delete-location)
3. [Social Media (Teacher)](#social-media-teacher)
   - [Get My Social Media](#get-my-social-media)
   - [Add Social Media](#add-social-media)
   - [Update Social Media](#update-social-media)
   - [Delete Social Media](#delete-social-media)
4. [Children (Parent)](#children-parent)
   - [Get My Children](#get-my-children)
   - [Link Child](#link-child)
   - [Update Child Link](#update-child-link)
   - [Unlink Child](#unlink-child)
5. [Admin Endpoints](#admin-endpoints)
6. [Enums & Types](#enums--types)
7. [Business Rules](#business-rules)
8. [Error Codes](#error-codes)

---

## Authentication

All profile endpoints require JWT authentication:

```
Authorization: Bearer <access_token>
```

---

## Self-Service Endpoints (`/me`)

---

### Get My Profile

Returns the authenticated user's full profile with role-specific data.

**Endpoint:** `GET /me`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "secondary_phone": null,
    "gender": "male",
    "profile_pic_url": "/uploads/images/avatar.webp",
    "is_email_verified": true,
    "created_at": "2026-01-15T10:00:00.000Z",
    "user_roles": [{ "portal": "store", "role": "Teacher" }],
    "user_analytics": {
      "views": 0,
      "total_spent": "500.00",
      "number_of_purchases": 3
    },
    "teachers": {
      "serial": "MATH-001",
      "is_primary": true,
      "is_preparatory": false,
      "is_secondary": false,
      "government_id": 1,
      "zone_id": 3,
      "subject_id": 5,
      "government": { "id": 1, "title": "Cairo" },
      "zones": { "id": 3, "title": "Nasr City" },
      "subjects": { "id": 5, "title": "Mathematics" }
    },
    "students": null,
    "parents": null,
    "lecturers": null
  }
}
```

---

### Update My Profile

Updates the authenticated user's profile. Supports basic fields (all roles) and role-specific fields.

**Endpoint:** `PATCH /me`  
**Auth Required:** Yes

**Request Body (all fields optional):**

```json
{
  "name": "string (max 255)",
  "phone": "string (max 50)",
  "secondary_phone": "string (max 50)",
  "gender": "male | female",

  "subject_id": "number (Teacher only)",
  "government_id": "number (Teacher / Student / Parent)",
  "zone_id": "number (Teacher / Student / Parent)",

  "level_id": "number (Student only)",
  "faction": "string (Student only, max 255)",
  "parent_phone_number": "string (Student only, max 255)"
}
```

> **Note:** Role-specific fields are only applied if the user has the corresponding role. Sending `subject_id` for a non-Teacher user is silently ignored.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "/* full profile object */" }
}
```

**Error Responses:**

| Status | Message                | Condition             |
| ------ | ---------------------- | --------------------- |
| 404    | `User not found`       | Invalid user          |
| 404    | `Subject not found`    | Invalid subject_id    |
| 404    | `Government not found` | Invalid government_id |
| 404    | `Zone not found`       | Invalid zone_id       |
| 404    | `Level not found`      | Invalid level_id      |
| 422    | Validation errors      | Invalid body          |

---

### Upload Avatar

Uploads or replaces the user's profile picture.

**Endpoint:** `POST /me/avatar`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**File Fields:**

| Field    | Type  | Description                      |
| -------- | ----- | -------------------------------- |
| `avatar` | image | Profile picture image (required) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile picture updated",
  "data": {
    "profile_pic_url": "/uploads/images/avatar.webp"
  }
}
```

**Error Responses:**

| Status | Message                  | Condition        |
| ------ | ------------------------ | ---------------- |
| 400    | `No image file provided` | No file uploaded |
| 404    | `User not found`         | Invalid user     |

---

### Delete Avatar

Removes the user's profile picture and sets it to null.

**Endpoint:** `DELETE /me/avatar`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile picture deleted"
}
```

**Error Responses:**

| Status | Message          | Condition    |
| ------ | ---------------- | ------------ |
| 404    | `User not found` | Invalid user |

---

## Teaches At (Teacher)

Manage the locations where a teacher teaches.

---

### Get My Locations

**Endpoint:** `GET /me/teaches-at`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "id": 1,
      "user_id": 42,
      "location_name": "Al-Azhar School",
      "location_type": "School",
      "active": true
    }
  ]
}
```

---

### Add Location

**Endpoint:** `POST /me/teaches-at`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "location_name": "string (required, max 255)",
  "location_type": "School | Center (optional)",
  "active": "boolean (optional, default: true)"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Location added",
  "data": { "/* teaches_at object */" }
}
```

---

### Update Location

**Endpoint:** `PATCH /me/teaches-at/:id`  
**Auth Required:** Yes

**Request Body (all optional):**

```json
{
  "location_name": "string",
  "location_type": "School | Center",
  "active": "boolean"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Location updated",
  "data": { "/* teaches_at object */" }
}
```

---

### Delete Location

**Endpoint:** `DELETE /me/teaches-at/:id`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "message": "Location deleted"
}
```

---

## Social Media (Teacher)

Manage a teacher's social media links.

---

### Get My Social Media

**Endpoint:** `GET /me/social-media`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "results": 1,
  "data": [
    {
      "id": 5,
      "teacher_user_id": 42,
      "site_id": 2,
      "url": "https://facebook.com/teacher",
      "active": true
    }
  ]
}
```

---

### Add Social Media

**Endpoint:** `POST /me/social-media`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "site_id": "number (optional, references sites table)",
  "url": "string (required, max 1024)",
  "active": "boolean (optional, default: true)"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Social media added",
  "data": { "/* social_media object */" }
}
```

---

### Update Social Media

**Endpoint:** `PATCH /me/social-media/:id`  
**Auth Required:** Yes

**Request Body (all optional):**

```json
{
  "site_id": "number",
  "url": "string",
  "active": "boolean"
}
```

---

### Delete Social Media

**Endpoint:** `DELETE /me/social-media/:id`  
**Auth Required:** Yes

---

## Children (Parent)

Manage parent-child relationships.

---

### Get My Children

**Endpoint:** `GET /me/children`  
**Auth Required:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "results": 1,
  "data": [
    {
      "id": 3,
      "parent_user_id": 42,
      "student_user_id": 88
    }
  ]
}
```

---

### Link Child

**Endpoint:** `POST /me/children`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "student_user_id": "number (required)"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Child linked",
  "data": { "/* parent_children object */" }
}
```

**Error Responses:**

| Status | Message                                | Condition               |
| ------ | -------------------------------------- | ----------------------- |
| 404    | `Parent not found`                     | Parent profile missing  |
| 404    | `Student not found`                    | Student profile missing |
| 409    | `Parent-child relation already exists` | Duplicate link          |

---

### Update Child Link

**Endpoint:** `PATCH /me/children/:id`  
**Auth Required:** Yes

### Unlink Child

**Endpoint:** `DELETE /me/children/:id`  
**Auth Required:** Yes

---

## Admin Endpoints

Admin and SubAdmin users can manage any user's profile using the same endpoints, replacing `/me` with `/users/:userId`.

**Base:** `/api/v2/profile/users/:userId`

| Self-Service                  | Admin Equivalent                         |
| ----------------------------- | ---------------------------------------- |
| `GET /me`                     | `GET /users/:userId`                     |
| `PATCH /me`                   | `PATCH /users/:userId`                   |
| `POST /me/avatar`             | `POST /users/:userId/avatar`             |
| `DELETE /me/avatar`           | `DELETE /users/:userId/avatar`           |
| `GET /me/teaches-at`          | `GET /users/:userId/teaches-at`          |
| `POST /me/teaches-at`         | `POST /users/:userId/teaches-at`         |
| `PATCH /me/teaches-at/:id`    | `PATCH /users/:userId/teaches-at/:id`    |
| `DELETE /me/teaches-at/:id`   | `DELETE /users/:userId/teaches-at/:id`   |
| `GET /me/social-media`        | `GET /users/:userId/social-media`        |
| `POST /me/social-media`       | `POST /users/:userId/social-media`       |
| `PATCH /me/social-media/:id`  | `PATCH /users/:userId/social-media/:id`  |
| `DELETE /me/social-media/:id` | `DELETE /users/:userId/social-media/:id` |
| `GET /me/children`            | `GET /users/:userId/children`            |
| `POST /me/children`           | `POST /users/:userId/children`           |
| `PATCH /me/children/:id`      | `PATCH /users/:userId/children/:id`      |
| `DELETE /me/children/:id`     | `DELETE /users/:userId/children/:id`     |

> **Auth:** Only users with **Admin** or **SubAdmin** role can access `/users/:userId` routes. Non-admin users get `403 Forbidden`.

---

## Enums & Types

### Gender

| Value    | Description |
| -------- | ----------- |
| `male`   | Male        |
| `female` | Female      |

### Location Type

| Value    | Description |
| -------- | ----------- |
| `School` | School      |
| `Center` | Center      |

---

## Business Rules

- Each user can have **at most one** profile per role (teacher, student, parent, lecturer).
- `updateProfile` only applies role-specific fields if the user has the corresponding role.
- `uploadAvatar` compresses and converts the image to WebP for optimal storage.
- Ownership is enforced: users can only modify their own resources. Admin/SubAdmin can manage any user.
- Teaches-at and social-media records are **hard-deleted** (not soft-deleted).
- Parent-child relationships enforce uniqueness — one link per parent/student pair.

---

## Error Codes

| Status | Error Type          | Description                                          |
| ------ | ------------------- | ---------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input or missing files                       |
| 401    | `UnauthorizedError` | Missing or invalid authorization token               |
| 403    | `ForbiddenError`    | Not authorized to access or modify this resource     |
| 404    | `NotFoundError`     | User, subject, government, zone, or record not found |
| 409    | `ConflictError`     | Duplicate record (e.g., parent-child link)           |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array       |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
