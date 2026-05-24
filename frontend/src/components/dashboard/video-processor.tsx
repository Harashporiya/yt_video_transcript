import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { 
    YoutubeLogoIcon, 
    TextAaIcon, 
    ChatCircleTextIcon, 
    ListBulletsIcon, 
    LinkIcon, 
    ArrowRightIcon,
    SpinnerGapIcon,
    LightbulbIcon
} from "@phosphor-icons/react"

export function VideoProcessor() {
    const { data: session } = useSession()
    const router = useRouter()
    
    const [videoUrl, setVideoUrl] = useState("")
    const [loading, setLoading] = useState(false)

    const extractVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const processVideo = async () => {
        if (!videoUrl) return;
        const vId = extractVideoId(videoUrl);
        if (!vId) {
            alert("Invalid YouTube URL");
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
        } catch (error) {
            console.error(error);
            alert("Failed to process video");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col items-center px-4 w-full h-full overflow-y-auto bg-[#212121]">
            <div className="flex flex-col items-center justify-center max-w-4xl w-full flex-1 pt-10 pb-6">
                
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
                    <div className="bg-[#2f2f2f] rounded-[24px] flex flex-col p-3 shadow-2xl border border-white/5 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20 transition-all duration-300">
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

                {/* Features Grid (ChatGPT Style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-auto pb-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    
                    <div className="flex flex-col items-start gap-2.5 p-5 rounded-2xl border border-white/5 bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-default group">
                        <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
                            <ChatCircleTextIcon size={20} className="text-purple-400" weight="fill" />
                            <span>Interactive Chat</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                            Ask specific questions about the video content. The AI acts as an expert on the video, ready to explain complex concepts or find exact details for you.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-start gap-2.5 p-5 rounded-2xl border border-white/5 bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-default group">
                        <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
                            <ListBulletsIcon size={20} className="text-emerald-400" weight="fill" />
                            <span>Smart Summary</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                            Don&apos;t have time to watch a 2-hour lecture? Get AI-generated structured summaries and key takeaways instantly.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 p-5 rounded-2xl border border-white/5 bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-default group">
                        <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
                            <LightbulbIcon size={20} className="text-amber-400" weight="fill" />
                            <span>AI Interview Prep</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                            Automatically generate categorized practice questions (Easy, Medium, Hard) based on educational or tutorial videos to test your knowledge.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-start gap-2.5 p-5 rounded-2xl border border-white/5 bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-default group">
                        <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
                            <TextAaIcon size={20} className="text-blue-400" weight="fill" />
                            <span>Full Transcript</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                            Extract and read the complete spoken text directly from the video. Easily search for specific keywords or quotes without scrubbing the timeline.
                        </p>
                    </div>

                </div>
                
            </div>
        </div>
    )
}
