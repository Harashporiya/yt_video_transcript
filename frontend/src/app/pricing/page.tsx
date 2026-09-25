"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {fetchPlanStatus,createPaymentOrder,verifyPayment,clearPaymentError,clearSuccessMessage} from "@/store/slices/paymentSlice"
import { PricingHeader } from "@/components/pricing/pricing-header"
import { PricingHero } from "@/components/pricing/pricing-hero"
import { PricingToast } from "@/components/pricing/pricing-toast"
import { FreePlanCard } from "@/components/pricing/free-plan-card"
import { ProPlanCard } from "@/components/pricing/pro-plan-card"
import { PLANS } from "@/components/pricing/plans"
import { LockSimpleIcon } from "@phosphor-icons/react"

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

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    if (token) dispatch(fetchPlanStatus(token))
  }, [token, dispatch])

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
      const orderResult = await dispatch(createPaymentOrder({ token, plan })).unwrap()

    
      const options = {
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "Transcripter",
        description: orderResult.planLabel,
        order_id: orderResult.orderId,
        handler: async (response: any) => {
          await dispatch(
            verifyPayment({
              token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          ).unwrap()

          dispatch(fetchPlanStatus(token))
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#e5383b" },
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
    <div className="relative min-h-screen bg-background text-white flex flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,#000_30%,transparent_100%)]" />
      <PricingHeader />

      <main className="relative flex-1 flex flex-col items-center px-4 py-16 md:py-20">
        <PricingHero
          isPro={isPro}
          planExpiry={planStatus?.planExpiry}
          loading={loading}
          planStatus={planStatus}
        />

        <PricingToast successMessage={successMessage} error={error} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl items-stretch">
          {/* Logged-out visitors get a sign-up link instead of "Your current plan" */}
          <FreePlanCard isPro={isPro} href={token ? undefined : "/signup"} />

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

        <p className="mt-10 flex items-center gap-2 text-xs text-white/35 text-center">
          <LockSimpleIcon size={14} weight="bold" />
          Payments are handled securely by Razorpay. We never see or store your card details.
        </p>
      </main>
    </div>
  )
}
