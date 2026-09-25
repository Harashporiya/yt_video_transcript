import { prisma } from "../../lib/prisma.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { getTranscript } from "../../utils/transcript.util.js";
import { getYoutubeVideoInfo } from "../../utils/youtube.util.js";
import { generateSummary } from "./summary.service.js";

// Returns { video, created }. created is false when the video already existed.
export const processVideoService = async (videoUrl, videoId, userId) => {
  const namespace = `${userId}-${videoId}`;

  const existingVideo = await prisma.video.findUnique({ where: { namespace } });
  if (existingVideo) {
    return { video: existingVideo, created: false };
  }

  const { title, thumbnail } = await getYoutubeVideoInfo(videoId);
  const transcript = await getTranscript(videoUrl);

  const parsedSummary = await generateSummary(transcript);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3000,
    chunkOverlap: 300,
  });

  const docs = await splitter.createDocuments([transcript]);

  const updatedDocs = docs.map((doc, index) => {
    doc.metadata = { userId, videoId, videoUrl, chunkIndex: index };
    return doc;
  });

  console.log(`[ProcessVideo] Total chunks to embed: ${updatedDocs.length}`);

  // Deterministic ids so a retried or concurrent run overwrites vectors instead of duplicating them
  const vectorStore = new PineconeStore(embeddings, { pineconeIndex, namespace });
  try {
    await vectorStore.addDocuments(updatedDocs, {
      ids: updatedDocs.map((_, index) => `${namespace}-${index}`),
    });
  } catch (error) {
    // Remove any batches that were uploaded before the failure
    await pineconeIndex.namespace(namespace).deleteAll().catch((cleanupError) => {
      console.error(`[ProcessVideo] Failed to clean up Pinecone namespace ${namespace}:`, cleanupError);
    });
    throw error;
  }

  console.log(`[ProcessVideo] ✅ Pinecone upsert complete.`);

  try {
    // Video and summary are created together so a video can never exist without its summary
    const video = await prisma.video.create({
      data: {
        userId,
        videoId,
        videoUrl,
        title,
        thumbnail,
        namespace,
        transcript,
        totalChunks: updatedDocs.length,
        summaries: {
          create: {
            userId,
            shortSummary: parsedSummary.shortSummary,
            longSummary: parsedSummary.longSummary,
            keypointSummary: parsedSummary.keypointSummary,
          },
        },
      },
    });
    return { video, created: true };
  } catch (error) {
    if (error.code === "P2002") {
      // A concurrent request saved this video first; its vectors are the same as ours
      const video = await prisma.video.findUnique({ where: { namespace } });
      return { video, created: false };
    }
    await pineconeIndex.namespace(namespace).deleteAll().catch((cleanupError) => {
      console.error(`[ProcessVideo] Failed to clean up Pinecone namespace ${namespace}:`, cleanupError);
    });
    throw error;
  }
};
