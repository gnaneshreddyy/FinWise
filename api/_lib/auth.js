import { adminAuth } from './firebaseAdmin.js';
import { HttpError } from './http.js';

export async function verifyUser(idToken) {
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
      provider: decoded.firebase?.sign_in_provider || 'unknown',
    };
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }
}
