-- Drop FK to allow renaming users table
ALTER TABLE "apiKeys" DROP CONSTRAINT "apiKeys_userId_fkey";

-- Rename users table to user
ALTER TABLE "users" RENAME TO "user";

-- Rename indexes to match new table name (optional but keeps schema clean)
ALTER INDEX "users_email_key" RENAME TO "user_email_key";
ALTER INDEX "users_googleId_key" RENAME TO "user_googleId_key";
ALTER INDEX "users_githubId_key" RENAME TO "user_githubId_key";

-- Create profile table
CREATE TABLE "profile" (
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" VARCHAR(2048) NOT NULL DEFAULT '/avatars/default.png',
    "bio" VARCHAR(255) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("userId")
);

-- Backfill profile from existing users.name
INSERT INTO "profile" ("userId", "name", "avatarUrl", "bio")
SELECT "id", "name", '/avatars/avatar_default.png', ''
FROM "user";

-- Drop name column from user (now stored in profile)
ALTER TABLE "user" DROP COLUMN "name";

-- Recreate FK from apiKeys to user
ALTER TABLE "apiKeys" ADD CONSTRAINT "apiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add FK from profile to user
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
