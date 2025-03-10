import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

export default async function userRoutes(fastify: FastifyInstance) {

  fastify.post('/login', userController.loginUser);

  fastify.post('/', { preHandler: authMiddleware }, userController.createUser);
  fastify.get('/', { preHandler: authMiddleware }, userController.getUsers);
  fastify.get('/:id', { preHandler: authMiddleware }, userController.getUserById);
  fastify.put('/:id', { preHandler: authMiddleware }, userController.updateUser);
  fastify.delete('/:id', { preHandler: authMiddleware }, userController.deleteUser);
}
