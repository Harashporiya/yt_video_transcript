import { llm } from "../ai/llm.js";

export const generateSummary = async (transcript) => {
  const response = await llm.invoke(`
You are a YouTube Video Summarizer. The transcript below may be in any language (Hindi, English, etc.).
You MUST always respond in ENGLISH only.
Return ONLY valid JSON — no extra text, no markdown, no explanation.

{
  "shortSummary": "2-3 sentence overview in English",
  "longSummary": "Detailed summary in English",
  "keypointSummary": ["key point 1", "key point 2"]
}

Transcript:
${transcript}
`);

  try {
    const cleanData = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();


    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in LLM response");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Failed to parse LLM response:", response.content);
    throw new Error(`Summary generation failed: ${err.message}`);
  }
};