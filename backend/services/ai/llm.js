import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    model: "gemini-3.1-flash-lite",
    temperature: 0.1,
});