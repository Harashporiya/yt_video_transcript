import { ApifyClient } from "apify-client";
import { YoutubeTranscript } from "youtube-transcript";
import getVideoId from "youtube-video-id";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const decodeHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
};

export const getTranscript = async (videoUrl) => {
  if (!videoUrl) {
    throw new Error("Video URL is required to fetch transcript.");
  }

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    throw new Error("Could not extract a valid YouTube video ID from the provided URL.");
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    console.log(`[Transcript] Attempting to fetch English transcript locally for ID: ${videoId}...`);
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    console.log("[Transcript] Successfully fetched English transcript locally.");
    const fullText = transcriptArr.map((item) => item.text).join(" ");
    return decodeHtmlEntities(fullText);
  } catch (localEnError) {
    console.log(`[Transcript] Local English fetch failed: ${localEnError.message}`);
  }

  try {
    console.log(`[Transcript] Attempting to fetch transcript in default language for ID: ${videoId}...`);
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);
    console.log("[Transcript] Successfully fetched default language transcript locally.");
    const fullText = transcriptArr.map((item) => item.text).join(" ");
    return decodeHtmlEntities(fullText);
  } catch (localAnyError) {
    console.log(`[Transcript] Local fallback fetch failed: ${localAnyError.message}`);
  }

  if (!process.env.APIFY_API_TOKEN) {
    throw new Error("Transcript not available locally, and APIFY_API_TOKEN is not configured.");
  }

  try {
    console.log(`[Transcript] Using Apify actor to scrape transcript for: ${standardUrl}`);

    const input = {
      youtube_url: standardUrl,
      include_transcript_text: true,
    };

    const run = await client.actor("starvibe/youtube-video-transcript").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items && items.length > 0) {
      const scrapedText = items
        .map((item) => item.transcript_text || item.text || item.transcript || item.translatedText || "")
        .filter(Boolean)
        .join(" ");

      const cleanedText = decodeHtmlEntities(scrapedText).trim();
      if (cleanedText) {
        console.log("[Transcript] Apify transcript fetch successful.");
        return cleanedText;
      }
    }

    throw new Error("Apify run finished but returned no transcript items.");
  } catch (apifyError) {
    console.error(`[Transcript] Apify failed: ${apifyError.message}`);
    throw new Error(`Failed to retrieve transcript. Checked locally and via Apify. Error: ${apifyError.message}`);
  }
};

export const getRepresentativeTranscript = (transcript, maxChars = 12000) => {
  if (!transcript) return "";
  
  const cleaned = transcript.trim();
  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  const numSegments = 6;
  const segmentLength = Math.floor(maxChars / numSegments);
  const totalLength = cleaned.length;
  const segments = [];

  for (let i = 0; i < numSegments; i++) {
    const startRatio = i / numSegments;
    const startIdx = Math.floor(totalLength * startRatio);
    let chunk = cleaned.substring(startIdx, Math.min(startIdx + segmentLength, totalLength));

    const firstSpace = chunk.indexOf(" ");
    const lastSpace = chunk.lastIndexOf(" ");
    if (firstSpace !== -1 && lastSpace !== -1 && lastSpace > firstSpace) {
      chunk = chunk.substring(firstSpace + 1, lastSpace);
    }

    segments.push(`[Section ${i + 1} of Video transcript]:\n... ${chunk.trim()} ...`);
  }

  return segments.join("\n\n");
};