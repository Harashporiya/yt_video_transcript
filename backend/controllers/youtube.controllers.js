import { prisma } from '../lib/prisma.js';
import { processVideoService } from '../services/video/processVideo.service.js';
import { askQuestionService } from '../services/video/askQuestion.service.js';
import { deleteVideoService } from '../services/video/deleteVideo.service.js';
import { generateInterviewService } from '../services/video/generateInterview.service.js';
import { PLANS, FREE_LIMITS } from '../config/plans.config.js';

async function getPlanLimits(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiry: true, razorpaySubId: true },
  });

  if (!user) {
    return {
      videoLimit: FREE_LIMITS.videoLimit,
      chatLimit: FREE_LIMITS.chatLimit,
      isPro: false
    };
  }

  const isPro = user.plan === 'pro' && (!user.planExpiry || user.planExpiry > new Date());

  // Auto-downgrade expired pro plan
  if (user.plan === 'pro' && user.planExpiry && user.planExpiry <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free', planExpiry: null, razorpaySubId: null }
    });
  }

  const planType = user.razorpaySubId || 'monthly';
  const limits = isPro && PLANS[planType] ? PLANS[planType] : FREE_LIMITS;

  return {
    isPro,
    videoLimit: limits.videoLimit,
    chatLimit: limits.chatLimit,
  };
}



export const processVideoController = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }


    const { videoLimit, isPro } = await getPlanLimits(req.user.userId);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { videosUsedThisMonth: true },
    });

    const existingVideoCount = await prisma.video.count({
      where: { userId: req.user.userId },
    });

    const currentUsage = isPro ? (user?.videosUsedThisMonth || 0) : existingVideoCount;

    if (currentUsage >= videoLimit) {
      return res.status(403).json({
        success: false,
        message: isPro
          ? `Video limit reached. Pro plan allows ${videoLimit} videos/month.`
          : `Free plan allows only ${videoLimit} video. Upgrade to Pro for more!`,
        limitReached: true,
        limitType: "video",
        currentCount: currentUsage,
        maxLimit: videoLimit,
        isPro,
      });
    }

    await processVideoService(videoUrl, req.user.userId);

    res.status(200).json({
      success: true,
      message:
        "Video processed successfully",
    });
  } catch (error) {
    console.log(error);

    let message = error.message;
    if (message && (message.includes("rate_limit_exceeded") || message.includes("413") || message.includes("Limit 6000") || message.includes("too large"))) {
      message = "This video is too long to process on the free tier. Please try a shorter video (under 20-30 minutes).";
    }

    res.status(500).json({
      success: false,
      message: message,
    });
  }
};

export const askQuestionController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;
  try {
    const { question, chatHistory } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }


    const { chatLimit, isPro } = await getPlanLimits(userId);
    const video = await prisma.video.findUnique({
      where: { namespace: `${userId}-${videoId}` },
    });

    if (video) {
      const userMessageCount = await prisma.chatMessage.count({
        where: {
          videoRefId: video.id,
          userId,
          role: "user",
        },
      });

      if (userMessageCount >= chatLimit) {
        return res.status(403).json({
          success: false,
          message: isPro
            ? `Chat limit reached. Pro plan allows ${chatLimit} messages per video.`
            : `Free plan allows only ${chatLimit} messages per video. Upgrade to Pro!`,
          limitReached: true,
          limitType: "chat",
          currentCount: userMessageCount,
          maxLimit: chatLimit,
          isPro,
        });
      }
    }

    const answer =
      await askQuestionService(
        question,
        userId,
        videoId,
        chatHistory
      );

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.log(error);

    let message = error.message;
    if (message && (message.includes("rate_limit_exceeded") || message.includes("413") || message.includes("Limit 6000") || message.includes("too large"))) {
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
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message:
          "Video ID is required",
      });
    }
    const notExists = await prisma.video.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      },
    });

    if (!notExists) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    await deleteVideoService(userId, videoId);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateInterviewController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    const questions = await generateInterviewService(videoId, userId);

    res.status(200).json({
      success: true,
      message: "Interview questions generated successfully",
      questions,
    });
  } catch (error) {
    console.error("Error in generateInterviewController:", error);

    let message = error.message;
    if (message && (message.includes("rate_limit_exceeded") || message.includes("413") || message.includes("Limit 6000") || message.includes("too large"))) {
      message = "This video is too long to generate interview questions on the free tier. Please try a shorter video.";
    }

    res.status(500).json({
      success: false,
      message: message || "Failed to generate interview questions",
      stack: error.stack
    });
  }
};

export const getSummaryController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;

  try {
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

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
      message: error.message || "Failed to fetch summary",
      stack: error.stack
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
      message: error.message,
    });
  }
};

export const saveChatMessageController = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userId;
  const { role, text } = req.body;

  try {
    const video = await prisma.video.findUnique({
      where: { namespace: `${userId}-${videoId}` },
    });

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }


    const { chatLimit, isPro } = await getPlanLimits(userId);
    if (role === "user") {
      const userMessageCount = await prisma.chatMessage.count({
        where: {
          videoRefId: video.id,
          userId,
          role: "user",
        },
      });

      if (userMessageCount >= chatLimit) {
        return res.status(403).json({
          success: false,
          message: isPro
            ? `Chat limit reached. Pro plan allows ${chatLimit} messages per video.`
            : `Free plan allows only ${chatLimit} messages per video. Upgrade to Pro!`,
          limitReached: true,
          limitType: "chat",
          currentCount: userMessageCount,
          maxLimit: chatLimit,
          isPro,
        });
      }
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId,
        videoRefId: video.id,
        role,
        text
      }
    });

    res.status(200).json({ success: true, chatMessage });
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};