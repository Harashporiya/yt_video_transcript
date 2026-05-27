import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callWithRetry = async (fn, maxRetries = 10, initialDelay = 5000) => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const isRateLimit =
        err.message &&
        (err.message.includes("429") ||
          err.message.includes("Too Many Requests") ||
          err.message.includes("quota") ||
          err.message.includes("RESOURCE_EXHAUSTED") ||
          err.message.includes("empty vectors"));

      if (isRateLimit && attempt <= maxRetries) {
        const backoff = Math.min(initialDelay * Math.pow(2, attempt - 1), 120000); // max 2 min cap
        console.warn(
          `[Embeddings] Rate limit hit. Retrying in ${backoff / 1000}s (Attempt ${attempt}/${maxRetries})...`
        );
        await wait(backoff);
      } else {
        throw err;
      }
    }
  }
};

const originalEmbedDocuments = embeddings.embedDocuments.bind(embeddings);

embeddings.embedDocuments = async (documents) => {
  if (!documents || documents.length === 0) return [];

  // Filter out empty/whitespace-only chunks before sending to API
  const validDocuments = documents.map((doc) =>
    doc && doc.trim().length > 0 ? doc : "empty"
  );

  const batchSize = 5; // conservative for 5-hour videos on free tier
  const results = [];

  for (let i = 0; i < validDocuments.length; i += batchSize) {
    const batch = validDocuments.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(validDocuments.length / batchSize);

    console.log(
      `[Embeddings] Batch ${batchNum}/${totalBatches} — ${batch.length} chunks...`
    );

    const batchResult = await callWithRetry(async () => {
      const res = await originalEmbedDocuments(batch);

      if (!res || res.length === 0) {
        throw new Error("empty vectors");
      }

      const hasEmpty = res.some((v) => !v || v.length === 0);
      if (hasEmpty) {
        throw new Error("Batch embedding returned empty vectors (rate limit / silent failure).");
      }

      return res;
    });

    results.push(...batchResult);

    // 8 second delay between batches to respect 15 RPM free tier
    if (i + batchSize < validDocuments.length) {
      console.log(`[Embeddings] Waiting 8s before next batch...`);
      await wait(8000);
    }
  }

  return results;
};