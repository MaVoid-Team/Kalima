import { redis, isRedisAvailable } from "../../../libs/redis/client";

const STREAM_KEY = "store_purchases";
const CONSUMER_GROUP = "notification-consumers";
const CONSUMER_NAME = "notifier-1";

export type PurchaseNotificationPayload = {
  purchase_id: number;
  purchase_serial: string;
  user_id: number;
  total: number;
  item_count: number;
  customer_name: string;
};

/**
 * Add a purchase event to the Redis stream for notification delivery.
 * Call this after checkout transaction succeeds.
 * No-op when Redis is not configured.
 */
export async function addPurchaseEvent(
  payload: PurchaseNotificationPayload
): Promise<void> {
  if (!isRedisAvailable() || !redis) return;
  try {
    await redis.xadd(
      STREAM_KEY,
      "*",
      "payload",
      JSON.stringify(payload),
      "timestamp",
      Date.now().toString()
    );
  } catch (err) {
    console.error("[NotificationStream] Failed to add purchase event:", err);
  }
}

/**
 * Ensure the consumer group exists. Call once on startup.
 */
export async function ensureConsumerGroup(): Promise<void> {
  if (!isRedisAvailable() || !redis) return;
  try {
    await redis.xgroup("CREATE", STREAM_KEY, CONSUMER_GROUP, "0", "MKSTREAM");
  } catch (err: unknown) {
    const e = err as { message?: string };
    if (e?.message?.includes("BUSYGROUP")) {
      return;
    }
    console.error("[NotificationStream] Failed to create consumer group:", err);
  }
}

/**
 * Start consuming purchase events. Pass a handler that receives each payload.
 * Designed to run in-process; call from server startup.
 */
export function startPurchaseNotificationConsumer(
  onPurchase: (payload: PurchaseNotificationPayload) => void | Promise<void>
): void {
  let running = true;

  async function poll(): Promise<void> {
    if (!running) return;
    if (!isRedisAvailable() || !redis) return;
    try {
      const results = await redis.xreadgroup(
        "GROUP",
        CONSUMER_GROUP,
        CONSUMER_NAME,
        "BLOCK",
        "5000",
        "COUNT",
        "10",
        "STREAMS",
        STREAM_KEY,
        ">"
      );

      if (!results || results.length === 0) {
        setImmediate(poll);
        return;
      }

      for (const [, messages] of results) {
        for (const [id, fields] of messages) {
          try {
            const payloadIdx = fields.indexOf("payload");
            if (payloadIdx >= 0 && fields[payloadIdx + 1]) {
              const payload = JSON.parse(
                fields[payloadIdx + 1]
              ) as PurchaseNotificationPayload;
              await onPurchase(payload);
            }
            if (redis) await redis.xack(STREAM_KEY, CONSUMER_GROUP, id);
          } catch (err) {
            console.error(
              "[NotificationStream] Error processing message:",
              err
            );
          }
        }
      }
    } catch (err) {
      console.error("[NotificationStream] Consumer error:", err);
    }
    setImmediate(poll);
  }

  ensureConsumerGroup().then(() => poll());

  process.on("SIGTERM", () => {
    running = false;
  });
  process.on("SIGINT", () => {
    running = false;
  });
}
