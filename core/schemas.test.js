import { describe, expect, it } from 'vitest';
import { squadActionSchema, transactionCreateSchema, transactionDeleteSchema, transactionInputSchema } from './schemas.js';
import { buildUsernameFromName, normalizeUsername } from './profile.js';

const valid = { date: '2026-10-28', time: '01:30', amount: -240, category: 'food', description: 'Chai' };

describe('transactionInputSchema', () => {
  it('accepts a valid transaction and defaults source to manual', () => {
    expect(transactionInputSchema.parse(valid)).toEqual({ ...valid, source: 'manual' });
  });

  it.each([
    ['zero amount', { amount: 0 }],
    ['huge amount', { amount: 1e9 }],
    ['string amount', { amount: '240' }],
    ['ISO date', { date: '2026-10-28T01:30:00Z' }],
    ['unknown category', { category: 'crypto' }],
    ['unknown source', { source: 'bank' }],
    ['long description', { description: 'x'.repeat(201) }],
  ])('rejects %s', (_label, patch) => {
    expect(transactionInputSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it('rejects operator injection in place of values', () => {
    expect(transactionInputSchema.safeParse({ ...valid, amount: { $gt: 0 } }).success).toBe(false);
  });

  it('strips unknown fields such as uid so clients cannot write into another account', () => {
    expect(transactionInputSchema.parse({ ...valid, uid: 'someone-else' })).not.toHaveProperty('uid');
  });
});

describe('transactionCreateSchema', () => {
  it('caps batches at 500', () => {
    expect(transactionCreateSchema.safeParse({ transactions: Array(501).fill(valid) }).success).toBe(false);
    expect(transactionCreateSchema.safeParse({ transactions: [] }).success).toBe(false);
  });
});

describe('transactionDeleteSchema', () => {
  it('needs exactly one of id or source=sample', () => {
    expect(transactionDeleteSchema.safeParse({ id: '665f1c2a9b1e8a0012345678' }).success).toBe(true);
    expect(transactionDeleteSchema.safeParse({ source: 'sample' }).success).toBe(true);
    expect(transactionDeleteSchema.safeParse({}).success).toBe(false);
    expect(transactionDeleteSchema.safeParse({ id: '665f1c2a9b1e8a0012345678', source: 'sample' }).success).toBe(false);
  });
});

describe('squadActionSchema', () => {
  it('requires a username for invite and join', () => {
    expect(squadActionSchema.safeParse({ action: 'create' }).success).toBe(true);
    expect(squadActionSchema.safeParse({ action: 'join' }).success).toBe(false);
    expect(squadActionSchema.safeParse({ action: 'award', points: 1000 }).success).toBe(false);
  });
});

describe('usernames', () => {
  it('builds a stable, sanitised username and lengthens it on retry', () => {
    const first = buildUsernameFromName('Gnanesh Reddy!', 'abcDEF123');
    expect(first).toMatch(/^gnanesh_reddy_[a-z0-9]{4}$/);
    expect(buildUsernameFromName('Gnanesh Reddy!', 'abcDEF123')).toBe(first);
    expect(buildUsernameFromName('Gnanesh Reddy!', 'abcDEF123', 1)).not.toBe(first);
  });

  it('normalises @handles', () => {
    expect(normalizeUsername('  @@Gnanesh_X1 ')).toBe('gnanesh_x1');
  });
});
