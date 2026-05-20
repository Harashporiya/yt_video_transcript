import { prisma } from '../lib/prisma.js';
import {
  processVideoService,
  askQuestionService,
  deleteVideoService,
} from '../services/youtube.service.js'

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
      const { question } = req.body;

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