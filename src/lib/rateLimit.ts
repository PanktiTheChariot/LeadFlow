interface WindowState {
  count: number;
  resetAt: number;
}

/**
 * Best-effort in-memory fixed-window limiter. Good enough for a single-instance
 * deployment; a multi-instance deployment should back this with Redis (the same
 * connection already used for the leads cache) using INCR + EXPIRE instead.
 */
const buckets = new Map<string, WindowState>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const state = buckets.get(key);

  if (!state || state.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (state.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((state.resetAt - now) / 1000) };
  }

  state.count += 1;
  return { allowed: true };
}
