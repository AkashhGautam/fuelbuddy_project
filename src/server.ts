import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { initializeFirebase } from './config/firebaseConfig';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeFirebase();

// Fastify Server Setup
const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(fastifyCors);

// Register Routes
fastify.register(userRoutes, { prefix: '/users' });

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('🚀 Server running on http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
