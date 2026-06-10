import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { PLANS, FREE_LIMITS, razorpay } from "../../config/plans.config.js";

export async function createOrderService(userId, plan) {
  const selectedPlan = PLANS[plan];

  const shortId = userId.slice(-8);
  const shortTs = Date.now().toString().slice(-8);
  const receipt = `rcpt_${shortId}_${shortTs}`;

  const razorpayOrder = await razorpay.orders.create({
    amount: selectedPlan.amount,
    currency: "INR",
    receipt,
    notes: { userId, plan },
  });

  await prisma.paymentOrder.create({
    data: {
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount: selectedPlan.amount,
      plan,
      status: "pending",
    },
  });

  return {
    orderId: razorpayOrder.id,
    amount: selectedPlan.amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    plan,
    planLabel: selectedPlan.label,
  };
}


export async function verifyPaymentService(userId, razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  // Security 1: HMAC Signature Verification
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw Object.assign(new Error("Payment signature invalid. Possible fraud attempt."), { statusCode: 400 });
  }

  // Security 2: Order must exist in DB
  const order = await prisma.paymentOrder.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
  });
  if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

  // Security 3: Order must belong to this user
  if (order.userId !== userId) {
    throw Object.assign(new Error("Unauthorized: Order does not belong to you"), { statusCode: 403 });
  }

  // Graceful handle: Webhook already activated this payment
  if (order.status === "paid" && order.paymentId === razorpay_payment_id) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planExpiry: true }
    });
    return {
      planExpiry: user?.planExpiry,
      isExtension: false,
      planLabel: PLANS[order.plan].label,
      message: `Plan activated successfully!`,
    };
  }

  // Security 4: Replay attack prevention
  if (order.usedAt) {
    throw Object.assign(new Error("Payment already used"), { statusCode: 400 });
  }

  // Security 5: Order must be pending
  if (order.status !== "pending") {
    throw Object.assign(new Error("Order already processed"), { statusCode: 400 });
  }

  // Security 6: Verify payment from Razorpay API
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
  if (razorpayPayment.status !== "captured" && razorpayPayment.status !== "authorized") {
    throw Object.assign(new Error(`Payment not successful. Status: ${razorpayPayment.status}`), { statusCode: 400 });
  }

  // Security 7: Amount must match
  if (razorpayPayment.amount !== order.amount) {
    throw Object.assign(new Error("Payment amount mismatch. Possible tampering."), { statusCode: 400 });
  }

  // All checks passed → Activate plan
  return await activatePlan(userId, order.plan, razorpay_order_id, razorpay_payment_id, razorpay_signature);
}

// ─── Activate Plan (shared by verify + webhook)
export async function activatePlan(userId, plan, orderId, paymentId, signature = null) {
  const selectedPlan = PLANS[plan];
  const now = new Date();

  // Fetch current user to check existing expiry
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiry: true },
  });

  // If already Pro with future expiry → EXTEND (don't overwrite remaining days)
  const baseDate = (currentUser?.plan === "pro" && currentUser?.planExpiry && currentUser.planExpiry > now)
    ? currentUser.planExpiry
    : now;

  const planExpiry = new Date(baseDate.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
  const isExtension = baseDate > now;

  await prisma.$transaction([
    prisma.paymentOrder.update({
      where: { razorpayOrderId: orderId },
      data: { paymentId, signature, status: "paid", usedAt: true },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan: "pro", planExpiry, videosUsedThisMonth: 0, videosResetAt: now, razorpaySubId: plan },
    }),
  ]);

  return {
    planExpiry,
    isExtension,
    planLabel: selectedPlan.label,
    message: isExtension
      ? `Plan extended! Valid until ${planExpiry.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`
      : `${selectedPlan.label} activated successfully!`,
  };
}

// Webhook Signature Verification 
export function verifyWebhookSignature(rawBody, signature) {
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expectedSig === signature;
}


export async function getPlanStatusService(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiry: true,
      videosUsedThisMonth: true,
      videosResetAt: true,
      razorpaySubId: true,   // "monthly" | "yearly" | null
    },
  });

  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const now = new Date();
  let effectivePlan = user.plan;

  // Auto-downgrade expired Pro plan
  if (user.plan === "pro" && user.planExpiry && user.planExpiry < now) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "free", planExpiry: null, razorpaySubId: null },
    });
    effectivePlan = "free";
  }

  // Reset monthly video count if new month
  await resetVideosIfNewMonth(userId, user);

  // Pick limits based on actual plan type (monthly vs yearly)
  const planType = user.razorpaySubId; // "monthly" | "yearly" | null
  const limits = effectivePlan === "pro" && planType && PLANS[planType]
    ? { videoLimit: PLANS[planType].videoLimit, chatLimit: PLANS[planType].chatLimit }
    : effectivePlan === "pro"
      ? { videoLimit: PLANS["monthly"].videoLimit, chatLimit: PLANS["monthly"].chatLimit } // fallback
      : FREE_LIMITS;

  return {
    plan: effectivePlan,
    planType: effectivePlan === "pro" ? (planType || "monthly") : null,
    planExpiry: user.planExpiry,
    videosUsedThisMonth: user.videosUsedThisMonth,
    isExpired: user.plan === "pro" && user.planExpiry && user.planExpiry < now,
    limits,
  };
}

//  Helper: Reset monthly video count
async function resetVideosIfNewMonth(userId, user) {
  const now = new Date();
  const resetAt = user.videosResetAt ? new Date(user.videosResetAt) : null;

  if (!resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { videosUsedThisMonth: 0, videosResetAt: now },
    });
    // Update in-memory user object properties so they return correctly in the current request
    user.videosUsedThisMonth = 0;
    user.videosResetAt = now;
  }
}
