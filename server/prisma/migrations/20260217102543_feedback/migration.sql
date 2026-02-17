/*
  Warnings:

  - Made the column `bio` on table `profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "bio" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
