# Payment Methods API Documentation

## Base URL
`/api/v2/payment-methods`

## Authentication
Most endpoints require authentication using a Bearer token in the `Authorization` header.
Specific endpoints are restricted to the **Admin** role.

## Endpoints

### 1. List Payment Methods

Retrieve a list of payment methods.

- **Method**: `GET`
- **Path**: `/`
- **Auth Required**: Yes
- **Roles**: All authenticated users

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | boolean | No | Filter by active/inactive status (`true` or `false`) |
| search | string | No | Search by name |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vodafone Cash",
      "phone_number": "010xxxxxx",
      "status": true,
      "image_id": null,
      "created_at": "2024-03-20T10:00:00.000Z",
      "updated_at": "2024-03-20T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Payment Method by ID

Retrieve a specific payment method.

- **Method**: `GET`
- **Path**: `/:id`
- **Auth Required**: Yes
- **Roles**: All authenticated users

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Vodafone Cash",
    "phone_number": "010xxxxxx",
    "status": true,
    "image_id": null,
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z"
  }
}
```

### 3. Create Payment Method

Create a new payment method.

- **Method**: `POST`
- **Path**: `/`
- **Auth Required**: Yes
- **Roles**: **Admin**

#### Request Body
```json
{
  "name": "Vodafone Cash",
  "phone_number": "010xxxxxx",
  "status": true,
  "image_id": 1
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Payment method created successfully",
  "data": { ... }
}
```

### 4. Update Payment Method

Update an existing payment method by ID.

- **Method**: `PATCH`
- **Path**: `/:id`
- **Auth Required**: Yes
- **Roles**: **Admin**

#### Request Body
```json
{
  "name": "Vodafone Cash Updated",
  "status": false
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": { ... }
}
```

### 5. Delete Payment Method

Delete a payment method by ID.

- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth Required**: Yes
- **Roles**: **Admin**

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```
