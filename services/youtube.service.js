import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {config} from "dotenv";
import getVideoId from "youtube-video-id"
import { prisma } from "../lib/prisma.js";
import { Innertube } from "youtubei.js";

config();
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(
  "youtube-video-transcripts"
);

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  model: "gemini-2.5-flash-lite",
  temperature: 0.1,
});

export const processVideoService = async (videoUrl,userId) => {

  const videoId =
      getVideoId(videoUrl);

  const namespace = `${userId}-${videoId}`;
  const existingVideo= await prisma.video.findUnique({
    where:{
      namespace
    }
  })

  if(existingVideo){
    return existingVideo;
  }    

  const youtube = await Innertube.create()
   const info =
      await youtube.getInfo(videoId);

    const title =
      info.basic_info.title;

    const thumbnail =
      info.basic_info.thumbnail?.[0]
        ?.url;

  const transcriptArr =
    await YoutubeTranscript.fetchTranscript(
      videoUrl,
      {
        lang: "en",
      }
    );

  const transcript = transcriptArr
    .map((item) => item.text)
    .join("\n");

  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

  const docs =
    await splitter.createDocuments([
      transcript,
    ]);

    const updateDocs = 
    docs.map((doc, index) => {
      doc.metadata = {
          userId,
          videoId,
          videoUrl,
          chunkIndex: index,
        };

        return doc;
    });

    // console.log(updateDocs)

  await PineconeStore.fromDocuments(
    updateDocs,
    embeddings,
    {
      pineconeIndex,
      namespace
    }
  );

  const saveVideo=
    await prisma.video.create({
          data: {
            userId,
            videoId,
            videoUrl,
            transcript,
            title,
            thumbnail,
            namespace,
            totalChunks:
              updateDocs.length,
          },
      });

    return saveVideo;
};

export const askQuestionService = async (question,userId,videoId) => {

  const namespace = `${userId}-${videoId}`;

  const vectorStore =
    await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex,
        namespace
      }
    );

  const results =
    await vectorStore.similaritySearch(
      question,
      5
    );

  const context = results
    .map((doc) => doc.pageContent)
    .join("\n");

  const response = await llm.invoke(`
You are a helpful AI assistant.

Answer only from the provided context.

Context:
${context}

Question:
${question}
`);

  return response.content;
};

export const deleteVideoService =
  async (
    userId,
    videoId
  ) => {

    try {

      const namespace =
        `${userId}-${videoId}`;

      // console.log(namespace);

      await pineconeIndex
        .namespace(namespace)
        .deleteAll();

      await prisma.video.delete({
        where: {
          userId_videoId:{
            userId,
            videoId
          },
        },
      });
      return true;

    } catch (error) {

      // console.log(error);

      throw new Error(
        "Video delete failed"
      );
    }
};