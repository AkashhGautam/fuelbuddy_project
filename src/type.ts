import { FastifyRequest } from 'fastify';

export interface UserRequestBody {
  name: string;
  email: string;
}

export type UserRequest = FastifyRequest<{ Body: UserRequestBody }>;
