import Link from "next/link"
import { YoutubeLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    href?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
    showName?: boolean
}

const SIZES = {
    sm: { box: "size-7 rounded-lg", icon: 16, text: "text-sm" },
    md: { box: "size-8 rounded-lg", icon: 18, text: "text-base" },
    lg: { box: "size-12 rounded-2xl", icon: 28, text: "text-xl" },
}

export function BrandLogo({ href = "/", size = "md", className, showName = true }: BrandLogoProps) {
    const s = SIZES[size]
    const content = (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <span className={cn("flex items-center justify-center bg-brand text-brand-foreground shadow-lg shadow-brand/25", s.box)}>
                <YoutubeLogoIcon size={s.icon} weight="fill" />
            </span>
            {showName && <span className={cn("font-semibold tracking-tight text-foreground", s.text)}>Transcripter</span>}
        </span>
    )

    if (!href) return content
    return (
        <Link href={href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
            {content}
        </Link>
    )
}
