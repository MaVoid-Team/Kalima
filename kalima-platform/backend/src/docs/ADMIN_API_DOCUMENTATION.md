# Admin API Documentation

## Base URL

```
/api/v2/admin
```

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [User Management](#user-management)
   - [List Users](#list-users)
   - [Get User](#get-user)
   - [Delete User](#delete-user)
3. [Role Management](#role-management)
   - [Get User Roles](#get-user-roles)
   - [Assign Role](#assign-role)
   - [Set Roles (Replace All)](#set-roles-replace-all)
   - [Revoke Role](#revoke-role)
4. [Reference: Enums & Constants](#reference-enums--constants)
5. [Common Response Types](#common-response-types)
6. [Error Codes](#error-codes)
7. [Admin Dashboard](#admin-dashboard)

---

## Authentication & Authorization

All admin endpoints require **two layers** of protection:

1. **JWT Authentication** — A valid access token in the `Authorization` header.
2. **Role Check** — The authenticated user must have role **Admin** or **SubAdmin** (on any portal).

```
Authorization: Bearer <access_token>
```

If the token is missing or invalid → `401 Unauthorized`  
If the user's roles don't include Admin or SubAdmin → `403 Forbidden`

### Middleware Stack

```
authenticateToken → requireRole([Admin, SubAdmin]) → controller
```

---

## User Management

### List Users

Search and paginate through all users. Supports filtering by role, portal, and text search.

**Endpoint:** `GET /users`  
**Auth Required:** Yes (Admin / SubAdmin)

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                                        |
| --------- | ------ | -------- | ------- | -------------------------------------------------- |
| page      | number | No       | 1       | Page number (1-based)                              |
| limit     | number | No       | 20      | Items per page (max 100)                           |
| search    | string | No       | —       | Search in name, email, or phone (case-insensitive) |
| role      | string | No       | —       | Filter by role enum value                          |
| portal    | string | No       | —       | Filter by portal enum value                        |

**Example Requests:**

```
GET /api/v2/admin/users?page=1&limit=10
GET /api/v2/admin/users?search=ahmed
GET /api/v2/admin/users?role=Teacher&portal=store
GET /api/v2/admin/users?search=john&role=Student&page=2&limit=5
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Ahmed Hassan",
        "email": "ahmed@example.com",
        "phone": "01012345678",
        "secondary_phone": null,
        "gender": "male",
        "is_email_verified": true,
        "profile_pic_url": null,
        "created_at": "2026-01-15T10:30:00.000Z",
        "role": "Teacher",
        "confirmed": true,
        "user_roles": [
          { "id": 1, "portal": "store", "role": "Teacher" },
          { "id": 2, "portal": "academy", "role": "Teacher" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 47,
      "totalPages": 5
    }
  }
}
```

---

### Get User

Retrieve a single user with all their roles and profile data.

**Endpoint:** `GET /users/:userId`  
**Auth Required:** Yes (Admin / SubAdmin)

**Path Parameters:**

| Parameter | Type   | Description   |
| --------- | ------ | ------------- |
| userId    | number | The user's ID |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "secondary_phone": null,
    "gender": "male",
    "is_email_verified": true,
    "profile_pic_url": null,
    "created_at": "2026-01-15T10:30:00.000Z",
    "role": "Teacher",
    "confirmed": true,
    "user_roles": [
      { "id": 1, "portal": "store", "role": "Teacher" },
      { "id": 2, "portal": "academy", "role": "Teacher" }
    ],
    "teachers": { "serial": "MA001", "subject_id": 3 },
    "students": null,
    "lecturers": null,
    "assistants": null,
    "parents": null
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Delete User

Permanently deletes a user account. Admin/SubAdmin cannot delete their own account via this endpoint.

**Endpoint:** `DELETE /users/:userId`  
**Auth Required:** Yes (Admin / SubAdmin)

**Path Parameters:**

| Parameter | Type   | Description   |
| --------- | ------ | ------------- |
| userId    | number | The user's ID |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

| Status | Message                                                                                      |
| ------ | -------------------------------------------------------------------------------------------- |
| 400    | `Invalid user ID`                                                                            |
| 400    | `Cannot delete your own account via this endpoint. Use DELETE /auth/delete-account instead.` |
| 404    | `User not found`                                                                             |

---

## Role Management

Roles are stored in the `user_roles` table. Each row is a `(user_id, portal, role)` tuple. A user can have **multiple roles across multiple portals**.

### Get User Roles

**Endpoint:** `GET /users/:userId/roles`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "Ahmed Hassan",
    "roles": [
      { "id": 1, "portal": "store", "role": "Teacher" },
      { "id": 2, "portal": "academy", "role": "Teacher" }
    ]
  }
}
```

---

### Assign Role

Add a new role+portal combination to an existing user. Will fail if the user already has this exact combination.

**Endpoint:** `POST /users/:userId/roles`  
**Auth Required:** Yes (Admin / SubAdmin)

**Request Body:**

```json
{
  "portal": "store",
  "role": "Teacher"
}
```

| Field  | Type   | Required | Description                                              |
| ------ | ------ | -------- | -------------------------------------------------------- |
| portal | string | Yes      | Portal enum: `"store"` or `"academy"`                    |
| role   | string | Yes      | Role enum (see [Reference](#reference-enums--constants)) |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "Role Teacher on portal store assigned to user 1",
  "data": {
    "id": 5,
    "portal": "store",
    "role": "Teacher"
  }
}
```

**Error Responses:**

| Status | Message                                                    |
| ------ | ---------------------------------------------------------- |
| 400    | `User already has role Teacher on portal store`            |
| 400    | `Invalid portal "xxx". Must be one of: store, academy`     |
| 400    | `Invalid role "xxx". Must be one of: Admin, SubAdmin, ...` |
| 404    | `User not found` (via getUser)                             |

---

### Set Roles (Replace All)

Replace **all** roles for a user with a new set. This is a bulk operation — it deletes all existing roles and creates the new ones in a transaction. At least one role is required.

**Endpoint:** `PUT /users/:userId/roles`  
**Auth Required:** Yes (Admin / SubAdmin)

**Request Body:**

```json
{
  "roles": [
    { "portal": "store", "role": "Teacher" },
    { "portal": "academy", "role": "Teacher" },
    { "portal": "academy", "role": "Moderator" }
  ]
}
```

| Field          | Type   | Required | Description                   |
| -------------- | ------ | -------- | ----------------------------- |
| roles          | array  | Yes      | Array of role entries (min 1) |
| roles[].portal | string | Yes      | Portal enum value             |
| roles[].role   | string | Yes      | Role enum value               |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Roles updated for user 1",
  "data": [
    { "id": 10, "portal": "store", "role": "Teacher" },
    { "id": 11, "portal": "academy", "role": "Teacher" },
    { "id": 12, "portal": "academy", "role": "Moderator" }
  ]
}
```

**Error Responses:**

| Status | Message                          |
| ------ | -------------------------------- |
| 400    | `Must provide at least one role` |
| 400    | `Invalid portal/role enum`       |
| 404    | `User not found`                 |

---

### Revoke Role

Remove a specific role+portal combination from a user. A user must keep at least one role — you cannot remove the last one.

**Endpoint:** `DELETE /users/:userId/roles`  
**Auth Required:** Yes (Admin / SubAdmin)

**Request Body:**

```json
{
  "portal": "store",
  "role": "Teacher"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Role Teacher on portal store revoked from user 1",
  "data": {
    "removed": {
      "portal": "store",
      "role": "Teacher"
    }
  }
}
```

**Error Responses:**

| Status | Message                                                             |
| ------ | ------------------------------------------------------------------- |
| 400    | `User does not have role Teacher on portal store`                   |
| 400    | `Cannot remove the last role from a user. Delete the user instead.` |

---

## Reference: Enums & Constants

### portal_enum

| Value     | Description                 |
| --------- | --------------------------- |
| `store`   | The store/e-commerce portal |
| `academy` | The academy/LMS portal      |

### role_enum

| Value       | Typical Portals | Description                       |
| ----------- | --------------- | --------------------------------- |
| `Admin`     | store + academy | Full platform access              |
| `SubAdmin`  | store + academy | Delegated admin access            |
| `Teacher`   | store + academy | Content creator, manages lectures |
| `Student`   | academy         | Enrolled learner                  |
| `Parent`    | academy         | Student guardian                  |
| `Lecturer`  | academy         | Live session instructor           |
| `Moderator` | academy         | Content/community moderator       |
| `Assistant` | academy         | Assists a specific lecturer       |

### Role-Portal Constraint

The `user_roles` table has a **unique constraint** on `(user_id, portal, role)` — a user cannot have duplicate entries for the same role+portal combination.

---

## Common Response Types

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error Response

```json
{
  "success": false,
  "errors": ["portal should not be empty", "role should not be empty"]
}
```

---

## Error Codes

| HTTP Code | Meaning               | When                                           |
| --------- | --------------------- | ---------------------------------------------- |
| 200       | OK                    | Successful read/update/delete                  |
| 201       | Created               | Successfully assigned a new role               |
| 400       | Bad Request           | Validation error, invalid enum, duplicate role |
| 401       | Unauthorized          | Missing or invalid JWT token                   |
| 403       | Forbidden             | User lacks Admin/SubAdmin role                 |
| 404       | Not Found             | User ID doesn't exist                          |
| 500       | Internal Server Error | Unexpected server error                        |

---

## Admin Dashboard

The following endpoints provide platform-wide statistics, revenue breakdowns, and user activity metrics.

### Store Statistics

Overview of total purchases, confirmed purchases, revenue, pending purchases, and average price. Supports optional date range filtering.

**Endpoint:** `GET /dashboard/store-stats`  
**Auth Required:** Yes (Admin / SubAdmin)

**Query Parameters:**

| Parameter   | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `startDate` | string | No       | ISO date string (e.g., `2026-01-01T00:00:00Z`) |
| `endDate`   | string | No       | ISO date string (e.g., `2026-01-31T23:59:59Z`) |

**Success Response (200):** Returns an overview object containing `totalPurchases`, `totalRevenue`, `averagePrice`, `confirmedPurchases`, `confirmedRevenue`, and `pendingPurchases`.

---

### Confirmer Statistics

Groups purchases by the `confirmed_by_user` to track how many purchases each sub-admin or admin has handled, categorized by status.

**Endpoint:** `GET /dashboard/confirmer-stats`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response (200):** Returns an array of objects detailing `user` info, `byStatus` counts (e.g., confirmed, pending), and `totalHandled`.

---

### Product Performance

Ranks products by total value generated and times purchased based on `purchase_items`.

**Endpoint:** `GET /dashboard/product-performance`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response (200):** Returns an array of the top 50 products showing their `product` details, `timesPurchased`, and `totalValue` generated.

---

### Response Time Analytics

Calculates the average, minimum, and maximum differences in minutes between `created_at` and `confirmed_at` for purchases.

**Endpoint:** `GET /dashboard/response-time`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response (200):** Returns an object containing `averageResponseTimeMinutes`, `fastestResponseTimeMinutes`, and `slowestResponseTimeMinutes`.

---

### Created Accounts Statistics

Returns statistics on how many user accounts were created by each Admin/SubAdmin. Note that this is located under the `/users` path.

**Endpoint:** `GET /users/stats/created-accounts`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response (200):** Returns an array of admin objects with their respective account creation counts.

---

### User Stats (Analytics)

Returns total users, total verified users, and count of unique users per role.

**Endpoint:** `GET /admin/dashboard/user-stats`  
**Auth Required:** Yes (Admin / SubAdmin)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalVerifiedUsers": 980,
    "byRole": {
      "Admin": 2,
      "Teacher": 450,
      "Student": 600,
      "Parent": 150,
      "Lecturer": 30,
      "SubAdmin": 3,
      "Moderator": 5,
      "Assistant": 10
    }
  }
}
```

- `totalUsers` — Total number of users in the system
- `totalVerifiedUsers` — Number of users with `is_email_verified` true
- `byRole` — Map of role name to count of distinct users with that role (a user with multiple role assignments counts once per role)

---

> **Planned Future Endpoints:**
>
> - `POST /admin/users/:userId/ban` — Ban/suspend a user
> - `POST /admin/users/:userId/unban` — Unban a user
> - `GET /admin/audit-log` — Admin action audit trail
