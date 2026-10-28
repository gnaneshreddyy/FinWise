import { ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import { HttpError } from './http.js';
import { conversationTitle } from '../../core/ai/memory.js';

// conversations: { _id, uid, title, createdAt, updatedAt, messageCount, preview }
// messages:      { _id, conversationId, uid, role, content, createdAt, model?, usage? }
// Every query filters on uid, so one user can never read another user's thread.

const HISTORY_TURNS = 12;

const toConversation = (doc) => ({
  id: doc._id.toHexString(),
  title: doc.title,
  preview: doc.preview || '',
  messageCount: doc.messageCount || 0,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const toMessage = (doc) => ({
  id: doc._id.toHexString(),
  role: doc.role,
  content: doc.content,
  createdAt: doc.createdAt,
});

export async function getOrCreateConversation(uid, conversationId, firstMessage) {
  const db = await getDb();
  if (conversationId) {
    const existing = await db.collection('conversations').findOne({ _id: new ObjectId(conversationId), uid });
    if (!existing) throw new HttpError(404, 'Conversation not found.');
    return { conversation: toConversation(existing), isNew: false };
  }

  const now = new Date();
  const doc = { uid, title: conversationTitle(firstMessage), createdAt: now, updatedAt: now, messageCount: 0, preview: '' };
  const { insertedId } = await db.collection('conversations').insertOne(doc);
  return { conversation: toConversation({ ...doc, _id: insertedId }), isNew: true };
}

// Most recent turns, oldest first, ready to hand to the model.
export async function loadRecentTurns(uid, conversationId, limit = HISTORY_TURNS) {
  const db = await getDb();
  const docs = await db
    .collection('messages')
    .find({ conversationId: new ObjectId(conversationId), uid })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.reverse().map(({ role, content }) => ({ role, content }));
}

export async function appendExchange(uid, conversationId, { userMessage, reply, model, usage }) {
  const db = await getDb();
  const _id = new ObjectId(conversationId);
  const userAt = new Date();
  const replyAt = new Date(userAt.getTime() + 1);

  await db.collection('messages').insertMany([
    { conversationId: _id, uid, role: 'user', content: userMessage, createdAt: userAt },
    { conversationId: _id, uid, role: 'assistant', content: reply, createdAt: replyAt, model, usage },
  ]);
  await db.collection('conversations').updateOne(
    { _id, uid },
    { $set: { updatedAt: replyAt, preview: reply.slice(0, 120) }, $inc: { messageCount: 2 } }
  );
}

export async function listConversations(uid, limit = 30) {
  const db = await getDb();
  const docs = await db.collection('conversations').find({ uid }).sort({ updatedAt: -1 }).limit(limit).toArray();
  return docs.map(toConversation);
}

export async function getConversationWithMessages(uid, conversationId) {
  const db = await getDb();
  const _id = new ObjectId(conversationId);
  const conversation = await db.collection('conversations').findOne({ _id, uid });
  if (!conversation) throw new HttpError(404, 'Conversation not found.');
  const messages = await db.collection('messages').find({ conversationId: _id, uid }).sort({ createdAt: 1 }).limit(500).toArray();
  return { conversation: toConversation(conversation), messages: messages.map(toMessage) };
}

export async function deleteConversation(uid, conversationId) {
  const db = await getDb();
  const _id = new ObjectId(conversationId);
  const { deletedCount } = await db.collection('conversations').deleteOne({ _id, uid });
  if (!deletedCount) throw new HttpError(404, 'Conversation not found.');
  await db.collection('messages').deleteMany({ conversationId: _id, uid });
}
