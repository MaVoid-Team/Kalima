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
  payload: PurchaseNotificationPayload,
): Promise<void> {
  if (!isRedisAvailable() || !redis) return;
  try {
    await redis.xadd(
      STREAM_KEY,
      "*",
      "payload",
      JSON.stringify(payload),
      "timestamp",
      Date.now().toString(),
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
  onPurchase: (payload: PurchaseNotificationPayload) => void | Promise<void>,
): void {
  let running = true;
  const MAX_CONSECUTIVE_ERRORS = 3;
  let consecutiveErrors = 0;

  async function poll(): Promise<void> {
    if (!running) return;

    while (running) {
      if (!isRedisAvailable() || !redis) {
        // If Redis becomes unavailable during runtime, treat it as an error
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.warn(
            `[NotificationStream] Stopped after ${MAX_CONSECUTIVE_ERRORS} consecutive errors due to Redis unavailability.`,
          );
          running = false; // Stop polling
          return;
        }
        console.error(
          "[NotificationStream] Consumer error: Redis is not available.",
        );
        await new Promise((r) => setTimeout(r, 2000)); // Wait before retrying
        continue; // Try again in the next loop iteration
      }

      try {
        const results = await (redis!.xreadgroup as any)(
          "GROUP",
          CONSUMER_GROUP,
          CONSUMER_NAME,
          "BLOCK",
          "2000",
          "COUNT",
          "10",
          "STREAMS",
          STREAM_KEY,
          ">",
        );

        consecutiveErrors = 0; // Reset errors on successful read

        if (!results || results.length === 0) {
          // No messages, continue polling immediately (BLOCK handles timeout)
          continue;
        }

        for (const [, messages] of results) {
          for (const [id, fields] of messages) {
            try {
              const payloadIdx = fields.indexOf("payload");
              if (payloadIdx >= 0 && fields[payloadIdx + 1]) {
                const payload = JSON.parse(
                  fields[payloadIdx + 1],
                ) as PurchaseNotificationPayload;
                await onPurchase(payload);
              }
              if (redis) await redis.xack(STREAM_KEY, CONSUMER_GROUP, id);
            } catch (err) {
              console.error(
                "[NotificationStream] Error processing message:",
                err,
              );
            }
          }
        }
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.warn(
            `[NotificationStream] Stopped after ${MAX_CONSECUTIVE_ERRORS} consecutive errors. Redis may be unavailable.`,
          );
          running = false; // Stop polling
          return;
        }
        console.error(
          "[NotificationStream] Consumer error:",
          (err as Error).message,
        );
        // Wait before retrying to avoid spamming
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  ensureConsumerGroup().then(() => poll());

  process.on("SIGTERM", () => {
    running = false;
  });
  process.on("SIGINT", () => {
    running = false;
  });
}
