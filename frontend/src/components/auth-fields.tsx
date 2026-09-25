"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, SpinnerGapIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-surface px-3.5 text-[15px] text-white placeholder:text-white/30 outline-none transition-colors hover:border-white/20 focus:border-brand/60 focus:ring-3 focus:ring-brand/15 disabled:opacity-50"

interface AuthFieldProps extends React.ComponentProps<"input"> {
    label: string
    hint?: string
}

export function AuthField({ label, hint, id, className, ...props }: AuthFieldProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-white/80">{label}</label>
            <input id={id} className={cn(inputClass, className)} {...props} />
            {hint && <p className="text-xs text-white/40">{hint}</p>}
        </div>
    )
}

export function PasswordField({ label, hint, id, className, ...props }: AuthFieldProps) {
    const [visible, setVisible] = useState(false)
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-white/80">{label}</label>
            <div className="relative">
                <input id={id} type={visible ? "text" : "password"} className={cn(inputClass, "pr-11", className)} {...props} />
                <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                    {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                </button>
            </div>
            {hint && <p className="text-xs text-white/40">{hint}</p>}
        </div>
    )
}

export function FormAlert({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
    const isError = type === "error"
    const Icon = isError ? WarningCircleIcon : CheckCircleIcon
    return (
        <div
            role={isError ? "alert" : "status"}
            className={cn(
                "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200",
                isError ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
            )}
        >
            <Icon size={18} weight="fill" className="mt-px shrink-0" />
            <span>{children}</span>
        </div>
    )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {loading && <SpinnerGapIcon className="animate-spin" size={18} weight="bold" />}
            {children}
        </button>
    )
}

export function GoogleButton() {
    const [loading, setLoading] = useState(false)
    return (
        <button
            type="button"
            disabled={loading}
            onClick={() => {
                setLoading(true)
                signIn("google", { callbackUrl: "/dashboard" })
            }}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-surface text-[15px] font-medium text-white transition-colors hover:border-white/20 hover:bg-surface-2 disabled:opacity-60"
        >
            {loading ? (
                <SpinnerGapIcon className="animate-spin" size={18} weight="bold" />
            ) : (
                <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
                    <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1z" />
                    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
                </svg>
            )}
            Continue with Google
        </button>
    )
}

export function OrDivider() {
    return (
        <div className="flex items-center gap-3 text-xs text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            or continue with email
            <span className="h-px flex-1 bg-white/10" />
        </div>
    )
}
