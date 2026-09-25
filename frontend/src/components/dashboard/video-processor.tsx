import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
    LinkIcon,
    ArrowRightIcon,
    SpinnerGapIcon,
    LockSimpleIcon,
    SparkleIcon,
    WarningCircleIcon,
    XIcon,
    CrownSimpleIcon,
    ListBulletsIcon,
    ChatCircleTextIcon,
    TargetIcon,
} from "@phosphor-icons/react"
import { useAppDispatch } from "@/store/hooks"
import { fetchVideos, setSuccessMessage } from "@/store/slices/videoSlice"
import { usePlanStatus } from "@/hooks/usePlanStatus"

export function VideoProcessor() {
    const { data: session } = useSession()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { isPro } = usePlanStatus()

    const [videoUrl, setVideoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [limitReached, setLimitReached] = useState(false)

    const extractVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const processVideo = async () => {
        setError(null);
        setLimitReached(false);
        if (!videoUrl) return;
        const vId = extractVideoId(videoUrl);
        if (!vId) {
            setError("That doesn't look like a YouTube link. Try a youtube.com/watch or youtu.be URL.");
            return;
        }

        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/video-url`, {
                videoUrl
            }, {
                headers: { Authorization: token }
            });

            await dispatch(fetchVideos(token));

            dispatch(setSuccessMessage("Video processed successfully! You can now chat, summarize, and generate interview questions."));

            router.push(`?v=${vId}`);
            setVideoUrl("");
        } catch (error: any) {
            console.error(error);
            if (error?.response?.data?.limitReached) {
                setLimitReached(true);
            } else {
                setError(error?.response?.data?.message || "Failed to process video");
            }
        } finally {
            setLoading(false);
        }
    }

    const previewId = extractVideoId(videoUrl)

    return (
        <div className="relative flex flex-1 flex-col items-center px-4 w-full h-full overflow-y-auto no-scrollbar">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,#000_40%,transparent_100%)]" />
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-[36rem] max-w-full rounded-full bg-brand/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-center max-w-2xl w-full flex-1 py-12">

                {/* Header Section */}
                <div className="mb-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/60">
                        <SparkleIcon size={14} weight="fill" className="text-brand" />
                        Summary · Chat · Interview prep
                    </span>
                    <h1 className="text-3xl md:text-[2.5rem] font-semibold tracking-tight text-white leading-tight text-balance">
                        What do you want to learn today?
                    </h1>
                    <p className="mt-3 text-white/50 max-w-md text-[15px] leading-relaxed text-pretty">
                        Paste a YouTube link. We&apos;ll read the transcript so you can skim the summary, ask questions and practise.
                    </p>
                </div>

                {/* Input Section */}
                <form
                    onSubmit={(e) => { e.preventDefault(); processVideo(); }}
                    className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150"
                >
                    <div className="rounded-2xl border border-white/10 bg-surface p-2 shadow-2xl shadow-black/50 transition-all focus-within:border-white/25 focus-within:ring-4 focus-within:ring-white/[0.04]">
                        <div className="flex items-center gap-3 pl-3">
                            <LinkIcon size={20} className="text-white/35 shrink-0" weight="bold" />
                            <label htmlFor="video-url" className="sr-only">YouTube link</label>
                            <input
                                id="video-url"
                                value={videoUrl}
                                onChange={(e) => { setVideoUrl(e.target.value); setError(null); }}
                                placeholder="https://youtube.com/watch?v=…"
                                disabled={loading}
                                autoComplete="off"
                                autoFocus
                                className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/25 outline-none h-12 text-base disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={loading || !videoUrl}
                                className="h-11 shrink-0 px-5 bg-white text-black rounded-xl hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98]"
                            >
                                {loading ? <SpinnerGapIcon className="animate-spin" size={16} weight="bold" /> : null}
                                <span className="hidden sm:inline">{loading ? "Processing" : "Process video"}</span>
                                {!loading && <ArrowRightIcon size={16} weight="bold" />}
                            </button>
                        </div>

                        {/* Live preview of the pasted video */}
                        {previewId && (
                            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/40 p-2 animate-in fade-in duration-300">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                                    alt="Video thumbnail"
                                    className="h-14 aspect-video rounded-lg object-cover ring-1 ring-white/10"
                                />
                                <div className="min-w-0 flex-1">
                                    {loading ? (
                                        <ProcessingStatus />
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-white/85">Ready to process</p>
                                            <p className="text-xs text-white/40 truncate">Video ID · <span className="font-mono">{previewId}</span></p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Error */}
                {error && (
                    <div role="alert" className="mt-4 w-full flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-1 duration-200">
                        <WarningCircleIcon size={18} weight="fill" className="mt-px shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} aria-label="Dismiss" className="text-red-300/60 hover:text-red-200"><XIcon size={16} weight="bold" /></button>
                    </div>
                )}

                {/* Video Limit Banner */}
                {limitReached && (
                    <div role="alert" className="mt-4 w-full rounded-xl border border-pro/25 bg-pro/[0.07] p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="rounded-lg bg-pro/15 p-2 shrink-0">
                            <LockSimpleIcon size={16} className="text-pro" weight="bold" />
                        </span>
                        <div className="flex-1">
                            <p className="text-pro font-semibold text-sm">Video limit reached</p>
                            <p className="text-white/55 text-sm mt-0.5 leading-relaxed">
                                {isPro
                                    ? "You've used every video in your current billing period. Your limit resets when the next period starts."
                                    : "The free plan includes 1 video. Upgrade to Pro to process more videos and ask more questions."}
                            </p>
                            {!isPro && (
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="mt-3 inline-flex items-center gap-1.5 text-sm bg-pro hover:brightness-110 text-black font-semibold px-3.5 py-1.5 rounded-lg transition"
                                >
                                    <CrownSimpleIcon size={14} weight="fill" /> See Pro plans
                                </button>
                            )}
                        </div>
                        <button onClick={() => setLimitReached(false)} aria-label="Dismiss" className="text-white/40 hover:text-white transition-colors shrink-0"><XIcon size={16} weight="bold" /></button>
                    </div>
                )}

                {/* What you get */}
                {!loading && (
                    <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 animate-in fade-in duration-700 delay-300">
                        {[
                            { icon: ListBulletsIcon, title: "Summary", desc: "Short, detailed & key takeaways" },
                            { icon: ChatCircleTextIcon, title: "Chat", desc: "Ask anything about the video" },
                            { icon: TargetIcon, title: "Interview prep", desc: "Practice questions by level" },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                                <Icon size={18} weight="duotone" className="text-white/60" />
                                <p className="mt-3 text-sm font-medium text-white/85">{title}</p>
                                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const STAGES = [
    "Fetching the transcript…",
    "Writing the summary…",
    "Indexing the video for chat…",
    "Almost there…",
]

// Processing takes a while; rotate through what the backend is doing so the wait feels alive.
function ProcessingStatus() {
    const [stage, setStage] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => setStage(s => Math.min(s + 1, STAGES.length - 1)), 6000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div aria-live="polite">
            <p className="text-sm font-medium text-white/85">{STAGES[stage]}</p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/3 rounded-full bg-brand animate-[shimmer_1.6s_ease-in-out_infinite]" />
            </div>
        </div>
    )
}
