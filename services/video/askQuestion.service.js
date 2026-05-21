import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../ai/embeddings.js";
import { pineconeIndex } from "../ai/pinecone.js";
import { llm } from "../ai/llm.js";

export const askQuestionService =async (question,userId,videoId) => {

    const namespace =`${userId}-${videoId}`;

    const vectorStore =await PineconeStore.fromExistingIndex(
          embeddings,
          {
            pineconeIndex,
            namespace,
          }
        );

    const results =await vectorStore.similaritySearch(question,5);

    const context =results.map((doc) => doc.pageContent).join("\n");

    const response =await llm.invoke(`
            You are a helpful AI assistant.

            Answer only from the provided context.

            Context:
            ${context}

            Question:
            ${question}
            `);

    return response.content;
};