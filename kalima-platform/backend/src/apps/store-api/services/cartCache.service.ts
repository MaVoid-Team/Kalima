import { redis, isRedisAvailable } from "../../../libs/redis/client";

const CART_KEY_PREFIX = "cart:user:";
const CART_TTL_SECONDS = 2 * 60 * 60; // 2 hours for active carts; avoids stale data after mutations

export function cartCacheKey(userId: number): string {
  return `${CART_KEY_PREFIX}${userId}`;
}

const CACHE_GET_TIMEOUT_MS = 500;

export async function getCachedCart<T>(userId: number): Promise<T | null> {
  if (!isRedisAvailable() || !redis) return null;
  try {
    const raw = await Promise.race([
      redis.get(cartCacheKey(userId)),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Cache timeout")), CACHE_GET_TIMEOUT_MS)
      ),
    ]);
    if (!raw) return null;
    return JSON.parse(raw as string) as T;
  } catch {
    return null;
  }
}

export async function setCachedCart(userId: number, cart: unknown): Promise<void> {
  if (!isRedisAvailable() || !redis) return;
  try {
    const key = cartCacheKey(userId);
    await redis.setex(key, CART_TTL_SECONDS, JSON.stringify(cart));
  } catch (err) {
    console.error("[CartCache] Failed to set:", err);
  }
}

export async function invalidateCartCache(userId: number): Promise<void> {
  if (!isRedisAvailable() || !redis) return;
  try {
    await redis.del(cartCacheKey(userId));
  } catch (err) {
    console.error("[CartCache] Failed to invalidate:", err);
  }
}
