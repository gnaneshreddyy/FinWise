import { describe, expect, it } from 'vitest';
import { evaluateRateLimit, rateLimitWindows } from './rateLimitPolicy.js';

const limits = { perMinute: 2, perDay: 3 };
const t0 = Date.UTC(2026, 9, 28, 10, 0, 5);

describe('rateLimitWindows', () => {
  it('keys windows by user, bucket and window start', () => {
    const [minute, day] = rateLimitWindows('u1', 'chat', t0, limits);
    expect(minute.key).toBe(`u1:chat:m:${Date.UTC(2026, 9, 28, 10, 0)}`);
    expect(day.key).toBe(`u1:chat:d:${Date.UTC(2026, 9, 28)}`);
    expect(minute.expiresAt.getTime()).toBe(Date.UTC(2026, 9, 28, 10, 1));
  });

  it('gives a new minute window a different key', () => {
    const [a] = rateLimitWindows('u1', 'chat', t0, limits);
    const [b] = rateLimitWindows('u1', 'chat', t0 + 60_000, limits);
    expect(a.key).not.toBe(b.key);
  });
});

describe('evaluateRateLimit', () => {
  const windows = rateLimitWindows('u1', 'chat', t0, limits);

  it('allows requests within both limits', () => {
    expect(evaluateRateLimit(windows, [2, 3], t0).allowed).toBe(true);
  });

  it('blocks over the minute limit until the minute resets', () => {
    expect(evaluateRateLimit(windows, [3, 3], t0)).toEqual({ allowed: false, retryAfterSeconds: 55 });
  });

  it('reports the later reset when the daily cap is also hit', () => {
    const result = evaluateRateLimit(windows, [3, 4], t0);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(Math.ceil((Date.UTC(2026, 9, 29) - t0) / 1000));
  });
});
