"use client"

import {
  CheckCircleIcon,
  CrownSimpleIcon,
  SpinnerGapIcon,
  InfinityIcon,
} from "@phosphor-icons/react"
import { PlanConfig } from "./plans"

interface ProPlanCardProps {
  planKey: "monthly" | "yearly"
  plan: PlanConfig
  isPro: boolean
  isLoading: boolean
  onUpgrade: (plan: "monthly" | "yearly") => void
}

export function ProPlanCard({ planKey, plan, isPro, isLoading, onUpgrade }: ProPlanCardProps) {
  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${plan.color} ${plan.border} p-7 flex flex-col relative overflow-hidden`}
    >
      {/* Best value badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 bg-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider">
          {plan.badge}
        </div>
      )}

      {/* Plan info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{plan.label}</h3>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          <span className="text-white/50 text-sm mb-1.5">{plan.period}</span>
        </div>
        <p className="text-white/60 text-sm">{plan.description}</p>
      </div>

      {/* Features list */}
      <ul className="flex-1 space-y-3 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
            <CheckCircleIcon size={16} weight="fill" className="text-green-400 shrink-0" />
            {f === "Unlimited videos" || f === "Unlimited chat messages" ? (
              <span className="flex items-center gap-1.5">
                <InfinityIcon size={14} className="text-violet-400" weight="bold" />
                {f}
              </span>
            ) : (
              f
            )}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {isPro ? (
        <button
          disabled
          className={`h-12 w-full rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60
            ${
              planKey === "yearly"
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
        >
          <CrownSimpleIcon size={16} weight="fill" />
          You already have Pro version
        </button>
      ) : (
        <button
          onClick={() => onUpgrade(planKey)}
          disabled={isLoading}
          className={`h-12 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2
            ${
              planKey === "yearly"
                ? "bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <SpinnerGapIcon size={18} className="animate-spin" weight="bold" />
          ) : (
            <>
              <CrownSimpleIcon size={16} weight="fill" />
              Upgrade to {plan.label}
            </>
          )}
        </button>
      )}
    </div>
  )
}
