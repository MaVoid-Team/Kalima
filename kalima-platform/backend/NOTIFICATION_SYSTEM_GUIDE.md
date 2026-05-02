# Backend V2 Notification System Guide

Yes! There is already a robust, real-time notification system implemented in Backend V2.

## How it Works Currently

The current system relies on a combination of **Redis Streams** and **Socket.IO**:
1. **Adding the Event**: When a significant action occurs (like a successful checkout), the system adds an event payload to a Redis Stream using `addPurchaseEvent()` located in `src/apps/store-api/services/notificationStream.service.ts`.
2. **Consuming the Event**: A background consumer (`startPurchaseNotificationConsumer`) actively listens to this Redis Stream.
3. **Emitting to Frontend**: When the consumer picks up a new event, it triggers `emitStorePurchaseToAdmins()` from `src/libs/redis/socketNotificationEmitter.ts`.
4. **Broadcasting**: The Socket.IO server takes that event and broadcasts it to everyone who is in the `store_admins` Socket.IO room.

## How to Edit it for Specific Users

Currently, the system broadcasts to *all* admins:
```typescript
// Inside socketNotificationEmitter.ts
io.to("store_admins").emit("storePurchase", eventPayload);
```

If you look at how sockets are configured in `src/libs/socket/setupStoreSocket.ts`, you will notice that when a user authenticates, they are added to **two** rooms:
```typescript
socket.join("store_admins");
socket.join(`user:${userId}`); // <-- This is the key!
```

Because every connected user has their own dedicated, private Socket.IO room named `user:<their_user_id>`, targeting a specific user is extremely simple.

### Step-by-Step Implementation for Specific Users

**1. Update the Event Payload (if necessary)**
Ensure that the payload being sent into the Redis stream contains the `target_user_id` you want to notify.

**2. Modify the Emitter (`src/libs/redis/socketNotificationEmitter.ts`)**
Create a new function (or modify the existing one) to send the event to the specific user's room instead of the general admin room.

```typescript
import type { Server as SocketIOServer } from "socket.io";

export function emitNotificationToUser(
  io: SocketIOServer,
  targetUserId: number, 
  payload: any
): void {
  const eventPayload = {
    type: "direct_message",
    message: payload.message,
    timestamp: new Date().toISOString(),
  };

  // Target the specific user's room
  io.to(`user:${targetUserId}`).emit("privateNotification", eventPayload);
}
```

**3. Trigger it in the Consumer**
Inside your consumer logic (or wherever you are listening to the Redis stream), just call the new function and pass the specific ID:

```typescript
// Assuming your payload has a target_user_id
emitNotificationToUser(io, payload.target_user_id, payload);
```

By changing `.to("store_admins")` to `.to("user:123")`, the Socket.IO server will instantly route that real-time event *only* to the browser tab belonging to User 123!
