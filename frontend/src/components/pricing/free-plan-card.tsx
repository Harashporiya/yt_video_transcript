"use client"

import { CheckCircleIcon } from "@phosphor-icons/react"

const FREE_FEATURES = [
  "1 video total",
  "3 chat messages per video",
  "AI Summaries",
  "Interview Questions",
]

interface FreePlanCardProps {
  isPro: boolean
}

export function FreePlanCard({ isPro }: FreePlanCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white/70 mb-1">Free</h3>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-white/50">₹0</span>
        </div>
        <p className="text-white/30 text-sm">For occasional use</p>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {FREE_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-white/40">
            <CheckCircleIcon size={16} weight="fill" className="text-white/20 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/30 text-sm font-semibold">
        {isPro ? "Downgrade" : "Current Plan"}
      </div>
    </div>
  )
}
