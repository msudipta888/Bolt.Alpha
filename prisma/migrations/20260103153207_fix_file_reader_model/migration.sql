/*
  Warnings:

  - Added the required column `fullPath` to the `FileReader` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileReader" ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fullPath" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FileReader_fullPath_idx" ON "FileReader"("fullPath");
