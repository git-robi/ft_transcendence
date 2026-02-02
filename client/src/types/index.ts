// This file contains types that match the backend Prisma schema
// Keep this in sync with server/prisma/schema.prisma

export interface User {
  id: number;
  email: string;
  name: string;
  googleId?: string | null;
  githubId?: string | null;
  password: string;
  createdAt: Date;
}

// Type for user data returned from API (without password)
export type UserResponse = Omit<User, 'password'>;

// Type for public user info (what login/register returns)
export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface ApiKey {
  id: number;
  userId: number;
  name?: string | null;
  createdAt: Date;
  expiresAt?: Date | null;
  hashedKey: string;
}
