import express from "express";

import {
  processVideoController,
  askQuestionController,
  videoDeleteController,
  generateInterviewController,
  getSummaryController,
  getChatHistoryController,
} from "../controllers/youtube.controllers.js";
import { authenticateToken } from "../middlewares.js";

const router = express.Router();

router.post("/video-url", authenticateToken, processVideoController);

router.post("/ask/:videoId", authenticateToken, askQuestionController);

router.delete("/delete/:videoId", authenticateToken, videoDeleteController)

router.post("/interview/:videoId", authenticateToken, generateInterviewController);

router.get("/summary/:videoId", authenticateToken, getSummaryController);

router.get("/chat/:videoId", authenticateToken, getChatHistoryController);

export default router;