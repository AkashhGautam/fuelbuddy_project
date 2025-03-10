import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import { FastifyRequest, FastifyReply } from 'fastify';

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

// Extend FastifyRequest to include user data
declare module 'fastify' {
  interface FastifyRequest {
    user?: admin.auth.DecodedIdToken;
  }
}

// Authentication Middleware
export default async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized: Invalid token format' });
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    request.user = decodedToken; // Attach user data to the request

    console.log('✅ Authenticated User:', decodedToken.email);
  } catch (error: any) {
    console.error('❌ Authentication Error:', error.message);
    return reply.status(401).send({ error: 'Unauthorized: Invalid or expired token' });
  }
}
