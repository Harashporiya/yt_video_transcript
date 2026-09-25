import { prisma } from "../../lib/prisma.js";
import { PLANS, FREE_LIMITS } from "../../config/plans.config.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Loads the user's effective plan. Downgrades an expired Pro plan and starts a
// new usage period once the current one (30 days monthly, 365 days yearly) ends.
export async function getUserPlan(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiry: true,
      razorpaySubId: true, // "monthly" | "yearly" | null
      videosUsedThisMonth: true,
      videosUsedTotal: true,
      videosResetAt: true,
    },
  });

  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const now = new Date();
  const isExpired = user.plan === "pro" && !!user.planExpiry && user.planExpiry <= now;

  if (isExpired) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "free", planExpiry: null, razorpaySubId: null },
    });
  }

  if (user.plan !== "pro" || isExpired) {
    return {
      isPro: false,
      isExpired,
      planType: null,
      planExpiry: null,
      limits: FREE_LIMITS,
      videosUsed: user.videosUsedTotal,
    };
  }

  const planType = PLANS[user.razorpaySubId] ? user.razorpaySubId : "monthly";
  const plan = PLANS[planType];
  let videosUsed = user.videosUsedThisMonth;

  if (!user.videosResetAt || now - user.videosResetAt >= plan.durationDays * DAY_MS) {
    // Match on the old reset time so a concurrent request can't reset twice and drop an increment.
    await prisma.user.updateMany({
      where: { id: userId, videosResetAt: user.videosResetAt },
      data: { videosUsedThisMonth: 0, videosResetAt: now },
    });
    videosUsed = 0;
  }

  return {
    isPro: true,
    isExpired: false,
    planType,
    planExpiry: user.planExpiry,
    limits: { videoLimit: plan.videoLimit, chatLimit: plan.chatLimit },
    videosUsed,
  };
}

// Atomically claims one video slot. Returns false when the limit is already used up.
// videosUsedTotal counts every video (Pro included), so an expired Pro user doesn't regain a free slot.
export async function reserveVideoSlot(userId, { isPro, limits }) {
  const field = isPro ? "videosUsedThisMonth" : "videosUsedTotal";
  const data = isPro
    ? { videosUsedThisMonth: { increment: 1 }, videosUsedTotal: { increment: 1 } }
    : { videosUsedTotal: { increment: 1 } };
  const { count } = await prisma.user.updateMany({
    where: { id: userId, [field]: { lt: limits.videoLimit } },
    data,
  });
  return count === 1;
}

// Gives back a slot claimed by reserveVideoSlot when processing did not add a new video.
export async function releaseVideoSlot(userId, { isPro }) {
  const fields = isPro ? ["videosUsedThisMonth", "videosUsedTotal"] : ["videosUsedTotal"];
  await prisma.$transaction(
    fields.map((field) =>
      prisma.user.updateMany({
        where: { id: userId, [field]: { gt: 0 } },
        data: { [field]: { decrement: 1 } },
      })
    )
  );
}

// Atomically claims one chat message on a video. Returns false when the limit is used up.
export async function reserveChatSlot(videoRefId, chatLimit) {
  const { count } = await prisma.video.updateMany({
    where: { id: videoRefId, chatCount: { lt: chatLimit } },
    data: { chatCount: { increment: 1 } },
  });
  return count === 1;
}

export async function releaseChatSlot(videoRefId) {
  await prisma.video.updateMany({
    where: { id: videoRefId, chatCount: { gt: 0 } },
    data: { chatCount: { decrement: 1 } },
  });
}
