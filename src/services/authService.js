import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signupWithEmail({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name?.trim()) {
    await updateProfile(credential.user, { displayName: name.trim() });
  }
  return credential;
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  return signOut(auth);
}
