// Extracts and parses the JSON object from an LLM reply, ignoring code fences or extra text around it.
export const parseLLMJson = (content, label) => {
  try {
    const cleanData = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in LLM response");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error(`Failed to parse LLM ${label} response:`, content);
    throw new Error(`${label} generation failed: ${err.message}`);
  }
};
