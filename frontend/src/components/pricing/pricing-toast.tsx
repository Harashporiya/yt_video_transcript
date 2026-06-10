"use client"

import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react"

interface PricingToastProps {
  successMessage: string | null
  error: string | null
}

export function PricingToast({ successMessage, error }: PricingToastProps) {
  return (
    <>
      {successMessage && (
        <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4 flex items-center gap-3 text-green-400 max-w-md w-full">
          <CheckCircleIcon size={20} weight="fill" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 flex items-center gap-3 text-red-400 max-w-md w-full">
          <XCircleIcon size={20} weight="fill" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </>
  )
}
