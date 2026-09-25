export interface PlanConfig {
  label: string
  price: string
  period: string
  description: string
  badge: string | null
  highlight: boolean
  features: string[]
}

export const FREE_PLAN = {
  label: "Free",
  price: "₹0",
  period: "forever",
  description: "Try it on a video you care about",
  features: [
    "1 video in total",
    "3 chat messages per video",
    "AI summaries",
    "Interview questions",
  ],
}

export const PLANS: Record<"monthly" | "yearly", PlanConfig> = {
  monthly: {
    label: "Pro Monthly",
    price: "₹199",
    period: "/month",
    description: "For regular learners",
    badge: null,
    highlight: false,
    features: [
      "5 videos per month",
      "15 chat messages per video",
      "AI summaries",
      "Interview questions",
      "Priority support",
    ],
  },
  yearly: {
    label: "Pro Yearly",
    price: "₹999",
    period: "/year",
    description: "Save 58% compared with monthly",
    badge: "Best value",
    highlight: true,
    features: [
      "30 videos per year",
      "35 chat messages per video",
      "AI summaries",
      "Interview questions",
      "Priority support",
      "Early access to new features",
    ],
  },
}
