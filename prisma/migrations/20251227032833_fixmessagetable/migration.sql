/*
  Warnings:

  - You are about to drop the column `chatId` on the `FileReader` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `FileReader` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Message` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `FileReader` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FileReader" DROP CONSTRAINT "FileReader_chatId_fkey";

-- DropForeignKey
ALTER TABLE "FileReader" DROP CONSTRAINT "FileReader_messageId_fkey";

-- DropIndex
DROP INDEX "FileReader_messageId_chatId_idx";

-- AlterTable
ALTER TABLE "FileReader" DROP COLUMN "chatId",
DROP COLUMN "messageId",
ADD COLUMN     "fileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
DROP COLUMN "role",
ADD COLUMN     "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "messageId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "RoleType";

-- CreateTable
CREATE TABLE "UserChat" (
    "id" TEXT NOT NULL,
    "userChatId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChat" (
    "id" TEXT NOT NULL,
    "AiChatId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "AiChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileReader_fileId_idx" ON "FileReader"("fileId");

-- CreateIndex
CREATE INDEX "Message_messageId_createdTime_idx" ON "Message"("messageId", "createdTime");

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userChatId_fkey" FOREIGN KEY ("userChatId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChat" ADD CONSTRAINT "AiChat_AiChatId_fkey" FOREIGN KEY ("AiChatId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileReader" ADD CONSTRAINT "FileReader_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
