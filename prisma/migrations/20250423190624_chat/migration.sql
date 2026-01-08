/*
  Warnings:

  - The primary key for the `userchat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chat` on the `userchat` table. All the data in the column will be lost.
  - The required column `id` was added to the `userchat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "userchat" DROP CONSTRAINT "userchat_pkey",
DROP COLUMN "chat",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "messages" TEXT[],
ADD CONSTRAINT "userchat_pkey" PRIMARY KEY ("id");
