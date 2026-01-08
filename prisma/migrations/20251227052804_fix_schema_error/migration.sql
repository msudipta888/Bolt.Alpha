/*
  Warnings:

  - You are about to drop the column `titles` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `title` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AiChat" DROP CONSTRAINT "AiChat_AiChatId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "FileReader" DROP CONSTRAINT "FileReader_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_userChatId_fkey";

-- DropIndex
DROP INDEX "Message_messageId_createdTime_idx";

-- DropIndex
DROP INDEX "Message_messageId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "titles",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageId";

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Message_id_createdTime_idx" ON "Message"("id", "createdTime");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userChatId_fkey" FOREIGN KEY ("userChatId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChat" ADD CONSTRAINT "AiChat_AiChatId_fkey" FOREIGN KEY ("AiChatId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileReader" ADD CONSTRAINT "FileReader_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
