import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export function initializeFirebase() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountPath) {
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env file');
  }

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`❌ Firebase key file not found at: ${serviceAccountPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase initialized successfully');
  }
}
