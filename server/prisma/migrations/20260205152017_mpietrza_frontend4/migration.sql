/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "profile" (
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" VARCHAR(2048) NOT NULL DEFAULT '/avatars/avatar_default.png',
    "bio" VARCHAR(255) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
