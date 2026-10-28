import { z } from 'zod';

export const TRANSACTION_CATEGORIES = Object.freeze([
  'food',
  'groceries',
  'transport',
  'shopping',
  'bills',
  'rent',
  'entertainment',
  'health',
  'education',
  'salary',
  'freelance',
  'refund',
  'other',
]);

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

// History is no longer sent by the client: the server loads it from the stored conversation.
export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'message is required').max(1000),
  conversationId: objectId.optional(),
});

export const insightsRequestSchema = z.object({}).passthrough();

export const conversationQuerySchema = z.object({ id: objectId.optional() });
export const conversationDeleteSchema = z.object({ id: objectId });

export const memoryDeleteSchema = z.object({ factId: z.string().uuid().optional() });

// Same constraints the old Firestore rules enforced, now checked by the API.
export const transactionInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'time must be HH:mm'),
  amount: z
    .number()
    .finite()
    .refine((value) => value !== 0, 'amount cannot be zero')
    .refine((value) => Math.abs(value) < 100_000_000, 'amount is too large'),
  category: z.enum(TRANSACTION_CATEGORIES),
  description: z.string().trim().max(200).default(''),
  source: z.enum(['manual', 'sample']).default('manual'),
});

export const transactionCreateSchema = z.object({
  transactions: z.array(transactionInputSchema).min(1).max(500),
});

export const transactionUpdateSchema = z.object({ id: objectId }).merge(transactionInputSchema);

export const transactionDeleteSchema = z
  .object({ id: objectId.optional(), source: z.literal('sample').optional() })
  .refine((value) => Boolean(value.id) !== Boolean(value.source), 'Pass either id or source=sample');

export const profileEnsureSchema = z.object({ fullName: z.string().trim().max(80).optional() });

export const squadActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create') }),
  z.object({ action: z.literal('invite'), username: z.string().trim().min(1).max(40) }),
  z.object({ action: z.literal('join'), username: z.string().trim().min(1).max(40) }),
]);
