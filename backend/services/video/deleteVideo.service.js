import { prisma } from "../../lib/prisma.js";
import { pineconeIndex } from "../ai/pinecone.js";

// Returns false when the video doesn't exist.
export const deleteVideoService = async (userId, videoId) => {

    const namespace = `${userId}-${videoId}`;

    // Summary, questions and chat messages are removed by the cascade
    const { count } = await prisma.video.deleteMany({
      where: { userId, videoId },
    });

    if (count === 0) {
      return false;
    }

    try {
      await pineconeIndex.namespace(namespace).deleteAll();
    } catch (error) {
      // The video is already gone for the user; leftover vectors are overwritten if it is processed again
      console.error(`[DeleteVideo] Failed to delete Pinecone namespace ${namespace}:`, error);
    }

    return true;
};
