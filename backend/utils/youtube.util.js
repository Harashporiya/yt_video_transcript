export const getYoutubeVideoInfo = async (videoId) => {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid YouTube Video ID.");
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || `Video ${videoId}`,
        thumbnail:
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn(`[YouTube Info] oEmbed failed for ID: ${videoId} — ${err.message}`);
  }
  return {
    title: `YouTube Video (${videoId})`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
};