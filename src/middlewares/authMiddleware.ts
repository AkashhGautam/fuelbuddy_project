import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import * as firebaseService from '../services/firebaseService';

dotenv.config();

// Extend FastifyRequest to include user data
declare module 'fastify' {
  interface FastifyRequest {
    user?: admin.auth.DecodedIdToken;
  }
}

export default async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('🔑 Checking authentication...');
    let token = request.cookies.idToken;

    // Check for token in Authorization header if not in cookies
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized: No token provided' });
    }

    // Decode the token (without verifying) to check expiration
    const decodedToken = jwt.decode(token) as { exp: number } | null;

    if (!decodedToken || !decodedToken.exp) {
      return reply.status(401).send({ error: 'Unauthorized: Invalid token format' });
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // Token expired? Try refreshing
    if (decodedToken.exp < currentTime) {
      console.log('🔑 Token expired. Attempting to refresh...');

      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send({ error: 'Unauthorized: No refresh token provided' });
      }

      try {
        // Refresh Firebase token
        const tokenData = await firebaseService.refreshFirebaseToken(refreshToken);

        // Set new tokens in cookies
        reply.setCookie('idToken', tokenData.idToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: tokenData.expiresIn,
        });

        reply.setCookie('refreshToken', tokenData.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        console.log('✅ Token refreshed successfully');
        token = tokenData.idToken; // Use new ID token
      } catch (refreshError) {
        console.error('❌ Error refreshing token:', refreshError);
        return reply.status(401).send({ error: 'Unauthorized: Failed to refresh token' });
      }
    }

    // Ensure token is a string before verifying
    if (typeof token !== 'string') {
      return reply.status(401).send({ error: 'Unauthorized: Invalid token format' });
    }

    // Verify the valid (or refreshed) ID token with Firebase
    const verifiedToken = await admin.auth().verifyIdToken(token);
    request.user = verifiedToken; // Attach user data to request

    console.log('✅ Authenticated User:', verifiedToken.email);
  } catch (error: any) {
    console.error('❌ Authentication Error:', error.message);
    return reply.status(401).send({ error: 'Unauthorized: Invalid or expired token' });
  }
}