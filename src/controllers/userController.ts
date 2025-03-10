import { FastifyRequest, FastifyReply } from 'fastify';
import * as hasuraService from '../services/hasuraService';

// Create User

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Get data from the request body instead of Firebase token
    const { email, name } = request.body as { email?: string; name?: string };

    if (!email || !name) {
      return reply.status(400).send({ error: 'Invalid request: Missing email or name' });
    }

    // Call Hasura service to create the user
    const user = await hasuraService.createUser(email, name);
    return reply.send(user);
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    return reply.status(500).send({ error: 'Failed to create user' });
  }
}



// Get All Users
export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await hasuraService.getUsers();
    return reply.send(users);
  } catch (error: any) {
    console.error('❌ Error fetching users:', error.message);
    return reply.status(500).send({ error: 'Failed to fetch users' });
  }
}

// Get User by ID
export async function getUserById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Invalid request: Missing user ID' });

    const user = await hasuraService.getUserById(id);
    if (!user) return reply.status(404).send({ error: 'User not found' });

    return reply.send(user);
  } catch (error: any) {
    console.error('❌ Error fetching user:', error.message);
    return reply.status(500).send({ error: 'Failed to fetch user' });
  }
}

// Update User
export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Invalid request: Missing user ID' });

    const { name, email } = request.body as { name?: string; email?: string };
    if (!name && !email) {
      return reply.status(400).send({ error: 'Invalid request: No fields to update' });
    }

    const updatedUser = await hasuraService.updateUser(id, { name, email });
    return reply.send(updatedUser);
  } catch (error: any) {
    console.error('❌ Error updating user:', error.message);
    return reply.status(500).send({ error: 'Failed to update user' });
  }
}

// Delete User
export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Invalid request: Missing user ID' });

    await hasuraService.deleteUser(id);
    return reply.send({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting user:', error.message);
    return reply.status(500).send({ error: 'Failed to delete user' });
  }
}
