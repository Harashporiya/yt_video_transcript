/*
  Warnings:

  - Changed the type of `keypointSummary` on the `VideoSummary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VideoSummary" DROP COLUMN "keypointSummary",
ADD COLUMN     "keypointSummary" JSONB NOT NULL;
