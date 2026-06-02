import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { prisma } from "../../lib/prisma.js";
import { graph } from "../ai/graph.js";

export const askQuestionService = async (question, userId, videoId, chatHistory = []) => {

    const namespace = `${userId}-${videoId}`;


    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace,
    });


    const videoPromise = prisma.video.findUnique({
        where: { userId_videoId: { userId, videoId } }
    });

    const result = await graph.invoke(
        { question, chatHistory },
        {
            configurable: { vectorStore },
        }
    );

    const { intent, answer } = result;

    console.log(`[AskQuestion] Intent="${intent}" | Answer length=${answer?.length}`);


    const video = await videoPromise;
    if (video) {
        await prisma.chatMessage.createMany({
            data: [
                { userId, videoRefId: video.id, role: "user", text: question },
                { userId, videoRefId: video.id, role: "ai", text: answer },
            ],
        });
    }

    return answer;
};