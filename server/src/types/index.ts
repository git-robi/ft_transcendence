import { users } from '../prisma/generated/prisma/client';

// Export the full Prisma user type
export type User = users;

// Export a sanitized user type (without password) for API responses
export type UserResponse = Omit<User, 'password'>;

// Export a public user type (only what frontend needs)
export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
