/*
  Warnings:

  - The primary key for the `chatMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "chatMessage" DROP CONSTRAINT "chatMessage_pkey",
ADD COLUMN     "files" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "chatMessage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "chatMessage_id_seq";
