# Kalima Store Real-Time Notification System

## Overview

This document describes the real-time notification system implemented for the Kalima Store e-commerce platform. When a customer successfully purchases a product, all Admins and SubAdmins receive instant notifications with complete purchase details.

## Features

✅ **Real-time notifications** to Admins and SubAdmins when purchases occur  
✅ **Detailed purchase information** including buyer details, product info, price, and timestamp  
✅ **Offline support** - Notifications are stored and delivered when admins come online  
✅ **Browser notifications** - Desktop notifications for admins (when permission granted)  
✅ **Metadata rich** - Complete purchase context stored with each notification  

---

## Implementation Details

### Backend Changes

#### 1. **Notification Template Model** (`models/notificationTemplateModel.js`)

Added new notification type:
```javascript
enum: [
  // ... existing types
  "store_purchase",  // NEW
]
```

#### 2. **Notification Model** (`models/notification.js`)

Added `metadata` field to store rich purchase data:
```javascript
metadata: {
  type: mongoose.Schema.Types.Mixed,
  default: {},
}
```

#### 3. **Notification Template Seeder** (`utils/seeds/seedNotificationTemplates.js`)

Added template for store purchases:
```javascript
{
  type: "store_purchase",
  title: "New Store Purchase",
  message: "{buyer} purchased {product} for {price} EGP at {time}",
}
```

#### 4. **E-Commerce Purchase Controller** (`controllers/ec.purchaseController.js`)

Added notification logic in `createPurchase` function (after line 217):

**Key Features:**
- Finds all users with role "Admin" or "SubAdmin"
- Creates notification with complete purchase metadata
- Checks if each admin is online
- Sends real-time notification via Socket.io if online
- Stores notification in DB for offline admins (isSent: false)

**Notification Data Structure:**
```javascript
{
  title: "New Store Purchase",
  message: "John Doe purchased Math Textbook for 150 EGP at Dec 1, 2024, 02:30 PM",
  type: "store_purchase",
  relatedId: purchaseId,
  metadata: {
    buyerId: userId,
    buyerName: "John Doe",
    buyerEmail: "john@example.com",
    productId: productId,
    productName: "Math Textbook",
    purchaseSerial: "ST001-1-MTH123",
    price: 200,
    finalPrice: 150,
    purchaseTime: "2024-12-01T14:30:00Z"
  }
}
```

#### 5. **Socket.io Server** (`server.js`)

Updated event type mapping to handle `store_purchase`:
```javascript
const eventType = notification.type === "store_purchase"
  ? "storePurchase"
  : // ... other types
```

Also updated to include `metadata` in emitted events.

---

### Frontend Changes

#### 1. **Socket Client** (`frontend/src/utils/socket.js`)

Added listener for store purchase events:
```javascript
socket.on("storePurchase", (notification) => {
  console.log("Received store purchase notification:", notification);
});
```

#### 2. **Notification Center** (`frontend/src/components/NotificationCenter.jsx`)

**Added:**
- `"storePurchase"` to event types array
- Browser notification support for store purchases
- Proper cleanup on unmount

**Browser Notification Feature:**
```javascript
if (eventType === "storePurchase" && "Notification" in window) {
  if (Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/logo192.png",
      badge: "/logo192.png",
    })
  }
}
```

---

## Usage

### Prerequisites

1. Server must be running with Socket.io enabled
2. User must be logged in as Admin or SubAdmin
3. Socket connection must be established

### Testing the Feature

1. **Login as Admin/SubAdmin** on one browser/tab
2. **Login as Student/Parent** on another browser/tab
3. **Make a purchase** from the Kalima Store
4. **Admin should receive** instant notification with purchase details

### Notification Flow

```
┌─────────────────────┐
│  Customer Makes     │
│  Purchase           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ createPurchase()    │
│ Controller          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Find All Admins &   │
│ SubAdmins           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ For Each Admin:     │
│ - Check Online      │
│ - Create Notif in DB│
│ - Emit if Online    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Admin Receives      │
│ Real-time Notif     │
│ + Browser Alert     │
└─────────────────────┘
```

---

## API Endpoints

### Get Unsent Notifications
```http
GET /api/v1/notifications/unsent
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "title": "New Store Purchase",
      "message": "John Doe purchased Math Book for 150 EGP at Dec 1, 2024",
      "type": "store_purchase",
      "subjectId": "purchaseId",
      "notificationId": "notifId",
      "createdAt": "2024-12-01T14:30:00Z",
      "metadata": {
        "buyerId": "userId",
        "buyerName": "John Doe",
        "buyerEmail": "john@example.com",
        "productName": "Math Book",
        "purchaseSerial": "ST001-1-MTH123",
        "finalPrice": 150
      }
    }
  ]
}
```

### Mark as Read
```http
PATCH /api/v1/notifications/:notificationId/read
Authorization: Bearer <token>
```

---

## Socket.io Events

### Client Events (Emit)

| Event | Description | Payload |
|-------|-------------|---------|
| `subscribe` | Subscribe to user's notification room | `userId` |
| `ping` | Keep connection alive | None |

### Server Events (On)

| Event | Description | Payload |
|-------|-------------|---------|
| `storePurchase` | New store purchase notification | Notification object |
| `pong` | Response to ping | None |
| `connect` | Socket connected | None |
| `disconnect` | Socket disconnected | Reason |

---

## Metadata Fields

Each store purchase notification includes the following metadata:

| Field | Type | Description |
|-------|------|-------------|
| `buyerId` | ObjectId | User ID of the buyer |
| `buyerName` | String | Full name of the buyer |
| `buyerEmail` | String | Email of the buyer |
| `productId` | ObjectId | Product ID |
| `productName` | String | Name of the product |
| `purchaseSerial` | String | Unique purchase serial number |
| `price` | Number | Original product price |
| `finalPrice` | Number | Final price after discounts |
| `purchaseTime` | Date | Timestamp of purchase |

---

## Browser Notifications

### Requesting Permission

To enable browser notifications, admins need to grant permission:

```javascript
// Request permission on admin dashboard
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
```

### Automatic Notifications

Once permission is granted, admins will receive desktop notifications automatically when:
- A new purchase is made
- The admin's browser tab is not focused
- The browser supports Web Notifications API

---

## Offline Behavior

### What Happens When Admin is Offline?

1. **Notification is created** in the database with `isSent: false`
2. **Stored in MongoDB** with complete metadata
3. **When admin comes online:**
   - Socket.io connection established
   - Admin emits `subscribe` event
   - Server finds all pending notifications (`isSent: false`)
   - Server sends all pending notifications
   - Server marks notifications as `isSent: true`

### Example Offline Scenario

```
Time 10:00 AM - Admin goes offline
Time 10:15 AM - Customer makes purchase → Notification stored (isSent: false)
Time 10:30 AM - Customer makes another purchase → Notification stored (isSent: false)
Time 11:00 AM - Admin comes online
                 ↓
                 Receives both notifications instantly
```

---

## Error Handling

### Purchase Notification Failure

If notification fails, **the purchase still succeeds**:

```javascript
try {
  // Send notifications to admins
} catch (notificationError) {
  console.error("Error sending store purchase notifications:", notificationError);
  // Don't fail the purchase if notification fails
}
```

This ensures customer experience is not affected by notification issues.

---

## Console Logging

The system provides detailed console logs for debugging:

**Backend Logs:**
```
Found 2 admin/subadmin users to notify
Created notification for Admin John Doe (60abc...), online: true
Sent real-time notification to Admin John Doe
Store purchase notifications created for 2 admins/subadmins
```

**Frontend Logs:**
```
Received store purchase notification: {title: "New Store Purchase", ...}
```

---

## Database Schema Changes

### Notification Model

**Before:**
```javascript
{
  userId, title, message, type, relatedId, isSent, read, createdAt
}
```

**After:**
```javascript
{
  userId, title, message, type, relatedId, isSent, read, 
  metadata, // NEW - stores rich purchase data
  createdAt
}
```

---

## Performance Considerations

1. **Async Processing** - Notification sending is asynchronous and doesn't block purchase
2. **Selective Targeting** - Only Admins/SubAdmins receive notifications (not all users)
3. **Efficient Queries** - Uses indexed fields (role, userId)
4. **Connection Pooling** - Socket.io maintains persistent connections
5. **Error Isolation** - Notification failures don't affect purchase flow

---

## Future Enhancements

### Potential Improvements:

1. **Email Notifications** - Send email to admins for high-value purchases
2. **SMS Alerts** - Critical purchase notifications via SMS
3. **Notification Filters** - Allow admins to filter by purchase amount, product type
4. **Analytics Dashboard** - Real-time purchase dashboard for admins
5. **Sound Alerts** - Audio notification for new purchases
6. **Notification Preferences** - Allow admins to customize notification settings
7. **Grouped Notifications** - Bundle multiple purchases in one notification

---

## Troubleshooting

### Notifications Not Received?

**Check:**
1. ✅ Admin is logged in
2. ✅ Socket.io connection is established (check console)
3. ✅ Admin role is "Admin" or "SubAdmin"
4. ✅ Backend server is running
5. ✅ No firewall blocking WebSocket connections
6. ✅ CORS configuration allows your domain

### Check Socket Connection Status

```javascript
// In browser console
const socket = getSocket();
console.log("Socket connected:", socket?.connected);
```

### Check Notification Template

```javascript
// In MongoDB
db.notificationtemplates.findOne({type: "store_purchase"})
```

Should return:
```json
{
  "type": "store_purchase",
  "title": "New Store Purchase",
  "message": "{buyer} purchased {product} for {price} EGP at {time}"
}
```

---

## Files Modified

### Backend
- ✅ `models/notificationTemplateModel.js`
- ✅ `models/notification.js`
- ✅ `utils/seeds/seedNotificationTemplates.js`
- ✅ `controllers/ec.purchaseController.js`
- ✅ `server.js`

### Frontend
- ✅ `utils/socket.js`
- ✅ `components/NotificationCenter.jsx`

---

## Testing Checklist

- [ ] Notification template seeded in database
- [ ] Admin user can receive notifications
- [ ] SubAdmin user can receive notifications
- [ ] Student/Parent does NOT receive store notifications
- [ ] Offline admin receives notifications when coming online
- [ ] Browser notifications work (when permission granted)
- [ ] Notification appears in NotificationCenter UI
- [ ] Purchase completes even if notification fails
- [ ] Metadata includes all purchase details
- [ ] Console logs show notification flow

---

## Support

For issues or questions:
1. Check console logs (both frontend and backend)
2. Verify Socket.io connection
3. Check notification template in database
4. Verify user roles
5. Review error logs

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Author:** Kalima Development Team

