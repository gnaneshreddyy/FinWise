import { api } from './backendApi';

// The server creates the profile in MongoDB on first sign-in and returns it on every call.
export async function getOrCreateUserProfile(firebaseUser) {
  if (!firebaseUser?.uid) return null;
  const fullName = firebaseUser.displayName?.trim() || undefined;
  const { profile } = await api.post('/profile', fullName ? { fullName } : {});
  return profile;
}

export async function getUserProfile() {
  const { profile } = await api.post('/profile');
  return profile;
}
