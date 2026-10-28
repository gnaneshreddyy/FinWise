import { getUser } from './userStore.js';
import { listTransactions } from './transactionStore.js';
import { shiftMonthKey, toDateKey } from '../../core/finance/dates.js';

// Reads the signed-in user's data on the server, so the model only ever sees
// what is actually stored for that uid, never a client-supplied payload.
export async function loadUserFinancialData(uid, { months = 12, now = new Date() } = {}) {
  const fromDate = `${shiftMonthKey(toDateKey(now).slice(0, 7), -(months - 1))}-01`;
  const [profile, transactions] = await Promise.all([getUser(uid), listTransactions(uid, { fromDate })]);
  return { profile, transactions };
}
