import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HASURA_URL = process.env.HASURA_URL;
const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Axios Instance with Hasura Headers
const hasuraClient = axios.create({
  baseURL: HASURA_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': ADMIN_SECRET as string,
  },
});

// 🟢 Create User
export async function createUser(email: string, name: string) {
  try {
    const mutation = {
      query: `
        mutation ($email: String!, $name: String!) {
          insert_users(objects: { email: $email, name: $name }) {
            returning { id, email, name }
          }
        }
      `,
      variables: { email, name },
    };

    const response = await hasuraClient.post('', mutation);

    // ✅ Check if Hasura returned errors
    if (response.data.errors) {
      console.error('❌ Hasura Error:', response.data.errors);
      throw new Error(response.data.errors[0].message || 'Failed to create user');
    }

    // ✅ Check if response contains expected data
    if (!response.data.data || !response.data.data.insert_users) {
      throw new Error('Unexpected Hasura response format');
    }

    return response.data.data.insert_users.returning[0];
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    throw new Error(error.message || 'Failed to create user');
  }
}


// 🟢 Get All Users
export async function getUsers() {
  try {
    const query = {
      query: `{
        users { id, name, email }
      }`,
    };

    const response = await hasuraClient.post('', query);
    return response.data.data.users;
  } catch (error: any) {
    console.error('❌ Error fetching users:', error.message);
    throw new Error('Failed to fetch users');
  }
}

// 🟢 Get User by ID
export async function getUserById(id: string) {
  try {
    const query = {
      query: `
        query ($id: uuid!) {
          users_by_pk(id: $id) { id, name, email }
        }
      `,
      variables: { id },
    };

    const response = await hasuraClient.post('', query);
    return response.data.data.users_by_pk;
  } catch (error: any) {
    console.error('❌ Error fetching user:', error.message);
    throw new Error('Failed to fetch user');
  }
}

// 🟢 Update User
export async function updateUser(id: string, user: { name?: string; email?: string }) {
  try {
    const mutation = {
      query: `
        mutation ($id: uuid!, $name: String, $email: String) {
          update_users_by_pk(pk_columns: { id: $id }, _set: { name: $name, email: $email }) {
            id, name, email
          }
        }
      `,
      variables: { id, ...user },
    };

    const response = await hasuraClient.post('', mutation);
    return response.data.data.update_users_by_pk;
  } catch (error: any) {
    console.error('❌ Error updating user:', error.message);
    throw new Error('Failed to update user');
  }
}

// 🟢 Delete User
export async function deleteUser(id: string) {
  try {
    const mutation = {
      query: `
        mutation ($id: uuid!) {
          delete_users_by_pk(id: $id) { id }
        }
      `,
      variables: { id },
    };

    const response = await hasuraClient.post('', mutation);
    return response.data.data.delete_users_by_pk;
  } catch (error: any) {
    console.error('❌ Error deleting user:', error.message);
    throw new Error('Failed to delete user');
  }
}
