import { prisma } from "../../lib/prisma.js";
import { getTranscript } from "../../utils/transcript.util.js";
import { generateQuestions } from "./question.service.js";

export const generateInterviewService = async (videoId, userId) => {
    const namespace = `${userId}-${videoId}`;

    const video = await prisma.video.findUnique({
        where: {
            namespace,
        },
        include: {
            questions: true,
        },
    });

    if (!video) {
        throw new Error("Video not found. Please process the video first.");
    }

    if (video.questions && video.questions.length > 0) {
        return video.questions[0];
    }

    const transcript = await getTranscript(video.videoUrl);
    const parsedQuestions = await generateQuestions(transcript);


    const savedQuestions = await prisma.videoQuestion.create({
        data: {
            userId,
            videoRefId: video.id,
            easyQuestions: JSON.stringify(parsedQuestions.easyQuestions),
            mediumQuestions: JSON.stringify(parsedQuestions.mediumQuestions),
            hardQuestions: JSON.stringify(parsedQuestions.hardQuestions),
        },
    });

    return savedQuestions;
};
