/*
  Warnings:

  - Changed the type of `content` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropEnum
DROP TYPE "contentType";
