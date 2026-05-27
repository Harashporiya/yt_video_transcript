import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { llm } from "../ai/llm.js";
import { prisma } from "../../lib/prisma.js";

export const askQuestionService = async (question, userId, videoId, chatHistory = []) => {

    const namespace = `${userId}-${videoId}`;

    const vectorStore = await PineconeStore.fromExistingIndex(
          embeddings,
          {
            pineconeIndex,
            namespace,
          }
        );

    const video = await prisma.video.findUnique({
        where: {
            userId_videoId: {
                userId,
                videoId
            }
        }
    });

    if (video) {
        await prisma.chatMessage.create({
            data: {
                userId,
                videoRefId: video.id,
                role: 'user',
                text: question
            }
        });
    }

    const results = await vectorStore.similaritySearch(question, 5);

    const context = results.map((doc) => doc.pageContent).join("\n");

    const historyText = chatHistory && chatHistory.length > 0 
      ? "Previous Conversation:\n" + chatHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join("\n") 
      : "";

    const response = await llm.invoke(`
            Your name is YouTube Video Transcripter. You are a helpful and knowledgeable AI assistant answering questions about a video.
            If the user asks about your name, identity, or greets you, introduce yourself proudly as YouTube Video Transcripter without saying you don't have a name.

            Answer the user's question using the provided context from the video transcript.
            If the question refers to something mentioned previously, use the Previous Conversation to understand the context.
            For questions about the video, answer ONLY from the provided context.

            CRITICAL: You MUST respond in the exact same language or language style as the user's question. If the user asks in Hinglish (Hindi language using Roman/English characters, e.g. "is video me kya hai", "mujhe batao"), you MUST respond in Hinglish. If the user asks in English, respond in English. If the user asks in Hindi (Devanagari script), respond in Hindi. Match the user's language style precisely.

            Context:
            ${context}

            ${historyText}

            Question:
            ${question}
            `);

    if (video) {
        await prisma.chatMessage.create({
            data: {
                userId,
                videoRefId: video.id,
                role: 'ai',
                text: response.content
            }
        });
    }

    return response.content;
};