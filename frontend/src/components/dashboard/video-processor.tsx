import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
    YoutubeLogoIcon,
    LinkIcon,
    ArrowRightIcon,
    SpinnerGapIcon,
    InfoIcon,
    LockSimpleIcon,
    WarningIcon
} from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function VideoProcessor() {
    const { data: session } = useSession()
    const router = useRouter()

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
            setError("Invalid YouTube URL");
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

    return (
        <div className="flex flex-1 flex-col items-center px-4 w-full h-full overflow-y-auto bg-black [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col items-center justify-center max-w-4xl w-full flex-1 pt-10 pb-6 relative">
                
                {/* Video Limit Banner */}
                {limitReached && (
                    <div className="absolute top-0 w-full px-4 pt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                            <div className="bg-amber-500/20 p-2 rounded-full shrink-0 mt-0.5">
                                <LockSimpleIcon size={18} className="text-amber-400" weight="bold" />
                            </div>
                            <div className="flex-1">
                                <p className="text-amber-400 font-semibold text-sm">Video Limit Reached</p>
                                <p className="text-amber-400/70 text-xs mt-0.5 leading-relaxed">
                                    You have hit your video limit. You can only upload <span className="font-bold text-amber-400">1 video</span> — no more uploads allowed.
                                </p>
                            </div>
                            <button onClick={() => setLimitReached(false)} className="text-amber-400/50 hover:text-amber-400 transition-colors shrink-0 text-lg leading-none">&times;</button>
                        </div>
                    </div>
                )}

                {/* Generic Error */}
                {error && (
                    <div className="absolute top-0 w-full px-4 pt-4 z-50">
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
                            <InfoIcon className="h-4 w-4" weight="bold" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white/5 p-4 rounded-full mb-6 ring-1 ring-white/10 shadow-lg shadow-white/5">
                        <YoutubeLogoIcon size={42} className="text-white" weight="fill" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white text-center tracking-tight mb-3">
                        How can I help you understand videos today?
                    </h1>
                    <p className="text-white/50 text-center max-w-lg text-sm md:text-base leading-relaxed">
                        Your personal AI assistant for YouTube. Paste any video link to get transcripts, summaries, chat, and interview questions.
                    </p>
                </div>

                {/* Input Section */}
                <div className="w-full max-w-3xl relative mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                    <div className="bg-[#0a0a0a] rounded-[24px] flex flex-col p-3 shadow-2xl border border-white/5 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20 transition-all duration-300">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <LinkIcon size={22} className="text-white/40 shrink-0" weight="bold" />
                            <input
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Paste a YouTube link here (e.g., https://youtu.be/...)"
                                className="w-full bg-transparent text-white placeholder:text-white/30 outline-none h-10 overflow-hidden text-lg font-medium"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <span className="text-[11px] text-white/30 px-3 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    AI Ready
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={processVideo}
                                    disabled={loading || !videoUrl}
                                    className="h-10 px-5 bg-white text-black hover:text-black rounded-full hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-md active:scale-95"
                                >
                                    <span>{loading ? "Processing..." : "Process Video"}</span>
                                    {loading ? <SpinnerGapIcon className="animate-spin" size={18} weight="bold" /> : <ArrowRightIcon size={18} weight="bold" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    )
}
