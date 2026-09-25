import getVideoId from 'youtube-video-id';
import { prisma } from '../lib/prisma.js';
import { processVideoService } from '../services/video/processVideo.service.js';
import { askQuestionService } from '../services/video/askQuestion.service.js';
import { deleteVideoService } from '../services/video/deleteVideo.service.js';
import { generateInterviewService } from '../services/video/generateInterview.service.js';
import {
  getUserPlan,
  reserveVideoSlot,
  releaseVideoSlot,
  reserveChatSlot,
  releaseChatSlot,
} from '../services/payment/plan.service.js';

const MAX_QUESTION_LENGTH = 1000;

const isRateLimitError = (message) =>
  message && (message.includes("rate_limit_exceeded") || message.includes("413") || message.includes("Limit 6000") || message.includes("too large"));

export const processVideoController = async (req, res) => {
  const userId = req.user.userId;
  const { videoUrl } = req.body;

  if (!videoUrl || typeof videoUrl !== "string") {
    return res.status(400).json({
      success: false,
      message: "Video URL is required",
    });
  }

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid YouTube URL",
    });
  }

  let plan;
  let slotReserved = false;

  try {
    // Re-submitting a video the user already has is free and doesn't count against the limit
    const existingVideo = await prisma.video.findUnique({
      where: { namespace: `${userId}-${videoId}` },
    });
    if (existingVideo) {
      return res.status(200).json({ success: true, message: "Video processed successfully" });
    }

    plan = await getUserPlan(userId);
    const { isPro, limits } = plan;

    slotReserved = await reserveVideoSlot(userId, plan);
    if (!slotReserved) {
      return res.status(403).json({
        success: false,
        message: isPro
          ? `Video limit reached. Your Pro plan allows ${limits.videoLimit} videos per billing period.`
          : `Free plan allows only ${limits.videoLimit} video. Upgrade to Pro for more!`,
        limitReached: true,
        limitType: "video",
        currentCount: limits.videoLimit,
        maxLimit: limits.videoLimit,
        isPro,
      });
    }

    const { created } = await processVideoService(videoUrl, videoId, userId);
    if (!created) {
      await releaseVideoSlot(userId, plan);
    }

    res.status(200).json({
      success: true,
      message:
        "Video processed successfully",
    });
  } catch (error) {
    console.log(error);

    if (slotReserved) {
      await releaseVideoSlot(userId, plan).catch((releaseError) => console.error("Failed to release video slot:", releaseError));
    }

    let message = error.message;
    if (isRateLimitError(message)) {
      message = "This video is too long to process on the free tier. Please try a shorter video (under 20-30 minutes).";
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: message,
    });
  }
};

export const askQuestionController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;
  const question = typeof req.body.question === "string" ? req.body.question.trim() : "";

  if (!question) {
    return res.status(400).json({
      success: false,
      message: "Question is required",
    });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Question is too long. Please keep it under ${MAX_QUESTION_LENGTH} characters.`,
    });
  }

  let video;
  let slotReserved = false;

  try {
    video = await prisma.video.findUnique({
      where: { namespace: `${userId}-${videoId}` },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found. Please process the video first.",
      });
    }

    const { isPro, limits: { chatLimit } } = await getUserPlan(userId);

    slotReserved = await reserveChatSlot(video.id, chatLimit);
    if (!slotReserved) {
      return res.status(403).json({
        success: false,
        message: isPro
          ? `Chat limit reached. Pro plan allows ${chatLimit} messages per video.`
          : `Free plan allows only ${chatLimit} messages per video. Upgrade to Pro!`,
        limitReached: true,
        limitType: "chat",
        currentCount: video.chatCount,
        maxLimit: chatLimit,
        isPro,
      });
    }

    const answer = await askQuestionService(question, userId, video);

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.log(error);

    if (slotReserved) {
      await releaseChatSlot(video.id).catch((releaseError) => console.error("Failed to release chat slot:", releaseError));
    }

    let message = error.message;
    if (isRateLimitError(message)) {
      message = "AI service is currently busy or the request is too large. Please try again in a minute.";
    }

    res.status(500).json({
      success: false,
      message: message,
    });
  }
};

export const videoDeleteController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    const deleted = await deleteVideoService(userId, videoId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
};

export const generateInterviewController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    const questions = await generateInterviewService(videoId, userId);

    res.status(200).json({
      success: true,
      message: "Interview questions generated successfully",
      questions,
    });
  } catch (error) {
    console.error("Error in generateInterviewController:", error);

    let message = error.message;
    if (isRateLimitError(message)) {
      message = "This video is too long to generate interview questions on the free tier. Please try a shorter video.";
    }

    res.status(500).json({
      success: false,
      message: message || "Failed to generate interview questions",
    });
  }
};

export const getSummaryController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    const video = await prisma.video.findUnique({
      where: {
        namespace: `${userId}-${videoId}`,
      },
      include: {
        summaries: true,
      },
    });

    if (!video || !video.summaries || video.summaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    res.status(200).json({
      success: true,
      summary: video.summaries[0],
    });
  } catch (error) {
    console.error("Error in getSummaryController:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
    });
  }
};

export const getChatHistoryController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    const video = await prisma.video.findUnique({
      where: {
        namespace: `${userId}-${videoId}`,
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!video) {
      return res.status(200).json({
        success: true,
        chatHistory: [],
        message: "Video not found, returning empty history"
      });
    }

    const formattedHistory = video.chatMessages.map(msg => ({
      role: msg.role,
      text: msg.text
    }));

    res.status(200).json({
      success: true,
      chatHistory: formattedHistory,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};
