import { Innertube } from "youtubei.js";

export const getYoutubeVideoInfo = async (videoId) => {
  try {
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);

    return {
      title: info.basic_info.title || `Video ${videoId}`,
      thumbnail: info.basic_info.thumbnail?.[0]?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (error) {
    console.error("youtubei.js failed to fetch info, falling back to oEmbed:", error.message);
    try {
      // Fallback 1: YouTube oEmbed API
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || `Video ${videoId}`,
          thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    } catch (oembedError) {
      console.error("oEmbed failed as well:", oembedError.message);
    }

    // Fallback 2: Manual construction
    return {
      title: `YouTube Video (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
};