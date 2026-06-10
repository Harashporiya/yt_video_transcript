import { llm } from "../ai/llm.js";
import { getRepresentativeTranscript } from "../../utils/transcript.util.js";

export const generateQuestions = async (transcript) => {
  const representativeTranscript = getRepresentativeTranscript(transcript);
  const response = await llm.invoke(`
You are YouTube Video Transcripter, an expert AI educational assistant.
Your task is to generate questions based on the provided transcript to test the user's comprehension of the video content.
- If the video is educational, academic, technical, or a tutorial, generate relevant technical or conceptual interview questions.
- If the video is a vlog, talk, documentary, conversation, podcast, song, or other non-academic content, generate relevant fact-based, story-based, or theme-based comprehension questions about the events, topics, lyrics, or discussions in the video.
- Ensure the questions match these difficulty levels:
  * Easy: straightforward facts or basic concepts mentioned directly.
  * Medium: relationships between topics, explanations of why things happened, or core themes.
  * Hard: deep-dive analyses, critical thinking, or complex details.
You MUST always generate the questions and answers in ENGLISH only, regardless of the language of the video transcript.
Generate response ONLY in valid JSON format. Provide exactly 3 easy, 3 medium, and 3 hard questions.

{
  "easyQuestions": [
    { "question": "", "answer": "" },
    { "question": "", "answer": "" },
    { "question": "", "answer": "" }
  ],
  "mediumQuestions": [
    { "question": "", "answer": "" },
    { "question": "", "answer": "" },
    { "question": "", "answer": "" }
  ],
  "hardQuestions": [
    { "question": "", "answer": "" },
    { "question": "", "answer": "" },
    { "question": "", "answer": "" }
  ]
}

Transcript:
${representativeTranscript}
`);

  const cleanData = response.content.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(cleanData);
};
