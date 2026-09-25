import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { PLANS, razorpay } from "../../config/plans.config.js";
import { getUserPlan } from "./plan.service.js";

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

  if (!safeEqual(expectedSignature, razorpay_signature)) {
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
    return alreadyActivatedResponse(userId, order.plan);
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

  // Security 7: Payment must be for this order and amount
  if (razorpayPayment.order_id !== razorpay_order_id) {
    throw Object.assign(new Error("Payment does not belong to this order."), { statusCode: 400 });
  }
  if (razorpayPayment.amount !== order.amount) {
    throw Object.assign(new Error("Payment amount mismatch. Possible tampering."), { statusCode: 400 });
  }

  // All checks passed → Activate plan
  const result = await activatePlan(userId, order.plan, razorpay_order_id, razorpay_payment_id, razorpay_signature);

  // The webhook won the race and already activated this order
  return result ?? alreadyActivatedResponse(userId, order.plan);
}

async function alreadyActivatedResponse(userId, plan) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planExpiry: true },
  });
  return {
    planExpiry: user?.planExpiry,
    isExtension: false,
    planLabel: PLANS[plan].label,
    message: `Plan activated successfully!`,
  };
}

// ─── Activate Plan (shared by verify + webhook)
// Returns null when the order was already activated by the other path.
export async function activatePlan(userId, plan, orderId, paymentId, signature = null) {
  const selectedPlan = PLANS[plan];

  return prisma.$transaction(async (tx) => {
    // Only the first caller flips the order from pending to paid; the row lock makes the other one wait and see 0 rows.
    const { count } = await tx.paymentOrder.updateMany({
      where: { razorpayOrderId: orderId, status: "pending" },
      data: { paymentId, signature, status: "paid", usedAt: true },
    });
    if (count === 0) return null;

    // Lock the user so two different orders can't both extend from the same expiry
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

    const now = new Date();
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiry: true },
    });

    // If already Pro with future expiry → EXTEND (don't overwrite remaining days)
    const baseDate = (currentUser?.plan === "pro" && currentUser?.planExpiry && currentUser.planExpiry > now)
      ? currentUser.planExpiry
      : now;

    const planExpiry = new Date(baseDate.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
    const isExtension = baseDate > now;

    // A new plan starts a fresh usage period; an extension keeps the current one running.
    const usageReset = isExtension ? {} : { videosUsedThisMonth: 0, videosResetAt: now };

    await tx.user.update({
      where: { id: userId },
      data: { plan: "pro", planExpiry, razorpaySubId: plan, ...usageReset },
    });

    return {
      planExpiry,
      isExtension,
      planLabel: selectedPlan.label,
      message: isExtension
        ? `Plan extended! Valid until ${planExpiry.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`
        : `${selectedPlan.label} activated successfully!`,
    };
  });
}

// Webhook Signature Verification 
export function verifyWebhookSignature(rawBody, signature) {
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expectedSig, signature);
}

// Constant-time string comparison so signatures can't be guessed byte by byte
function safeEqual(expected, received) {
  if (typeof received !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}


export async function getPlanStatusService(userId) {
  const { isPro, isExpired, planType, planExpiry, limits, videosUsed } = await getUserPlan(userId);

  return {
    plan: isPro ? "pro" : "free",
    planType,
    planExpiry,
    // Capped for display: an expired Pro user's lifetime count (e.g. 6) would otherwise show as "6/1" on the free plan.
    // The real count still drives limit checks in plan.service.js.
    videosUsedThisMonth: Math.min(videosUsed, limits.videoLimit),
    isExpired,
    limits,
  };
}
