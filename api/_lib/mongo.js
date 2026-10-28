import process from 'node:process';
import { MongoClient } from 'mongodb';
import { HttpError } from './http.js';

// One client per serverless instance, reused across invocations (and across
// hot reloads in local dev) instead of opening a connection per request.
const cache = globalThis.__finwiseMongo || (globalThis.__finwiseMongo = { client: null, db: null, ready: null });

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('users').createIndex({ username: 1 }, { unique: true }),
    db.collection('transactions').createIndex({ uid: 1, date: -1, time: -1 }),
    db.collection('transactions').createIndex({ uid: 1, source: 1 }),
    db.collection('conversations').createIndex({ uid: 1, updatedAt: -1 }),
    db.collection('messages').createIndex({ conversationId: 1, createdAt: 1 }),
    db.collection('messages').createIndex({ uid: 1 }),
    // Rate-limit windows delete themselves once they expire.
    db.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export async function getDb() {
  if (cache.db) return cache.db;
  if (!cache.ready) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new HttpError(500, 'Conversation storage is not configured on the server.');

    cache.ready = (async () => {
      const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000, appName: 'finwise' });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || 'finwise');
      await ensureIndexes(db);
      cache.client = client;
      cache.db = db;
      return db;
    })().catch((error) => {
      cache.ready = null;
      console.error('MongoDB connection failed:', error.message);
      throw new HttpError(503, 'Conversation storage is unavailable right now.');
    });
  }
  return cache.ready;
}

export async function closeMongo() {
  await cache.client?.close();
  cache.client = null;
  cache.db = null;
  cache.ready = null;
}
