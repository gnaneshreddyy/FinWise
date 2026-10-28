import { ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import { HttpError } from './http.js';

// transactions: { _id, uid, date "YYYY-MM-DD", time "HH:mm", amount, category, description, source, createdAt, updatedAt }
// Dates stay as local calendar strings chosen by the client, so no timezone conversion happens here.

const MAX_RETURNED = 5000;

// The owner's uid never goes back to the client.
export function toTransaction({ _id, ...rest }) {
  delete rest.uid;
  return { id: _id.toHexString(), ...rest };
}

export async function listTransactions(uid, { fromDate } = {}) {
  const db = await getDb();
  const filter = fromDate ? { uid, date: { $gte: fromDate } } : { uid };
  const docs = await db.collection('transactions').find(filter).sort({ date: -1, time: -1 }).limit(MAX_RETURNED).toArray();
  return docs.map(toTransaction);
}

export async function createTransactions(uid, inputs) {
  const db = await getDb();
  const now = new Date();
  const docs = inputs.map((input) => ({ ...input, uid, createdAt: now, updatedAt: now }));
  const { insertedIds } = await db.collection('transactions').insertMany(docs);
  return docs.map((doc, index) => toTransaction({ ...doc, _id: insertedIds[index] }));
}

export async function updateTransaction(uid, id, input) {
  const db = await getDb();
  const doc = await db.collection('transactions').findOneAndUpdate(
    { _id: new ObjectId(id), uid },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!doc) throw new HttpError(404, 'Transaction not found.');
  return toTransaction(doc);
}

export async function deleteTransaction(uid, id) {
  const db = await getDb();
  const { deletedCount } = await db.collection('transactions').deleteOne({ _id: new ObjectId(id), uid });
  if (!deletedCount) throw new HttpError(404, 'Transaction not found.');
  return [id];
}

export async function deleteSampleTransactions(uid) {
  const db = await getDb();
  const ids = await db.collection('transactions').find({ uid, source: 'sample' }, { projection: { _id: 1 } }).toArray();
  await db.collection('transactions').deleteMany({ uid, source: 'sample' });
  return ids.map(({ _id }) => _id.toHexString());
}
