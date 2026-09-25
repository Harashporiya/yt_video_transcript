"use client"

import Link from "next/link"
import { CheckIcon, CrownSimpleIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PlanConfig } from "./plans"

interface ProPlanCardProps {
  planKey: "monthly" | "yearly"
  plan: PlanConfig
  isPro?: boolean
  isLoading?: boolean
  onUpgrade?: (plan: "monthly" | "yearly") => void
  /** When set (e.g. on the landing page) the CTA links here instead of starting checkout */
  href?: string
}

export function ProPlanCard({ planKey, plan, isPro = false, isLoading = false, onUpgrade, href }: ProPlanCardProps) {
  const ctaClass = cn(
    "mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
    plan.highlight
      ? "bg-white text-black hover:bg-white/90"
      : "border border-white/15 text-white hover:bg-white/5"
  )

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-7",
        plan.highlight
          ? "border-brand/40 bg-gradient-to-b from-brand/[0.09] to-surface shadow-2xl shadow-brand/10"
          : "border-white/10 bg-surface"
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground shadow-lg shadow-brand/30">
          {plan.badge}
        </span>
      )}

      <h3 className="flex items-center gap-1.5 text-sm font-medium text-white/80">
        <CrownSimpleIcon size={14} weight="fill" className="text-pro" />
        {plan.label}
      </h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-white">{plan.price}</span>
        <span className="text-sm text-white/40">{plan.period}</span>
      </div>
      <p className="mt-2 text-sm text-white/55">{plan.description}</p>

      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
            <CheckIcon size={16} weight="bold" className={cn("mt-0.5 shrink-0", plan.highlight ? "text-brand" : "text-white/60")} />
            {f}
          </li>
        ))}
      </ul>

      {href ? (
        <Link href={href} className={ctaClass}>Get {plan.label}</Link>
      ) : isPro ? (
        <div className="mt-8 flex h-11 items-center justify-center gap-2 rounded-xl bg-pro/10 text-sm font-medium text-pro">
          <CrownSimpleIcon size={14} weight="fill" /> You&apos;re on Pro
        </div>
      ) : (
        <button onClick={() => onUpgrade?.(planKey)} disabled={isLoading} className={ctaClass}>
          {isLoading ? <SpinnerGapIcon size={18} className="animate-spin" weight="bold" /> : <>Upgrade to {plan.label}</>}
        </button>
      )}
    </div>
  )
}
