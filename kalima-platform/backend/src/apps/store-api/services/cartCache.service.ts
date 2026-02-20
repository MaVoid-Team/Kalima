import { redis, isRedisAvailable } from "../../../libs/redis/client";

const CART_KEY_PREFIX = "cart:user:";
const CART_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function cartCacheKey(userId: number): string {
  return `${CART_KEY_PREFIX}${userId}`;
}

export async function getCachedCart<T>(userId: number): Promise<T | null> {
  if (!isRedisAvailable() || !redis) return null;
  try {
    const raw = await redis.get(cartCacheKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as T;
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
