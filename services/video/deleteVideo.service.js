import { prisma } from "../../lib/prisma.js";
import { pineconeIndex } from "../ai/pinecone.js";

export const deleteVideoService =async (userId,videoId) => {

    const namespace =`${userId}-${videoId}`;

    await pineconeIndex.namespace(namespace).deleteAll();

    const video =await prisma.video.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

    if (!video) {
      throw new Error(
        "Video not found"
      );
    }

    await prisma.videoSummary.deleteMany({
      where: {
        videoRefId: video.id,
      },
    });

    await prisma.videoQuestion.deleteMany({
      where: {
        videoRefId: video.id,
      },
    });

    await prisma.video.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    return true;
};