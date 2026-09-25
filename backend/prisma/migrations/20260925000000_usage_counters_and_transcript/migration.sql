-- AlterTable
ALTER TABLE "User" ADD COLUMN     "videosUsedTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "chatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transcript" TEXT;

-- Backfill counters from existing rows
UPDATE "User" u SET "videosUsedTotal" = (SELECT COUNT(*) FROM "Video" v WHERE v."userId" = u."id");
UPDATE "Video" v SET "chatCount" = (SELECT COUNT(*) FROM "ChatMessage" c WHERE c."videoRefId" = v."id" AND c."role" = 'user');

-- Unwrap JSON values that were stored as JSON.stringify'd strings
UPDATE "VideoSummary" SET "keypointSummary" = ("keypointSummary" #>> '{}')::jsonb WHERE jsonb_typeof("keypointSummary") = 'string';
UPDATE "VideoQuestion" SET "easyQuestions" = ("easyQuestions" #>> '{}')::jsonb WHERE jsonb_typeof("easyQuestions") = 'string';
UPDATE "VideoQuestion" SET "mediumQuestions" = ("mediumQuestions" #>> '{}')::jsonb WHERE jsonb_typeof("mediumQuestions") = 'string';
UPDATE "VideoQuestion" SET "hardQuestions" = ("hardQuestions" #>> '{}')::jsonb WHERE jsonb_typeof("hardQuestions") = 'string';
