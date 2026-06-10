import { PLANS } from "../config/plans.config.js";
import {
  createOrderService,
  verifyPaymentService,
  verifyWebhookSignature,
  activatePlan,
  getPlanStatusService,
} from "../services/payment/payment.service.js";
import { prisma } from "../lib/prisma.js";

export const createOrder = async (req, res) => {
  const { plan } = req.body;
  console.log(req.body)
  const userId = req.user.userId;

  if (!PLANS[plan]) {
    return res.status(400).json({ success: false, message: "Invalid plan. Choose 'monthly' or 'yearly'." });
  }

  try {
    const result = await createOrderService(userId, plan);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[Payment] Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};


export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user.userId;
console.log(req.body)
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  try {
    const result = await verifyPaymentService(userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const code = error.statusCode || 500;
    console.error("[Payment] Verify error:", error);
    res.status(code).json({ success: false, message: error.message || "Payment verification failed" });
  }
};


export const razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body;

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[Webhook] Invalid signature — possible fake webhook");
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  try {
    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: orderId } });

      if (order && order.status === "pending") {
        await activatePlan(order.userId, order.plan, orderId, paymentId);
        console.log(`[Webhook] Plan activated for user: ${order.userId}`);
      }
    }

    if (event === "payment.failed" && paymentEntity) {
      const orderId = paymentEntity.order_id;
      await prisma.paymentOrder.updateMany({
        where: { razorpayOrderId: orderId, status: "pending" },
        data: { status: "failed" },
      });
      console.log(`[Webhook] Payment failed for order: ${orderId}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    res.status(500).json({ success: false });
  }
};


export const getPlanStatus = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await getPlanStatusService(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const code = error.statusCode || 500;
    console.error("[Payment] Get plan status error:", error);
    res.status(code).json({ success: false, message: error.message || "Failed to fetch plan status" });
  }
};
