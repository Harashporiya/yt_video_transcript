"use client"

import Link from "next/link"
import { CheckIcon } from "@phosphor-icons/react"
import { FREE_PLAN } from "./plans"

interface FreePlanCardProps {
  isPro?: boolean
  /** When set (e.g. on the landing page) the card links here instead of showing plan status */
  href?: string
}

export function FreePlanCard({ isPro = false, href }: FreePlanCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-surface p-7">
      <h3 className="text-sm font-medium text-white/60">{FREE_PLAN.label}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-white">{FREE_PLAN.price}</span>
        <span className="text-sm text-white/40">{FREE_PLAN.period}</span>
      </div>
      <p className="mt-2 text-sm text-white/45">{FREE_PLAN.description}</p>

      <ul className="mt-7 flex-1 space-y-3">
        {FREE_PLAN.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
            <CheckIcon size={16} weight="bold" className="mt-0.5 shrink-0 text-white/35" />
            {f}
          </li>
        ))}
      </ul>

      {href ? (
        <Link
          href={href}
          className="mt-8 flex h-11 items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white transition-colors hover:bg-white/5"
        >
          Start for free
        </Link>
      ) : (
        <div className="mt-8 flex h-11 items-center justify-center rounded-xl bg-white/[0.04] text-sm font-medium text-white/40">
          {isPro ? "Included" : "Your current plan"}
        </div>
      )}
    </div>
  )
}
