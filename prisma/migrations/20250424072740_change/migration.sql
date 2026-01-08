/*
  Warnings:

  - You are about to drop the column `messages` on the `UserChat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserChat" DROP COLUMN "messages";

-- CreateTable
CREATE TABLE "Message" (
    "chatId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("chatId")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_id_fkey" FOREIGN KEY ("id") REFERENCES "UserChat"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
