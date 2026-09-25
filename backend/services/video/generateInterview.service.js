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

    // Videos processed before transcripts were stored need a one-time fetch
    let transcript = video.transcript;
    if (!transcript) {
        transcript = await getTranscript(video.videoUrl);
        await prisma.video.update({ where: { id: video.id }, data: { transcript } });
    }
    const parsedQuestions = await generateQuestions(transcript);


    const savedQuestions = await prisma.videoQuestion.upsert({
        where: {
            userId_videoRefId: { userId, videoRefId: video.id },
        },
        update: {
            easyQuestions: parsedQuestions.easyQuestions,
            mediumQuestions: parsedQuestions.mediumQuestions,
            hardQuestions: parsedQuestions.hardQuestions,
        },
        create: {
            userId,
            videoRefId: video.id,
            easyQuestions: parsedQuestions.easyQuestions,
            mediumQuestions: parsedQuestions.mediumQuestions,
            hardQuestions: parsedQuestions.hardQuestions,
        },
    });

    return savedQuestions;
};
