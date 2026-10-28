// Pure fixed-window policy, kept free of I/O so it can be unit tested.
// Each limit gets its own window document keyed by the window start, so a
// single atomic $inc per window is enough and expired windows can be dropped by TTL.

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export function rateLimitWindows(uid, bucket, nowMs, { perMinute, perDay }) {
  return [
    { size: MINUTE_MS, limit: perMinute, unit: 'm' },
    { size: DAY_MS, limit: perDay, unit: 'd' },
  ].map(({ size, limit, unit }) => {
    const start = Math.floor(nowMs / size) * size;
    return {
      key: `${uid}:${bucket}:${unit}:${start}`,
      limit,
      resetAt: start + size,
      expiresAt: new Date(start + size),
    };
  });
}

// counts[i] is the post-increment count for windows[i].
export function evaluateRateLimit(windows, counts, nowMs) {
  const exceeded = windows.filter((window, index) => counts[index] > window.limit);
  if (!exceeded.length) return { allowed: true, retryAfterSeconds: 0 };
  const resetAt = Math.max(...exceeded.map((window) => window.resetAt));
  return { allowed: false, retryAfterSeconds: Math.ceil((resetAt - nowMs) / 1000) };
}
