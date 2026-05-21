import { Innertube } from "youtubei.js";

export const getYoutubeVideoInfo =async (videoId) => {

    const youtube =await Innertube.create();

    const info =await youtube.getInfo(videoId);

    return {
      title:
        info.basic_info.title,

      thumbnail:
        info.basic_info.thumbnail?.[0]
          ?.url,
    };
};