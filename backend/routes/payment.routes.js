import { Router } from "express";
import { authenticateToken } from "../middlewares.js";
import {createOrder,verifyPayment,razorpayWebhook,getPlanStatus} from "../controllers/payment.controllers.js";

const router = Router();

router.post("/create-order", authenticateToken, createOrder);
router.post("/verify", authenticateToken, verifyPayment);
router.post("/webhook", razorpayWebhook);
router.get("/plan-status", authenticateToken, getPlanStatus);

export default router;
