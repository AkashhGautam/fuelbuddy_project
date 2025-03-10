import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

if (!FIREBASE_API_KEY) {
  throw new Error('❌ FIREBASE_API_KEY is missing in .env file');
}

// Function to get Firebase Authentication Token
export async function getFirebaseToken(email: string, password: string) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return {
      idToken: response.data.idToken, // Access Token
      refreshToken: response.data.refreshToken, // Token for refreshing
      expiresIn: response.data.expiresIn, // Expiry time in seconds
    };
  } catch (error: any) {
    console.error('❌ Error getting Firebase token:', error.response?.data || error.message);
    throw new Error('Failed to get Firebase authentication token');
  }
}

// Function to Refresh Firebase Token
export async function refreshFirebaseToken(refreshToken: string) {
  try {
    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return {
      idToken: response.data.id_token, // New Access Token
      refreshToken: response.data.refresh_token, // New Refresh Token
      expiresIn: response.data.expires_in, // Expiry time in seconds
    };
  } catch (error: any) {
    console.error('❌ Error refreshing Firebase token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Firebase token');
  }
}
