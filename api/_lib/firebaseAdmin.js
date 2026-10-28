import process from 'node:process';
import { Buffer } from 'node:buffer';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase is used only for authentication. All user data lives in MongoDB.
// FIREBASE_SERVICE_ACCOUNT may hold the service-account JSON itself or its base64
// encoding (easier to paste into Vercel). Without it, Application Default Credentials are used.
function loadCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return applicationDefault();
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return cert(JSON.parse(json));
}

function adminApp() {
  return (
    getApps()[0] ||
    initializeApp({
      credential: loadCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    })
  );
}

export const adminAuth = () => getAuth(adminApp());
