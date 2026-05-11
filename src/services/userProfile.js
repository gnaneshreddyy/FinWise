import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const USERNAME_MAX_BASE_LENGTH = 18;

function sanitizeUsernameBase(name = '') {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  if (!normalized) {
    return 'finwise_user';
  }

  return normalized.slice(0, USERNAME_MAX_BASE_LENGTH);
}

function shortHash(uid = '') {
  if (!uid) return '0000';
  let hash = 0;
  for (let i = 0; i < uid.length; i += 1) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(-4).padStart(4, '0');
}

export function buildUsernameFromName(name, uid) {
  const base = sanitizeUsernameBase(name);
  const suffix = shortHash(uid);
  return `${base}_${suffix}`;
}

export async function getOrCreateUserProfile(firebaseUser) {
  if (!firebaseUser?.uid) {
    return null;
  }

  const profileRef = doc(db, 'users', firebaseUser.uid);

  return runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);

    if (profileSnapshot.exists()) {
      const existing = profileSnapshot.data();
      return {
        uid: firebaseUser.uid,
        ...existing,
        points: existing.points || { total: 0, actions: [] },
      };
    }

    const fullName =
      firebaseUser.displayName?.trim() ||
      firebaseUser.email?.split('@')?.[0] ||
      'FinWise User';

    const username = buildUsernameFromName(fullName, firebaseUser.uid);
    const now = serverTimestamp();

    const newProfile = {
      uid: firebaseUser.uid,
      fullName,
      username,
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      providerId: firebaseUser.providerData?.[0]?.providerId || 'unknown',
      squadId: null,
      squadRole: null,
      points: {
        total: 0,
        actions: [],
      },
      createdAt: now,
      updatedAt: now,
    };

    transaction.set(profileRef, newProfile);
    return newProfile;
  });
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const profileRef = doc(db, 'users', uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) return null;
  return {
    uid,
    ...snapshot.data(),
    points: snapshot.data().points || { total: 0, actions: [] },
  };
}
