// import getVideoId from "youtube-video-id";
// import { prisma } from "../../lib/prisma.js";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { PineconeStore } from "@langchain/pinecone";
// import { embeddings } from "../ai/embeddings.js";
// import { pineconeIndex } from "../ai/pinecone.js";
// import { getTranscript } from "../../utils/transcript.util.js";
// import { getYoutubeVideoInfo } from "../../utils/youtube.util.js";
// import { generateSummary } from "./summary.service.js";

// export const processVideoService = async (videoUrl, userId) => {

//   const videoId = getVideoId(videoUrl);

//   const namespace = `${userId}-${videoId}`;

//   const existingVideo = await prisma.video.findUnique({
//     where: {
//       namespace,
//     },
//     include: {
//       summaries: true,
//     },
//   });

//   if (existingVideo) {
//     return existingVideo;
//   }

//   const { title, thumbnail } = await getYoutubeVideoInfo(videoId);

//   const transcript = await getTranscript(videoUrl);

//   const parsedSummary = await generateSummary(transcript);

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 3000,
//     chunkOverlap: 300,
//   });

//   const docs = await splitter.createDocuments([
//     transcript,
//   ]);

//   const updateDocs = docs.map((doc, index) => {
//     doc.metadata = {
//       userId,
//       videoId,
//       videoUrl,
//       chunkIndex: index,
//     };

//     return doc;
//   });

//   await PineconeStore.fromDocuments(
//     updateDocs,
//     embeddings,
//     {
//       pineconeIndex,
//       namespace,
//     }
//   );

//   const saveVideo = await prisma.video.create({
//     data: {
//       userId,
//       videoId,
//       videoUrl,
//       title,
//       thumbnail,
//       namespace,
//       totalChunks:
//         updateDocs.length,
//     },
//   });

//   await prisma.videoSummary.create({
//     data: {
//       userId,
//       videoRefId: saveVideo.id,
//       shortSummary: parsedSummary.shortSummary,
//       longSummary: parsedSummary.longSummary,
//       keypointSummary: JSON.stringify(parsedSummary.keypointSummary),
//     },
//   });

//   return saveVideo;
// };

import getVideoId from "youtube-video-id";
import { prisma } from "../../lib/prisma.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { getTranscript } from "../../utils/transcript.util.js";
import { getYoutubeVideoInfo } from "../../utils/youtube.util.js";
import { generateSummary } from "./summary.service.js";

export const processVideoService = async (videoUrl, userId) => {
  const videoId = getVideoId(videoUrl);
  const namespace = `${userId}-${videoId}`;

  // Return early if already processed
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

  // Split transcript into chunks
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

  // ✅ Step 1: Manually embed all chunks
  const texts = updatedDocs.map((doc) => doc.pageContent);
  const embeddingVectors = await embeddings.embedDocuments(texts);

  // ✅ Step 2: Validate every vector before touching Pinecone
  const validVectors = [];
  let skippedCount = 0;

  for (let i = 0; i < embeddingVectors.length; i++) {
    const vec = embeddingVectors[i];

    if (!vec || vec.length === 0) {
      console.warn(`[ProcessVideo] ⚠️ Skipping chunk ${i} — empty embedding returned`);
      skippedCount++;
      continue;
    }

    validVectors.push({
      id: `${namespace}-chunk-${i}`,
      values: vec,
      metadata: {
        ...updatedDocs[i].metadata,
        text: updatedDocs[i].pageContent, // store text in metadata for retrieval
      },
    });
  }

  console.log(
    `[ProcessVideo] Valid vectors: ${validVectors.length}, Skipped: ${skippedCount}`
  );

  if (validVectors.length === 0) {
    throw new Error(
      "All embeddings failed — no valid vectors to upsert. Try again or use a shorter video."
    );
  }

  // ✅ Step 3: Upsert to Pinecone in safe batches of 100
  const PINECONE_BATCH = 100;
  for (let i = 0; i < validVectors.length; i += PINECONE_BATCH) {
    const batch = validVectors.slice(i, i + PINECONE_BATCH);
    console.log(
      `[ProcessVideo] Upserting Pinecone batch ${Math.floor(i / PINECONE_BATCH) + 1}/${Math.ceil(validVectors.length / PINECONE_BATCH)}...`
    );
    await pineconeIndex.namespace(namespace).upsert(batch);
  }

  console.log(`[ProcessVideo] ✅ Pinecone upsert complete.`);

  // ✅ Step 4: Save to DB
  const saveVideo = await prisma.video.create({
    data: {
      userId,
      videoId,
      videoUrl,
      title,
      thumbnail,
      namespace,
      totalChunks: validVectors.length,
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