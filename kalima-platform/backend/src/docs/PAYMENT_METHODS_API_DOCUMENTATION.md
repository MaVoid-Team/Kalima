# Payment Methods API Documentation

## Base URL

```
/api/v2/payment-methods
```

---

## Table of Contents

1. [Public / Authenticated Endpoints](#public--authenticated-endpoints)
   - [Get All Payment Methods](#get-all-payment-methods)
   - [Get Payment Method by ID](#get-payment-method-by-id)
2. [Admin Endpoints](#admin-endpoints)
   - [Create Payment Method](#create-payment-method)
   - [Update Payment Method](#update-payment-method)
   - [Delete Payment Method](#delete-payment-method)
3. [Enums & Types](#enums--types)
4. [Common Response Types](#common-response-types)
5. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Public / Authenticated Endpoints

> Endpoints in this section are available to all authenticated users (Teachers, Parents, Students, Admins).

---

### Get All Payment Methods

Returns a list of all payment methods. Admin users can filter by status or search by name.

**Endpoint:** `GET /`  
**Auth Required:** Yes 

**Query Parameters:**

| Param    | Type    | Default | Description                                 |
| -------- | ------- | ------- | ------------------------------------------- |
| `status` | boolean | —       | Filter by active/inactive status (`true` or `false`) |
| `search` | string  | —       | Search by name                              |

**Example:** `GET /payment-methods?status=true&search=Vodafone`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vodafone Cash",
      "phone_number": "010xxxxxx",
      "status": true,
      "image_url": "/uploads/images/1234.webp",
      "created_at": "2024-03-20T10:00:00.000Z",
      "updated_at": "2024-03-20T10:00:00.000Z"
    }
  ]
}
```

---

### Get Payment Method by ID

Returns a single payment method by its ID.

**Endpoint:** `GET /:id`  
**Auth Required:** Yes

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Payment Method ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Vodafone Cash",
    "phone_number": "010xxxxxx",
    "status": true,
    "image_url": "/uploads/images/1234.webp",
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message             | Condition                                |
| ------ | ------------------- | ---------------------------------------- |
| 400    | `Invalid payment method ID` | ID is not a number                       |
| 404    | `Payment method with ID <id> not found.` | Payment method does not exist |

---

## Admin Endpoints

> All endpoints in this section require the authenticated user to have the **Admin** role.

---

### Create Payment Method

Creates a new payment method. Supports uploading an image directly via multipart form data.

**Endpoint:** `POST /`  
**Auth Required:** Yes (Admin)  
**Content-Type:** `multipart/form-data`

**Form Data Fields:**

| Field          | Type    | Required | Description                                  |
| -------------- | ------- | -------- | -------------------------------------------- |
| `name`         | string  | Yes      | Name of the payment method                   |
| `phone_number` | string  | Yes      | Phone number associated with payment method  |
| `status`       | boolean | No       | `true` or `false` (defaults to `true`)       |
| `image`        | file    | No       | Image file to upload (JPEG, PNG, WebP, etc.) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Payment method created successfully",
  "data": {
    "id": 1,
    "name": "Vodafone Cash",
    "phone_number": "010xxxxxx",
    "status": true,
    "image_url": "/uploads/images/1234.webp",
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message               | Condition                 |
| ------ | --------------------- | ------------------------- |
| 400    | `Unsupported image type` | Invalid image extension   |
| 422    | Validation errors array | Missing required fields |

---

### Update Payment Method

Updates an existing payment method. Supports uploading a new image to replace the old one.

**Endpoint:** `PATCH /:id`  
**Auth Required:** Yes (Admin)  
**Content-Type:** `multipart/form-data`

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Payment Method ID |

**Form Data Fields (all optional):**

| Field          | Type    | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| `name`         | string  | Updated name                                 |
| `phone_number` | string  | Updated phone number                         |
| `status`       | boolean | `true` or `false`                            |
| `image`        | file    | New image file to upload (replaces old one)  |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": {
    "id": 1,
    "name": "Vodafone Cash Updated",
    "phone_number": "010xxxxxx",
    "status": false,
    "image_url": "/uploads/images/5678.webp",
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T11:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message             | Condition                                |
| ------ | ------------------- | ---------------------------------------- |
| 400    | `Invalid payment method ID` | ID is not a number                       |
| 400    | `Unsupported image type` | Invalid image extension   |
| 404    | `Payment method with ID <id> not found.` | Payment method does not exist |

---

### Delete Payment Method

Deletes a payment method by ID. 

**Endpoint:** `DELETE /:id`  
**Auth Required:** Yes (Admin)

**URL Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Payment Method ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

**Error Responses:**

| Status | Message             | Condition                                |
| ------ | ------------------- | ---------------------------------------- |
| 400    | `Invalid payment method ID` | ID is not a number                       |
| 404    | `Payment method with ID <id> not found.` | Payment method does not exist |

---

## Enums & Types

### Payment Method Object

```json
{
  "id": "number (auto-increment PK)",
  "name": "string",
  "phone_number": "string",
  "status": "boolean — defaults to true",
  "image_url": "string | null (URL path to the image)",
  "created_at": "timestamp",
  "updated_at": "timestamp | null"
}
```

---

## Common Response Types

### Success Response

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "string (optional)",
  "data": "object | array | null"
}
```

---

## Error Codes

| Status | Error Type          | Description                                           |
| ------ | ------------------- | ----------------------------------------------------- |
| 400    | `BadRequestError`   | Invalid input or unsupported image type               |
| 401    | `UnauthorizedError` | Missing or invalid authorization token                |
| 403    | `ForbiddenError`    | User does not have the required role                  |
| 404    | `NotFoundError`     | Payment method not found                              |
| 422    | `ValidationError`   | DTO validation failed — returns `errors` array        |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
