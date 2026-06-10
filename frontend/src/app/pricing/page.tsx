"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchPlanStatus,
  createPaymentOrder,
  verifyPayment,
  clearPaymentError,
  clearSuccessMessage,
} from "@/store/slices/paymentSlice"
import { PricingHeader } from "@/components/pricing/pricing-header"
import { PricingHero } from "@/components/pricing/pricing-hero"
import { PricingToast } from "@/components/pricing/pricing-toast"
import { FreePlanCard } from "@/components/pricing/free-plan-card"
import { ProPlanCard } from "@/components/pricing/pro-plan-card"
import { PLANS } from "@/components/pricing/plans"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { planStatus, loading, error, orderLoading, verifyLoading, successMessage } =
    useAppSelector((s) => s.payment)
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "yearly" | null>(null)

  const token =
    (session as any)?.backendToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null)

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Fetch plan status on mount
  useEffect(() => {
    if (token) dispatch(fetchPlanStatus(token))
  }, [token, dispatch])

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 5000)
      return () => clearTimeout(t)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearPaymentError()), 5000)
      return () => clearTimeout(t)
    }
  }, [error, dispatch])

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    if (!token) { router.push("/login"); return }
    setCheckoutLoading(plan)

    try {
      // Step 1: Create order from backend
      const orderResult = await dispatch(createPaymentOrder({ token, plan })).unwrap()

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "YouTube Transcripter",
        description: orderResult.planLabel,
        order_id: orderResult.orderId,
        handler: async (response: any) => {
          // Step 3: Verify payment on backend
          await dispatch(
            verifyPayment({
              token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          ).unwrap()

          // Refresh plan status
          dispatch(fetchPlanStatus(token))
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => setCheckoutLoading(null),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => { setCheckoutLoading(null) })
      rzp.open()
    } catch {
      setCheckoutLoading(null)
    }
  }

  const isPro = planStatus?.plan === "pro"

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PricingHeader />

      <div className="flex-1 flex flex-col items-center px-4 py-16">
        <PricingHero
          isPro={isPro}
          planExpiry={planStatus?.planExpiry}
          loading={loading}
          planStatus={planStatus}
        />

        <PricingToast successMessage={successMessage} error={error} />

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <FreePlanCard isPro={isPro} />

          {(["monthly", "yearly"] as const).map((planKey) => (
            <ProPlanCard
              key={planKey}
              planKey={planKey}
              plan={PLANS[planKey]}
              isPro={isPro}
              isLoading={checkoutLoading === planKey || orderLoading || verifyLoading}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>

        {/* Security Note */}
        <p className="mt-10 text-white/25 text-xs text-center max-w-sm">
          🔒 Payments are secured by Razorpay. We never store your card details.
          Cancel anytime from your account.
        </p>
      </div>
    </div>
  )
}
