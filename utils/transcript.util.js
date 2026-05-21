import { YoutubeTranscript } from "youtube-transcript";

export const getTranscript = async (videoUrl) => {

    const transcriptArr =await YoutubeTranscript.fetchTranscript(
          videoUrl,
          {
            lang: "en",
          }
        );

    return transcriptArr.map((item) => item.text).join("\n");
};