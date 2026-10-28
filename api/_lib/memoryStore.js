import { randomUUID } from 'node:crypto';
import { getDb } from './mongo.js';
import { mergeFacts } from '../../core/ai/memory.js';

// user_memory: { _id: uid, facts: [{ id, text, createdAt, conversationId }], updatedAt }

const toFact = ({ id, text, createdAt }) => ({ id, text, createdAt });

export async function getMemory(uid) {
  const db = await getDb();
  const doc = await db.collection('user_memory').findOne({ _id: uid });
  return (doc?.facts || []).map(toFact);
}

export async function rememberFacts(uid, texts, { conversationId } = {}) {
  if (!texts.length) return [];
  const db = await getDb();
  const doc = await db.collection('user_memory').findOne({ _id: uid });
  const { facts, added } = mergeFacts(doc?.facts || [], texts, { makeId: randomUUID });
  if (!added.length) return [];

  const tagged = facts.map((fact) => (added.includes(fact) ? { ...fact, conversationId } : fact));
  await db.collection('user_memory').updateOne(
    { _id: uid },
    { $set: { facts: tagged, updatedAt: new Date() } },
    { upsert: true }
  );
  return added.map(toFact);
}

export async function forgetFact(uid, factId) {
  const db = await getDb();
  await db.collection('user_memory').updateOne({ _id: uid }, { $pull: { facts: { id: factId } }, $set: { updatedAt: new Date() } });
}

export async function clearMemory(uid) {
  const db = await getDb();
  await db.collection('user_memory').deleteOne({ _id: uid });
}
