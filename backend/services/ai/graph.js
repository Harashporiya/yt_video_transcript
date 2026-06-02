import { StateGraph, Annotation } from "@langchain/langgraph";
import { llm } from "./llm.js";

const GraphState = Annotation.Root({
    question:    Annotation({ reducer: (_, v) => v }),
    chatHistory: Annotation({ reducer: (_, v) => v }),
    intent:      Annotation({ reducer: (_, v) => v }),
    context:     Annotation({ reducer: (_, v) => v }),
    answer:      Annotation({ reducer: (_, v) => v }),
});

async function classifyIntent(state) {
    const { question } = state;

    const systemPrompt = `You are an intent classifier for a YouTube video Q&A assistant.

Classify the user's message into EXACTLY one of these two categories:

1. "conversational" - Use this ONLY when the user is:
   - Greeting  (hi, hello, hey, namaste, salam, hola)
   - Asking about the assistant itself  (tumhara naam kya hai, what are you, who are you)
   - Thanking  (thanks, shukriya, dhanyawad)
   - Pure small talk with NO reference to the video  (how are you, acha, ok, sure)

2. "video_qa" - Use this when the user is:
   - Asking anything about the video content
   - Asking for summary, explanation, timestamps, topics
   - Asking a vague question that references the video (e.g. "what about this video?", "tell me more", "explain", "is video ke baare mein batao")
   - Asking follow-up questions about something from the video
   - Any question that could require the transcript to answer

When in doubt, always choose "video_qa".

Reply with ONLY ONE WORD: either  conversational  or  video_qa`;

    const response = await llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
    ]);

    const raw = response.content.trim().toLowerCase();
    const intent = raw.includes("conversational") ? "conversational" : "video_qa";

    console.log(`[LangGraph] Intent classified as: "${intent}" for question: "${question}"`);
    return { intent };
}

function routeByIntent(state) {
    return state.intent === "conversational" ? "directAnswer" : "retrieveContext";
}

async function directAnswer(state) {
    const { question, chatHistory } = state;

    const historyText = chatHistory?.length
        ? "Previous Conversation:\n" +
          chatHistory.map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`).join("\n")
        : "";

    const prompt = `Your name is YouTube Video Transcripter. You are a helpful AI assistant.
If the user greets you, introduces themselves, or asks about your identity, respond warmly and introduce yourself.

CRITICAL LANGUAGE RULE (HIGHEST PRIORITY — MUST FOLLOW):
- Detect the language from the USER'S QUESTION ONLY. Ignore the language of the context/transcript completely.
- If the user's question is in English → your ENTIRE response MUST be in English. No Hindi or Devanagari allowed.
- If the user's question is in Hindi (Devanagari script) or Hinglish (Hindi written in Roman/English script) → reply in Hinglish (Hindi using English characters).
- The language of the transcript/context does NOT affect your response language.

${historyText}

User: ${question}`;

    const response = await llm.invoke(prompt);
    return { context: null, answer: response.content };
}

async function retrieveContext(state, config) {
    const { question } = state;
    const { vectorStore } = config.configurable;

    const results = await vectorStore.similaritySearch(question, 5);
    const context = results.map(doc => doc.pageContent).join("\n");

    console.log(`[LangGraph] Retrieved ${results.length} chunks from Pinecone`);
    return { context };
}

async function generateAnswer(state) {
    const { question, context, chatHistory } = state;

    const historyText = chatHistory?.length
        ? "Previous Conversation:\n" +
          chatHistory.map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`).join("\n")
        : "";

    const prompt = `Your name is YouTube Video Transcripter. You are a helpful and knowledgeable AI assistant answering questions about a video.
If the user asks about your name, identity, or greets you, introduce yourself proudly as YouTube Video Transcripter.

Answer the user's question using the provided context from the video transcript.
If the question is vague (e.g. "what about this video?", "tell me about it"), give a thorough overview — cover the main topics, key points, and important details from the context.
If the question refers to something mentioned previously, use the Previous Conversation to understand the context.
For questions about the video, answer ONLY from the provided context.

IMPORTANT: Give a detailed, well-structured response. Do NOT give one-line or very short answers. Cover all relevant points from the context. Use bullet points or paragraphs as appropriate.

CRITICAL LANGUAGE RULE (HIGHEST PRIORITY — MUST FOLLOW):
- Detect the language from the USER'S QUESTION ONLY. Ignore the language of the context/transcript completely.
- If the user's question is in English → your ENTIRE response MUST be in English. No Hindi or Devanagari allowed.
- If the user's question is in Hindi (Devanagari script) or Hinglish (Hindi written in Roman/English script) → reply in Hinglish (Hindi using English characters).
- The language of the transcript/context does NOT affect your response language.

Context:
${context}

${historyText}

Question: ${question}`;

    const response = await llm.invoke(prompt);
    return { answer: response.content };
}

const workflow = new StateGraph(GraphState)
    .addNode("classifyIntent",  classifyIntent)
    .addNode("directAnswer",    directAnswer)
    .addNode("retrieveContext", retrieveContext)
    .addNode("generateAnswer",  generateAnswer)
    .addEdge("__start__", "classifyIntent")
    .addConditionalEdges("classifyIntent", routeByIntent, {
        directAnswer:    "directAnswer",
        retrieveContext: "retrieveContext",
    })
    .addEdge("directAnswer", "__end__")
    .addEdge("retrieveContext", "generateAnswer")
    .addEdge("generateAnswer",  "__end__");

export const graph = workflow.compile();
