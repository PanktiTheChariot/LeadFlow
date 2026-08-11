import Redis from "ioredis";

const CACHE_TTL_SECONDS = 60;

let client: Redis | null | undefined; // undefined = not yet resolved, null = disabled

/** Returns null (never throws) whenever REDIS_URL is unset or the connection is unhealthy. */
function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return client;
  }

  client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: false });
  client.on("error", (error) => {
    console.error("Redis connection error (caching disabled for this request):", error.message);
  });

  return client;
}

function versionKey(companyId: string): string {
  return `leads:${companyId}:v`;
}

async function getVersion(redis: Redis, companyId: string): Promise<number> {
  const value = await redis.get(versionKey(companyId));
  return value ? Number(value) : 0;
}

/**
 * Cache is keyed by a per-tenant version counter rather than deleting keys directly:
 * on any write, `invalidateLeadsCache` bumps the counter so every previously cached
 * entry for that tenant becomes unreachable (and simply expires via TTL), which avoids
 * an unsafe KEYS/SCAN-based bulk delete on every mutation.
 */
export async function getCachedLeadsList(companyId: string, cacheKeySuffix: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const version = await getVersion(redis, companyId);
    return await redis.get(`leads:${companyId}:v${version}:${cacheKeySuffix}`);
  } catch (error) {
    console.error("Redis read error:", error);
    return null;
  }
}

export async function setCachedLeadsList(
  companyId: string,
  cacheKeySuffix: string,
  payload: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const version = await getVersion(redis, companyId);
    await redis.set(`leads:${companyId}:v${version}:${cacheKeySuffix}`, payload, "EX", CACHE_TTL_SECONDS);
  } catch (error) {
    console.error("Redis write error:", error);
  }
}

export async function invalidateLeadsCache(companyId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.incr(versionKey(companyId));
  } catch (error) {
    console.error("Redis invalidate error:", error);
  }
}
