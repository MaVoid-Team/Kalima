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
