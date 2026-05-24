import { prisma } from '../lib/prisma.js';
import { processVideoService } from '../services/video/processVideo.service.js';
import { askQuestionService } from '../services/video/askQuestion.service.js';
import { deleteVideoService } from '../services/video/deleteVideo.service.js';
import { generateInterviewService } from '../services/video/generateInterview.service.js';

export const processVideoController = async (req, res) => {
  // console.log(req.user)
    try {
      const { videoUrl } = req.body;

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "Video URL is required",
        });
      }

      await processVideoService(videoUrl,req.user.userId);

      res.status(200).json({
        success: true,
        message:
          "Video processed successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
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

      res.status(500).json({
        success: false,
        message: error.message,
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
          userId_videoId:{
            userId,
            videoId
          }
        },
      });

      console.log(notExists)

      if (!notExists) {
        return res.status(404).json({
          success: false,
          message: "Video not found",
        });
      }
    await deleteVideoService(userId,videoId);

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

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate interview questions",
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