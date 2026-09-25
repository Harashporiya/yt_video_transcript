import { llm } from "../ai/llm.js";
import { getRepresentativeTranscript } from "../../utils/transcript.util.js";
import { parseLLMJson } from "../../utils/llmJson.util.js";

export const generateSummary = async (transcript) => {
  const representativeTranscript = getRepresentativeTranscript(transcript);
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
${representativeTranscript}
`);

  return parseLLMJson(response.content, "Summary");
};
