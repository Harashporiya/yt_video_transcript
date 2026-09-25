"use client"

import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react"

interface PricingToastProps {
  successMessage: string | null
  error: string | null
}

export function PricingToast({ successMessage, error }: PricingToastProps) {
  return (
    <>
      {successMessage && (
        <div role="status" className="mb-8 flex w-full max-w-md items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-emerald-300 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircleIcon size={20} weight="fill" className="shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-8 flex w-full max-w-md items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-300 animate-in fade-in slide-in-from-top-1 duration-200">
          <WarningCircleIcon size={20} weight="fill" className="shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </>
  )
}
