import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
});


// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// export const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GOOGLE_GEMINI_API_KEY,
//     model: "gemini-2.5-flash-lite",
//     temperature: 0.1,
// });
