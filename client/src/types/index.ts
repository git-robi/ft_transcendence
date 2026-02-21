// Shared data types — one source of truth for the frontend

export interface User {
  id: number;
  email: string;
  name: string;
  googleId?: string | null;
  githubId?: string | null;
  password: string;
  createdAt: Date;
}

export type UserResponse = Omit<User, 'password'>;

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface ApiKey {
  id: number;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  hashedKey: string;
}

export interface Match {
  id: number;
  userId: number;
  guestName: string | null;
  userScore: number;
  opponentScore: number;
  status: string;
  winPoints: number;
  playMode: 'AI' | 'LOCAL';
  aiLevel: 'EASY' | 'MID' | 'HARD';
  paddle: 'LEFT' | 'RIGHT';
}

export interface MatchResult {
  winnerName: string;
  userScore: number;
  opponentScore: number;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  avatarUrl: string;
  level: number;
  wins: number;
  gamesPlayed: number;
  winRate: number;
}

export interface ProfileData {
  userId: number;
  name: string;
  avatarUrl: string;
  bio: string;
  level: number;
  xp: number;
}

export interface StatsData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  rank: number;
  achievements: { id: number; type: string; unlockedAt: string }[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'opponent';
}
