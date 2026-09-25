import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { prisma } from "../../lib/prisma.js";
import { graph } from "../ai/graph.js";

const HISTORY_LENGTH = 6;

export const askQuestionService = async (question, userId, video) => {

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: video.namespace,
    });

    // History comes from the database, not the client, so it can't be forged
    const recentMessages = await prisma.chatMessage.findMany({
        where: { videoRefId: video.id },
        orderBy: { createdAt: "desc" },
        take: HISTORY_LENGTH,
        select: { role: true, text: true },
    });
    const chatHistory = recentMessages.reverse();

    const result = await graph.invoke(
        { question, chatHistory },
        {
            configurable: { vectorStore },
        }
    );

    const { intent, answer } = result;

    console.log(`[AskQuestion] Intent="${intent}" | Answer length=${answer?.length}`);

    // Distinct timestamps keep the question ordered before its answer
    const askedAt = new Date();
    await prisma.chatMessage.createMany({
        data: [
            { userId, videoRefId: video.id, role: "user", text: question, createdAt: askedAt },
            { userId, videoRefId: video.id, role: "ai", text: answer, createdAt: new Date(askedAt.getTime() + 1) },
        ],
    });

    return answer;
};
