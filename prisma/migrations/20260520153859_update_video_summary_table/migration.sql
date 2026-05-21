/*
  Warnings:

  - You are about to drop the column `transcript` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "transcript";

-- CreateTable
CREATE TABLE "VideoSummary" (
    "id" TEXT NOT NULL,
    "videoRefId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shortSummary" TEXT NOT NULL,
    "longSummary" TEXT NOT NULL,
    "keypointSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSummary_userId_idx" ON "VideoSummary"("userId");

-- CreateIndex
CREATE INDEX "VideoSummary_videoRefId_idx" ON "VideoSummary"("videoRefId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSummary_userId_videoRefId_key" ON "VideoSummary"("userId", "videoRefId");

-- AddForeignKey
ALTER TABLE "VideoSummary" ADD CONSTRAINT "VideoSummary_videoRefId_fkey" FOREIGN KEY ("videoRefId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSummary" ADD CONSTRAINT "VideoSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
