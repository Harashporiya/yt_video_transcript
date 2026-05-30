import getVideoId from "youtube-video-id";
import { prisma } from "../../lib/prisma.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { getTranscript } from "../../utils/transcript.util.js";
import { getYoutubeVideoInfo } from "../../utils/youtube.util.js";
import { generateSummary } from "./summary.service.js";

export const processVideoService = async (videoUrl, userId) => {
  const videoId = getVideoId(videoUrl);
  const namespace = `${userId}-${videoId}`;

  const existingVideo = await prisma.video.findUnique({
    where: { namespace },
    include: { summaries: true },
  });

  if (existingVideo) {
    return existingVideo;
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

  // Embed and upsert to Pinecone
  await PineconeStore.fromDocuments(updatedDocs, embeddings, {
    pineconeIndex,
    namespace,
  });

  console.log(`[ProcessVideo] ✅ Pinecone upsert complete.`);

  // Save video and summary to DB
  const saveVideo = await prisma.video.create({
    data: {
      userId,
      videoId,
      videoUrl,
      title,
      thumbnail,
      namespace,
      totalChunks: updatedDocs.length,
    },
  });

  await prisma.videoSummary.create({
    data: {
      userId,
      videoRefId: saveVideo.id,
      shortSummary: parsedSummary.shortSummary,
      longSummary: parsedSummary.longSummary,
      keypointSummary: JSON.stringify(parsedSummary.keypointSummary),
    },
  });

  return saveVideo;
};