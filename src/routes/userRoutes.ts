import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', userController.createUser);
  fastify.get('/', userController.getUsers);
  fastify.get('/:id', userController.getUserById);
  fastify.put('/:id', userController.updateUser);
  fastify.delete('/:id', userController.deleteUser);
}
