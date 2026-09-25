"use client"

import { ArrowLeftIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"

export function PricingHeader() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <BrandLogo href="/dashboard" size="sm" />
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          Back
        </button>
      </div>
    </header>
  )
}
