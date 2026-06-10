"use client"

import { ArrowLeftIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

export function PricingHeader() {
  const router = useRouter()

  return (
    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Back
      </button>
      <span className="text-white/20">|</span>
      <span className="font-semibold text-white/90">Upgrade Plan</span>
    </div>
  )
}
