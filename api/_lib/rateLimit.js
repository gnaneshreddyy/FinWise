import { getDb } from './mongo.js';
import { HttpError } from './http.js';
import { evaluateRateLimit, rateLimitWindows } from './rateLimitPolicy.js';

// Atomic per-window counters in MongoDB, so limits hold across serverless instances.
export async function enforceRateLimit(uid, { bucket, perMinute, perDay }) {
  const db = await getDb();
  const now = Date.now();
  const windows = rateLimitWindows(uid, bucket, now, { perMinute, perDay });

  const counts = await Promise.all(
    windows.map(async (window) => {
      const doc = await db.collection('rate_limits').findOneAndUpdate(
        { _id: window.key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: window.expiresAt } },
        { upsert: true, returnDocument: 'after' }
      );
      return doc.count;
    })
  );

  const result = evaluateRateLimit(windows, counts, now);
  if (!result.allowed) {
    throw new HttpError(429, 'You are sending requests too quickly. Try again shortly.', {
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    });
  }
}
