import { ChatCircleTextIcon, ListBulletsIcon, TargetIcon } from "@phosphor-icons/react/dist/ssr"
import { BrandLogo } from "@/components/brand-logo"

const HIGHLIGHTS = [
    { icon: ListBulletsIcon, title: "Structured summaries", desc: "Short, detailed and key takeaways for every video." },
    { icon: ChatCircleTextIcon, title: "Chat with the video", desc: "Answers grounded in what was actually said." },
    { icon: TargetIcon, title: "Interview practice", desc: "Easy, medium and hard questions with answers." },
]

interface AuthShellProps {
    title: string
    subtitle: string
    children: React.ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            {/* Brand panel */}
            <aside className="relative hidden overflow-hidden border-r border-white/10 bg-surface lg:flex lg:flex-col lg:justify-between p-12">
                <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,#000_30%,transparent_75%)]" />
                <div className="absolute -left-32 -top-32 size-96 rounded-full bg-brand/15 blur-3xl" />

                <BrandLogo className="relative" />

                <div className="relative max-w-md">
                    <h2 className="text-4xl font-semibold tracking-tight text-white leading-tight">
                        Stop scrubbing timelines.
                        <span className="block text-white/40">Start understanding.</span>
                    </h2>
                    <ul className="mt-10 space-y-6">
                        {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                            <li key={title} className="flex gap-4">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                    <Icon size={18} className="text-brand" weight="duotone" />
                                </span>
                                <div>
                                    <p className="font-medium text-white">{title}</p>
                                    <p className="text-sm text-white/50">{desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-white/30">© {new Date().getFullYear()} Transcripter</p>
            </aside>

            {/* Form */}
            <main className="flex flex-col items-center justify-center px-6 py-12">
                <div className="flex w-full max-w-[380px] flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <BrandLogo className="lg:hidden" />
                        <div className="space-y-1.5">
                            <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
                            <p className="text-sm text-white/50">{subtitle}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    )
}
