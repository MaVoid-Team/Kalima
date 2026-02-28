import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

const globalForRedis = global as unknown as {
  redis: Redis | null;
};

function createRedisClient(): Redis | null {
  if (!REDIS_URL) return null;
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    commandTimeout: 5000,
    enableReadyCheck: true,
  });
  client.on("error", (err) => console.error("[Redis] Error:", err.message));
  client.on("connect", () => console.log("[Redis] Connected"));
  return client;
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export function isRedisAvailable(): boolean {
  return redis !== null;
}

export async function closeRedis(): Promise<void> {
  if (redis) redis.disconnect();
}
