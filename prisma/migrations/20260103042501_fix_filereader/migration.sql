/*
  Warnings:

  - The `path` column on the `FileReader` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `content` on the `FileReader` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FileReader" DROP COLUMN "path",
ADD COLUMN     "path" TEXT[],
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
