"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchPlanStatus } from "@/store/slices/paymentSlice"

export function usePlanStatus() {
  const { data: session } = useSession()
  const dispatch = useAppDispatch()
  const { planStatus, loading, error } = useAppSelector((s) => s.payment)

  const token =
    (session as any)?.backendToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null)

  useEffect(() => {
    if (token && !planStatus) {
      dispatch(fetchPlanStatus(token))
    }
  }, [token, planStatus, dispatch])

  const isPro = planStatus?.plan === "pro"

  return {
    planStatus,
    isPro,
    loading,
    error,
    limits: planStatus?.limits ?? { videoLimit: 1, chatLimit: 3 },
    planExpiry: planStatus?.planExpiry ?? null,
  }
}
