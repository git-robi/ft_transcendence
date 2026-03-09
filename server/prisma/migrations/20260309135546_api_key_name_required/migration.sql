/*
  Warnings:

  - Made the column `name` on table `apiKeys` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "apiKeys" ALTER COLUMN "name" SET NOT NULL;
