/*
  Warnings:

  - The primary key for the `UserChat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserChat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiChat" DROP CONSTRAINT "AiChat_userid_fkey";

-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_userId_fkey";

-- DropIndex
DROP INDEX "UserChat_userId_key";

-- AlterTable
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserChat_pkey" PRIMARY KEY ("userId");
