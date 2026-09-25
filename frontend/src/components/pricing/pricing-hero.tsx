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
    <div className="mb-12 flex w-full max-w-2xl flex-col items-center text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
        Learn from more videos with <span className="text-brand">Pro</span>
      </h1>
      <p className="mt-4 text-lg text-white/50 text-pretty">
        More videos, more questions per video, and priority support. Pay once. No auto-renewal.
      </p>

      {/* Current Plan Badge */}
      {!loading && planStatus && (
        <div
          className={`mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
            isPro ? "border-pro/30 bg-pro/10 text-pro" : "border-white/10 bg-white/[0.03] text-white/60"
          }`}
        >
          {isPro ? (
            <>
              <CrownSimpleIcon size={15} weight="fill" />
              Pro is active
              {planExpiry && (
                <span className="font-normal text-pro/70">
                  · until{" "}
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
              <LightningIcon size={15} weight="fill" />
              You&apos;re on the Free plan
            </>
          )}
        </div>
      )}
    </div>
  )
}
