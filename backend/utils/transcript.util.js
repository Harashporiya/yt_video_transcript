import { ApifyClient } from "apify-client";
import { YoutubeTranscript } from "youtube-transcript";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export const getTranscript = async (videoUrl) => {
  // Step 1: Try English transcript
  try {
    console.log("Attempting to fetch English transcript locally...");
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoUrl, { lang: "en" });
    console.log("Successfully fetched English transcript locally.");
    return transcriptArr.map((item) => item.text).join("\n");
  } catch (localEnError) {
    console.log(`Local English fetch failed. Reason: ${localEnError.message}`);
  }

  // Step 2: Try any available language transcript (e.g., Hindi)
  try {
    console.log("Attempting to fetch transcript in any available language...");
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoUrl); // no lang filter
    console.log("Fetched transcript in fallback language.");
    return transcriptArr.map((item) => item.text).join("\n");
  } catch (localAnyError) {
    console.log(`Local fallback fetch also failed. Reason: ${localAnyError.message}`);
  }

  // Step 3: Try Apify as last resort
  if (!process.env.APIFY_API_TOKEN) {
    throw new Error("Transcript not available and Apify token is missing.");
  }

  try {
    console.log("Using Apify API to fetch transcript...");

    const input = {
      youtube_url: videoUrl,
      language: "en",
      include_transcript_text: true,
    };

    const run = await client.actor("starvibe/youtube-video-transcript").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items && items.length > 0) {
      const fullText = items
        .map((item) => item.transcript_text || item.text || item.transcript || item.translatedText || "")
        .filter(Boolean)
        .join("\n");

      if (fullText.trim()) {
        console.log("Apify transcript fetch successful.");
        return fullText;
      }
    }

    throw new Error("Apify returned empty transcript.");
  } catch (apifyError) {
    console.error(`Apify failed: ${apifyError.message}`);
    throw new Error(`Could not fetch transcript via any method. Last error: ${apifyError.message}`);
  }
};