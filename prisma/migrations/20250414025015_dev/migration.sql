/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userid` on the `Aichat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `userchat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Aichat" DROP CONSTRAINT "Aichat_userid_fkey";

-- DropForeignKey
ALTER TABLE "userchat" DROP CONSTRAINT "userchat_userId_fkey";

-- AlterTable
ALTER TABLE "Aichat" DROP COLUMN "userid",
ADD COLUMN     "userid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "userchat" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Aichat_userid_key" ON "Aichat"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "userchat_userId_key" ON "userchat"("userId");

-- AddForeignKey
ALTER TABLE "userchat" ADD CONSTRAINT "userchat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aichat" ADD CONSTRAINT "Aichat_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
