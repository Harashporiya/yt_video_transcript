import { Innertube } from "youtubei.js";

let youtubeInstance = null;

export const getYoutubeVideoInfo = async (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error("Invalid YouTube Video ID.");
  }

  try {
    if (!youtubeInstance) {
      console.log("[YouTube Info] Initializing Innertube client instance...");
      youtubeInstance = await Innertube.create();
    }

    console.log(`[YouTube Info] Fetching metadata via youtubei.js for ID: ${videoId}...`);
    const info = await youtubeInstance.getInfo(videoId);

    const thumbnails = info.basic_info.thumbnail || [];
    const bestThumbnail = thumbnails.reduce((prev, current) => {
      return (prev.width && current.width && current.width > prev.width) ? current : prev;
    }, { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` });

    return {
      title: info.basic_info.title || `Video ${videoId}`,
      thumbnail: bestThumbnail.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (error) {
    console.error(`[YouTube Info] youtubei.js failed for ID: ${videoId}, falling back to oEmbed. Error: ${error.message}`);
    youtubeInstance = null;

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      console.log(`[YouTube Info] Querying oEmbed fallback: ${oembedUrl}`);
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || `Video ${videoId}`,
          thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    } catch (oembedError) {
      console.error(`[YouTube Info] oEmbed fallback failed: ${oembedError.message}`);
    }

    console.log(`[YouTube Info] Using manual fallback construction for ID: ${videoId}`);
    return {
      title: `YouTube Video (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
};