import { getDb } from './mongo.js';
import { buildUsernameFromName } from '../../core/profile.js';

// users: { _id: uid, email, fullName, photoURL, provider, username (unique),
//          squadId, squadRole, points: { total, actions[] }, monthlyIncome?, debt?, financialGoals?,
//          createdAt, updatedAt }

const DUPLICATE_KEY = 11000;

export function toProfile(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { uid: _id, ...rest, points: rest.points || { total: 0, actions: [] } };
}

// Only what other squad members may see: no email, no money data.
export function toPublicProfile(doc) {
  return {
    uid: doc._id,
    fullName: doc.fullName,
    username: doc.username,
    photoURL: doc.photoURL || '',
    squadId: doc.squadId || null,
    squadRole: doc.squadRole || null,
    points: { total: Number(doc.points?.total || 0), actions: [] },
  };
}

export async function getUser(uid) {
  const db = await getDb();
  return db.collection('users').findOne({ _id: uid });
}

export async function findUserByUsername(username) {
  const db = await getDb();
  return db.collection('users').findOne({ username });
}

// Creates the profile on first sign-in. Safe to call on every load.
export async function ensureUser(user, { fullName } = {}) {
  const db = await getDb();
  const users = db.collection('users');
  const existing = await users.findOne({ _id: user.uid });
  if (existing) {
    // Email sign-ups set their display name just after the account exists; pick it up once.
    if (fullName && existing.fullName !== fullName && existing.nameSource === 'email') {
      await users.updateOne({ _id: user.uid }, { $set: { fullName, nameSource: 'user', updatedAt: new Date() } });
      return toProfile({ ...existing, fullName });
    }
    return toProfile(existing);
  }

  const name = fullName || user.name || user.email?.split('@')[0] || 'FinWise User';
  const now = new Date();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const doc = {
      _id: user.uid,
      email: user.email || '',
      fullName: name,
      nameSource: fullName || user.name ? 'user' : 'email',
      photoURL: user.picture || '',
      provider: user.provider,
      username: buildUsernameFromName(name, user.uid, attempt),
      squadId: null,
      squadRole: null,
      points: { total: 0, actions: [] },
      createdAt: now,
      updatedAt: now,
    };
    try {
      await users.insertOne(doc);
      return toProfile(doc);
    } catch (error) {
      if (error.code !== DUPLICATE_KEY) throw error;
      // Either the same user raced us (return theirs) or the username is taken (try a longer one).
      const raced = await users.findOne({ _id: user.uid });
      if (raced) return toProfile(raced);
    }
  }
  throw new Error('Could not allocate a username.');
}

export async function awardPoints(uid, action, metadata = {}) {
  const db = await getDb();
  const entry = { key: action.key, label: action.label, points: action.points, createdAt: new Date().toISOString(), metadata };
  await db.collection('users').updateOne(
    { _id: uid },
    {
      $inc: { 'points.total': action.points },
      $push: { 'points.actions': { $each: [entry], $position: 0, $slice: 50 } },
      $set: { updatedAt: new Date() },
    }
  );
}
