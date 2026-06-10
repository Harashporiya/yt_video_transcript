"use client"

import { CrownSimpleIcon, LightningIcon } from "@phosphor-icons/react"

interface PricingHeroProps {
  isPro: boolean
  planExpiry?: string | null
  loading: boolean
  planStatus: any
}

export function PricingHero({ isPro, planExpiry, loading, planStatus }: PricingHeroProps) {
  return (
    <div className="flex flex-col items-center text-center mb-12 max-w-2xl w-full">
      {/* Title */}
      <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm font-semibold mb-6">
        <CrownSimpleIcon size={16} weight="fill" />
        Upgrade to Pro
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Unlock the full power of
        <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent"> AI</span>
      </h1>
      <p className="text-white/50 text-lg">
        Process unlimited videos, chat without limits, and get the most out of your learning.
      </p>

      {/* Current Plan Badge */}
      {!loading && planStatus && (
        <div
          className={`mt-8 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
            isPro
              ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
              : "bg-white/5 border border-white/10 text-white/50"
          }`}
        >
          {isPro ? (
            <>
              <CrownSimpleIcon size={16} weight="fill" />
              Pro Plan Active
              {planExpiry && (
                <span className="text-violet-400/60 font-normal">
                  · Expires{" "}
                  {new Date(planExpiry).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </>
          ) : (
            <>
              <LightningIcon size={16} weight="fill" />
              Currently on Free Plan
            </>
          )}
        </div>
      )}
    </div>
  )
}
