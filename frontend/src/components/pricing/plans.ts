export interface PlanConfig {
  label: string
  price: string
  period: string
  description: string
  color: string
  border: string
  badge: string | null
  features: string[]
}

export const PLANS: Record<"monthly" | "yearly", PlanConfig> = {
  monthly: {
    label: "Pro Monthly",
    price: "₹199",
    period: "/month",
    description: "Perfect for regular learners",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    badge: null,
    features: [
      "5 videos per month",
      "15 chat messages per video",
      "AI Summaries",
      "Interview Question Generator",
      "Priority Support",
    ],
  },
  yearly: {
    label: "Pro Yearly",
    price: "₹999",
    period: "/year",
    description: "Best value — save 58%",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    badge: "BEST VALUE",
    features: [
      "30 videos per year",
      "35 chat messages per video",
      "AI Summaries",
      "Interview Question Generator",
      "Priority Support",
      "Early access to new features",
    ],
  },
}
