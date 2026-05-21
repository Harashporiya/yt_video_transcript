-- CreateTable
CREATE TABLE "VideoQuestion" (
    "id" TEXT NOT NULL,
    "videoRefId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easyQuestions" JSONB NOT NULL,
    "mediumQuestions" JSONB NOT NULL,
    "hardQuestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoQuestion_userId_idx" ON "VideoQuestion"("userId");

-- CreateIndex
CREATE INDEX "VideoQuestion_videoRefId_idx" ON "VideoQuestion"("videoRefId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoQuestion_userId_videoRefId_key" ON "VideoQuestion"("userId", "videoRefId");

-- AddForeignKey
ALTER TABLE "VideoQuestion" ADD CONSTRAINT "VideoQuestion_videoRefId_fkey" FOREIGN KEY ("videoRefId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoQuestion" ADD CONSTRAINT "VideoQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
