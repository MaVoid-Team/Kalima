# Notification System API Documentation

## Base URLs

```
/api/v2/notifications      — Customer-facing
/api/v2/admin/notifications — Admin-facing
```

---

## Table of Contents

1. [Overview](#overview)
2. [Notification Categories](#notification-categories)
3. [Message Keys (Enum)](#message-keys-enum)
4. [Customer Endpoints](#customer-endpoints)
   - [Get My Notifications](#get-my-notifications)
   - [Get Unread Count](#get-unread-count)
   - [Mark Notification as Read](#mark-notification-as-read)
   - [Mark All as Read](#mark-all-as-read)
5. [Admin Endpoints](#admin-endpoints)
   - [Send Notification](#send-notification)
   - [List All Notifications](#list-all-notifications)
6. [Notification Object](#notification-object)
7. [Real-Time Socket.IO Events](#real-time-socketio-events)
8. [Automatic Purchase Notifications](#automatic-purchase-notifications)
9. [Frontend Integration Guide](#frontend-integration-guide)
10. [Error Codes](#error-codes)

---

## Overview

The notification system delivers **three-channel notifications** to customers:

| Channel    | Mechanism                         | When            |
|------------|-----------------------------------|-----------------|
| Database   | `notifications` table             | Always          |
| Email      | Resend transactional email        | When email set  |
| Socket.IO  | `notification` event on `user:ID` | When connected  |

Customers can be targeted:
- **Individually** — by their `user_id`
- **By role** — all users with a given role (stored as a single DB row)

---

## Notification Categories

| Category | Label | Triggered By |
|----------|-------|--------------|
| 1 | `ORDER_STATUS_CHANGE` | Admin changes purchase status (receive / confirm / return) |
| 2 | `ORDER_ITEM_DELETED` | Admin removes an item from a purchase |
| 3 | `ORDER_DELETED` | Admin deletes an entire purchase |
| 4 | `NEW_ORDER` | System receives a new checkout (Notifies Admin/SubAdmin) |
| 5 | `NEW_ACCOUNT` | New user registers or is created (Notifies Admin/SubAdmin) |
| 6 | *(Reserved)* | — |
| 7 | `ORDER_GENERAL_EDIT` | Admin / SubAdmin adds a note to a purchase |
| 8 | `SYSTEM_ANNOUNCEMENT` | Generic system-wide message |
| 9 | `ACCOUNT_UPDATE` | Account-level change |
| 10 | `CUSTOM` | Any other purpose |

---

## Message Keys (Enum)

`message_key` is stored as an enum in the database. The frontend resolves the human-readable string using its own i18n system.

| `message_key` | Meaning (English) | Meaning (Arabic) |
|---------------|-------------------|------------------|
| `ORDER_STATUS_RECEIVED` | Your order has been received by our team | تم استلام طلبك من قِبل فريقنا |
| `ORDER_STATUS_CONFIRMED` | Your order has been confirmed | تم تأكيد طلبك |
| `ORDER_STATUS_RETURNED` | Your order has been returned | تم إرجاع طلبك |
| `ORDER_ITEM_DELETED` | An item has been removed from your order | تم إزالة منتج من طلبك |
| `ORDER_DELETED` | Your order has been cancelled | تم إلغاء طلبك |
| `ORDER_ADMIN_NOTE` | A note has been added to your order | تمت إضافة ملاحظة على طلبك |
| `NEW_ORDER_CREATED` | A new order has been received (Admin Alert) | تم استلام طلب جديد |
| `NEW_ACCOUNT_CREATED` | A new user account has been created (Admin Alert) | تم إنشاء حساب مستخدم جديد |
| `SYSTEM_ANNOUNCEMENT` | System announcement | إعلان من النظام |
| `ACCOUNT_UPDATE` | Your account has been updated | تم تحديث حسابك |
| `CUSTOM` | Custom notification | إشعار مخصص |

---

## Customer Endpoints

> All customer endpoints require JWT authentication:
> ```
> Authorization: Bearer <access_token>
> ```

---

### Get My Notifications

Returns the authenticated user's notifications, including role-based ones. Sorted newest first.

**Endpoint:** `GET /api/v2/notifications/my`
**Auth:** Any authenticated user

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | number | — | Filter by category (1–10) |
| `is_read` | boolean | — | Filter by read status |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Example:** `GET /api/v2/notifications/my?is_read=false&page=1&limit=20`

**Success Response (200):**

```json
{
  "success": true,
  "results": 2,
  "pagination": {
    "total": 2,
    "page": 1,
    "pages": 1,
    "limit": 20
  },
  "data": {
    "notifications": [
      {
        "id": 42,
        "user_id": 100,
        "role": null,
        "category": 2,
        "message_key": "ORDER_ITEM_DELETED",
        "entity_type": "purchase",
        "entity_id": 15,
        "is_read": false,
        "created_by": 1,
        "created_at": "2026-04-28T18:00:00.000Z",
        "creator": {
          "id": 1,
          "name": "Admin User"
        }
      },
      {
        "id": 41,
        "user_id": null,
        "role": "Teacher",
        "category": 8,
        "message_key": "SYSTEM_ANNOUNCEMENT",
        "entity_type": null,
        "entity_id": null,
        "is_read": false,
        "created_by": 1,
        "created_at": "2026-04-28T17:00:00.000Z",
        "creator": {
          "id": 1,
          "name": "Admin User"
        }
      }
    ]
  }
}
```

---

### Get Unread Count

Returns the count of unread notifications for the authenticated user.

**Endpoint:** `GET /api/v2/notifications/my/unread-count`
**Auth:** Any authenticated user

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

---

### Mark Notification as Read

Marks a single notification as read. The notification must belong to the user (directly or via role).

**Endpoint:** `PATCH /api/v2/notifications/:id/read`
**Auth:** Any authenticated user

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Notification ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Invalid notification ID` | ID is not a valid number |
| 400 | `Notification not found or does not belong to you` | ID is invalid or belongs to another user |

---

### Mark All as Read

Marks all notifications as read for the authenticated user (including role-based ones).

**Endpoint:** `PATCH /api/v2/notifications/read-all`
**Auth:** Any authenticated user

**Success Response (200):**

```json
{
  "success": true,
  "message": "Marked 5 notification(s) as read",
  "data": {
    "updated_count": 5
  }
}
```

---

## Admin Endpoints

> Admin endpoints require JWT + Admin/SubAdmin role.

---

### Send Notification

Sends a notification to specific users or all users with a given role.

**Endpoint:** `POST /api/v2/admin/notifications`
**Auth:** Admin, SubAdmin

**Request Body:**

```json
{
  "user_ids": [42, 55],
  "category": 10,
  "message_key": "CUSTOM",
  "entity_type": null,
  "entity_id": null
}
```

Or by role:

```json
{
  "role": "Teacher",
  "category": 8,
  "message_key": "SYSTEM_ANNOUNCEMENT"
}
```

**Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_ids` | number[] | One of | Target specific user IDs |
| `role` | role_enum | One of | Target all users with this role |
| `category` | number | Yes | Category 1–10 (4–6 reserved) |
| `message_key` | notification_key_enum | Yes | Message key enum value |
| `entity_type` | string | No | Related entity type (e.g. `"purchase"`) |
| `entity_id` | number | No | Related entity ID |

> **Note:** Provide either `user_ids` OR `role` — not both, not neither.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Notification sent to 2 user(s)",
  "data": {
    "target_count": 2,
    "notification_ids": []
  }
}
```

**Error Responses:**

| Status | Message | Condition |
|--------|---------|-----------|
| 400 | `Must specify either user_ids or role` | Neither provided |
| 400 | `Provide either user_ids or role — not both` | Both provided |
| 422 | Validation errors | Invalid DTO fields |

---

### List All Notifications

Returns all notifications in the system (admin view), paginated.

**Endpoint:** `GET /api/v2/admin/notifications`
**Auth:** Admin, SubAdmin, Moderator

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | number | — | Filter by category |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "results": 1,
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 3,
    "limit": 20
  },
  "data": {
    "notifications": [
      {
        "id": 42,
        "user_id": 100,
        "role": null,
        "category": 2,
        "message_key": "ORDER_ITEM_DELETED",
        "entity_type": "purchase",
        "entity_id": 15,
        "is_read": false,
        "created_by": 1,
        "created_at": "2026-04-28T18:00:00.000Z",
        "user": { "id": 100, "name": "Ahmed Hassan", "email": "ahmed@example.com" },
        "creator": { "id": 1, "name": "Admin User" }
      }
    ]
  }
}
```

---

## Notification Object

```json
{
  "id": "number — auto-increment PK",
  "user_id": "number | null — set when targeting a specific user",
  "role": "role_enum | null — set when targeting a role",
  "category": "number (1-10)",
  "message_key": "notification_key_enum",
  "entity_type": "string | null — 'purchase', 'purchase_item', 'user'",
  "entity_id": "number | null — ID of the related entity",
  "target_link": "string | null — relative path for frontend navigation (e.g. /orders/7)",
  "is_read": "boolean",
  "created_by": "number | null — admin user ID",
  "created_at": "timestamp"
}
```

### Entity Reference Guide

Use `entity_type` + `entity_id` to build links or fetch related data:

| `entity_type` | `entity_id` | Frontend Action |
|---------------|-------------|-----------------|
| `"purchase"` | purchase ID | Link to `/orders/{entity_id}` |
| `"user"` | user ID | Link to user profile |
| `null` | `null` | No linked entity |

---

## Real-Time Socket.IO Events

All authenticated users join their personal room `user:{userId}` on Socket.IO connection.

### Connection

```javascript
const socket = io(SERVER_URL, {
  auth: { token: "Bearer <access_token>" }
});
```

### Listening for Notifications

```javascript
socket.on("notification", (data) => {
  console.log("New notification:", data);
  // data shape:
  // {
  //   id: 42,
  //   category: 2,
  //   message_key: "ORDER_ITEM_DELETED",
  //   entity_type: "purchase",
  //   entity_id: 15,
  //   created_at: "2026-04-28T18:00:00.000Z"
  // }
});
```

---

## Automatic Purchase Notifications

These notifications are created automatically when admins perform order operations. No manual API call is needed.

| Admin Action | Category | `message_key` | `entity_type` | Email Sent |
|-------------|----------|---------------|---------------|------------|
| Mark as Received (`PATCH /:id/receive`) | 1 | `ORDER_STATUS_RECEIVED` | `"purchase"` | ✅ `sendOrderReceivedEmail` |
| Confirm (`PATCH /:id/confirm`) | 1 | `ORDER_STATUS_CONFIRMED` | `"purchase"` | ✅ `sendOrderAcceptedEmail` |
| Return (`PATCH /:id/return`) | 1 | `ORDER_STATUS_RETURNED` | `"purchase"` | ✅ `sendOrderReturnedEmail` |
| Delete Purchase (`DELETE /:id`) | 3 | `ORDER_DELETED` | `"purchase"` | ✅ `sendOrderDeletedEmail` |
| Delete Item (`DELETE /:id/items/:itemId`) | 2 | `ORDER_ITEM_DELETED` | `"purchase"` | ✅ `sendOrderItemDeletedEmail` |
| Add Note (`PATCH /:id/admin-note`) | 7 | `ORDER_ADMIN_NOTE` | `"purchase"` | ❌ (Socket + DB only) |
| New Order (Checkout) | 4 | `NEW_ORDER_CREATED` | `"purchase"` | ❌ (Admin in-app only) |
| New Account (Register/Create) | 5 | `NEW_ACCOUNT_CREATED` | `"user"` | ❌ (Admin in-app only) |

### `has_admin_edits` Flag on Purchases

When admin deletes an item, deletes the purchase, or adds a note, the `purchases.has_admin_edits` field is set to `true`. The frontend can use this to visually flag modified purchases in order history.

**Example in `GET /api/v2/purchases/my` response:**

```json
{
  "id": 15,
  "status": "confirmed",
  "has_admin_edits": true,
  "purchase_serial": "ABC123-CP-20260428-001",
  ...
}
```

---

## Frontend Integration Guide

### 1. Display Unread Badge

On page load:
```javascript
const { data } = await fetch("/api/v2/notifications/my/unread-count", { headers });
setBadgeCount(data.unread_count);
```

### 2. Notification List Panel

```javascript
const { data } = await fetch("/api/v2/notifications/my?is_read=false", { headers });
renderNotifications(data.notifications);
```

For each notification, resolve the human-readable message using the i18n system:

```javascript
const messageMap = {
  ORDER_STATUS_RECEIVED: t("notifications.order_status_received"),
  ORDER_STATUS_CONFIRMED: t("notifications.order_status_confirmed"),
  ORDER_STATUS_RETURNED: t("notifications.order_status_returned"),
  ORDER_ITEM_DELETED: t("notifications.order_item_deleted"),
  ORDER_DELETED: t("notifications.order_deleted"),
  ORDER_ADMIN_NOTE: t("notifications.order_admin_note"),
  SYSTEM_ANNOUNCEMENT: t("notifications.system_announcement"),
  ACCOUNT_UPDATE: t("notifications.account_update"),
  CUSTOM: t("notifications.custom"),
};
```

### 3. Link to Related Entity

```javascript
function getNotificationLink(notification) {
  if (notification.entity_type === "purchase") {
    return `/orders/${notification.entity_id}`;
  }
  return null;
}
```

### 4. Order History — Show Edit Warning

```javascript
// In the order list, check the has_admin_edits flag
if (purchase.has_admin_edits) {
  showWarningBadge(purchase.id);
}
```

### 5. Real-Time Updates (Socket.IO)

```javascript
socket.on("notification", (notification) => {
  // Increment badge count
  incrementUnreadCount();
  // Show toast
  showToast(messageMap[notification.message_key]);
  // If it's a purchase edit, refresh the purchase
  if (notification.entity_type === "purchase") {
    refetchPurchase(notification.entity_id);
  }
});
```

---

## Error Codes

| Status | Error Type | Description |
|--------|-----------|-------------|
| 400 | `BadRequestError` | Invalid input or logic error |
| 401 | `UnauthorizedError` | Missing or invalid JWT |
| 403 | `ForbiddenError` | Insufficient role |
| 422 | `ValidationError` | DTO validation failed |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["array of validation errors (only for 422)"]
}
```
