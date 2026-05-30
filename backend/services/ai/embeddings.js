import "dotenv/config";

// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// export const embeddings = new GoogleGenerativeAIEmbeddings({
//   apiKey: process.env.GOOGLE_GEMINI_API_KEY,
//   model: "gemini-embedding-001",
// });
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "BAAI/bge-small-en-v1.5",
});