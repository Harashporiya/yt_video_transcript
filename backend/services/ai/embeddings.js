// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// export const embeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey:process.env.GOOGLE_GEMINI_API_KEY,
//     model: "gemini-embedding-001",
// });

export const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
});