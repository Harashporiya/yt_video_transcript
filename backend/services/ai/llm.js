import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    // Groq retired its Llama chat models; override with GROQ_MODEL (e.g. "openai/gpt-oss-120b")
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    temperature: 0.2,
});


// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// export const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GOOGLE_GEMINI_API_KEY,
//     model: "gemini-2.5-flash-lite",
//     temperature: 0.1,
// });