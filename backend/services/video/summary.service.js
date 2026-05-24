import { llm } from "../ai/llm.js";

export const generateSummary =async (transcript) => {

    const response = await llm.invoke(`
You are YouTube Video Transcripter, a helpful AI assistant. Generate a structured summary of the provided video transcript.
Generate response only in JSON format.

{
  "shortSummary":"",
  "longSummary":"",
  "keypointSummary":[]
}

Transcript:
${transcript}
`);

    const cleanData = response.content.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanData);
};