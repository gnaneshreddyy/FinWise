import { api } from './backendApi';
import { normalizeDateKey, toDateKey, toTimeKey } from '../../../core/finance/dates.js';

const DISPLAY_DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Splits a datetime-local value ("2026-10-28T01:30") into stored date and time
// without converting to UTC, so late-night entries keep their calendar day.
function splitDateTime(value) {
  const date = normalizeDateKey(value);
  if (!date) {
    const now = new Date();
    return { date: toDateKey(now), time: toTimeKey(now) };
  }
  const time = typeof value === 'string' && /T\d{2}:\d{2}/.test(value) ? value.slice(11, 16) : '00:00';
  return { date, time };
}

function toPayload(input) {
  const { date, time } = splitDateTime(input.rawDate || input.date);
  return {
    date,
    time,
    amount: Number(input.amount) || 0,
    description: String(input.description || '').trim().slice(0, 200),
    category: input.category || 'other',
    source: input.source === 'sample' ? 'sample' : 'manual',
  };
}

export function toUiTransaction({ id, ...data }) {
  const local = new Date(`${data.date || '1970-01-01'}T${data.time || '00:00'}:00`);
  const valid = !Number.isNaN(local.getTime());
  return {
    id,
    name: data.description || 'Transaction',
    date: valid ? DISPLAY_DATE.format(local) : data.date,
    rawDate: `${data.date}T${data.time || '00:00'}`,
    amount: Number(data.amount) || 0,
    category: data.category || 'other',
    description: data.description || '',
    source: data.source || 'manual',
  };
}

export function sortTransactions(list) {
  return [...list].sort((a, b) => b.rawDate.localeCompare(a.rawDate));
}

export async function getUserTransactions() {
  const { transactions } = await api.get('/transactions');
  return sortTransactions(transactions.map(toUiTransaction));
}

export async function saveUserTransaction(input) {
  const { transactions } = await api.post('/transactions', { transactions: [toPayload(input)] });
  return toUiTransaction(transactions[0]);
}

export async function updateUserTransaction(id, input) {
  const { transaction } = await api.patch('/transactions', { id, ...toPayload(input) });
  return toUiTransaction(transaction);
}

export async function deleteUserTransaction(id) {
  await api.delete('/transactions', { id });
}

export async function addSampleTransactions(inputs) {
  const { transactions } = await api.post('/transactions', {
    transactions: inputs.map((input) => toPayload({ ...input, source: 'sample' })),
  });
  return transactions.map(toUiTransaction);
}

export async function clearSampleTransactions() {
  const { deletedIds } = await api.delete('/transactions', { source: 'sample' });
  return deletedIds;
}
