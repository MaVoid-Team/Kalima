import type { Server as SocketIOServer } from "socket.io";
import type { PurchaseNotificationPayload } from "../../apps/store-api/services/notificationStream.service";

/**
 * Emit a store purchase notification to all connected admins.
 * Admins join the "store_admins" room when they connect (with valid auth).
 */
export function emitStorePurchaseToAdmins(
  io: SocketIOServer,
  payload: PurchaseNotificationPayload
): void {
  const eventPayload = {
    type: "store_purchase",
    purchase_id: payload.purchase_id,
    purchase_serial: payload.purchase_serial,
    customer_name: payload.customer_name,
    total: payload.total,
    item_count: payload.item_count,
    timestamp: new Date().toISOString(),
  };
  io.to("store_admins").emit("storePurchase", eventPayload);
}

/**
 * Emit a notification to a single user by their user ID.
 * All authenticated users join "user:{userId}" on socket connection.
 */
export function emitNotificationToUser(
  io: SocketIOServer,
  userId: number,
  notification: {
    id: number;
    category: number;
    message_key: string;
    entity_type: string | null;
    entity_id: number | null;
    target_link: string | null;
    created_at: Date | null;
  }
): void {
  io.to(`user:${userId}`).emit("notification", notification);
}

/**
 * Emit a notification to a list of user IDs (role-based broadcast).
 */
export function emitNotificationToUsers(
  io: SocketIOServer,
  userIds: number[],
  notification: {
    id: number;
    category: number;
    message_key: string;
    entity_type: string | null;
    entity_id: number | null;
    target_link: string | null;
    created_at: Date | null;
  }
): void {
  for (const uid of userIds) {
    io.to(`user:${uid}`).emit("notification", notification);
  }
}
