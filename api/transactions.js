import { createHandler, routeByMethod } from './_lib/http.js';
import {
  createTransactions,
  deleteSampleTransactions,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './_lib/transactionStore.js';
import { transactionCreateSchema, transactionDeleteSchema, transactionUpdateSchema } from '../core/schemas.js';

// GET    /api/transactions                 -> all of the user's transactions, newest first
// POST   /api/transactions { transactions } -> create one or many (sample data is a batch)
// PATCH  /api/transactions { id, ...fields } -> edit one
// DELETE /api/transactions?id=... | ?source=sample
export default routeByMethod({
  GET: createHandler({
    method: 'GET',
    async handle({ user }) {
      return { transactions: await listTransactions(user.uid) };
    },
  }),
  POST: createHandler({
    method: 'POST',
    schema: transactionCreateSchema,
    rateLimit: { bucket: 'transactions', perMinute: 60, perDay: 2000 },
    async handle({ user, body }) {
      return { transactions: await createTransactions(user.uid, body.transactions) };
    },
  }),
  PATCH: createHandler({
    method: 'PATCH',
    schema: transactionUpdateSchema,
    async handle({ user, body }) {
      const { id, ...fields } = body;
      return { transaction: await updateTransaction(user.uid, id, fields) };
    },
  }),
  DELETE: createHandler({
    method: 'DELETE',
    schema: transactionDeleteSchema,
    async handle({ user, body }) {
      const deletedIds = body.source ? await deleteSampleTransactions(user.uid) : await deleteTransaction(user.uid, body.id);
      return { deletedIds };
    },
  }),
});
