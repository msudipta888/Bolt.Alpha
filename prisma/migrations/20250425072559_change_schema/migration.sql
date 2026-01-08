/*
  Warnings:

  - You are about to drop the `AiChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserChat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_id_fkey";

-- DropTable
DROP TABLE "AiChat";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "UserChat";

-- CreateTable
CREATE TABLE "chatMessage" (
    "id" SERIAL NOT NULL,
    "messages" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatMessage_pkey" PRIMARY KEY ("id")
);
