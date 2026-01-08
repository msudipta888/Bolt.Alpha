-- AlterTable
ALTER TABLE "Aichat" ADD CONSTRAINT "Aichat_pkey" PRIMARY KEY ("userid");

-- DropIndex
DROP INDEX "Aichat_userid_key";

-- AlterTable
ALTER TABLE "userchat" ADD CONSTRAINT "userchat_pkey" PRIMARY KEY ("userId");

-- DropIndex
DROP INDEX "userchat_userId_key";
