/*
  Warnings:

  - You are about to drop the `Aichat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userchat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Aichat" DROP CONSTRAINT "Aichat_userid_fkey";

-- DropForeignKey
ALTER TABLE "userchat" DROP CONSTRAINT "userchat_userId_fkey";

-- DropTable
DROP TABLE "Aichat";

-- DropTable
DROP TABLE "userchat";

-- CreateTable
CREATE TABLE "UserChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChat" (
    "userid" TEXT NOT NULL,
    "chat" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChat_pkey" PRIMARY KEY ("userid")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChat_userId_key" ON "UserChat"("userId");

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChat" ADD CONSTRAINT "AiChat_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
