"use client"
import React, { Suspense, useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VideoProcessor } from "@/components/dashboard/video-processor"
import { VideoChat } from "@/components/dashboard/video-chat"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    YoutubeLogoIcon,
    SpinnerGapIcon,
    CheckCircleIcon,
    VideoCameraIcon,
} from "@phosphor-icons/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { isTokenValid } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setSuccessMessage } from "@/store/slices/videoSlice"

function SuccessToast() {
    const dispatch = useAppDispatch()
    const successMessage = useAppSelector((s) => s.video.successMessage)

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(setSuccessMessage(null)), 4000)
            return () => clearTimeout(timer)
        }
    }, [successMessage, dispatch])

    if (!successMessage) return null

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3 bg-[#0d1a0d] border border-green-500/40 text-green-400 px-5 py-3.5 rounded-2xl shadow-2xl shadow-green-500/10 backdrop-blur-sm">
                <CheckCircleIcon size={20} weight="fill" className="text-green-400 shrink-0" />
                <span className="text-sm font-semibold">{successMessage}</span>
            </div>
        </div>
    )
}

function DashboardContent() {
    const searchParams = useSearchParams()
    const activeVideoId = searchParams.get("v")
    const videos = useAppSelector((s) => s.video.videos)

    const activeVideo = videos.find(v => v.videoId === activeVideoId)
    const activeVideoTitle = activeVideo?.title || activeVideoId

    return (
        <SidebarInset className="bg-black text-white flex flex-col h-screen overflow-hidden">
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 bg-black border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                    <SidebarTrigger className="text-white hover:bg-white/5 hover:text-white shrink-0" />
                    {activeVideoId ? (
                        // Show active video title when chatting
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors text-lg font-semibold text-white/90 shrink-0">
                                <YoutubeLogoIcon size={22} className="text-white" weight="fill" />
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-0 max-w-[420px]">
                                <VideoCameraIcon size={15} className="text-red-400 shrink-0" />
                                <span className="text-sm font-medium text-white/80 truncate" title={activeVideoTitle ?? ""}>
                                    {activeVideoTitle}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Default logo when no video selected
                        <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors text-lg font-semibold text-white/90">
                            <YoutubeLogoIcon size={24} className="text-white" weight="fill" />
                            <span>Transcripter</span>
                        </div>
                    )}
                </div>
            </header>

            {!activeVideoId ? (
                <VideoProcessor />
            ) : (
                <VideoChat activeVideoId={activeVideoId} />
            )}
        </SidebarInset>
    )
}

export default function Page() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

    useEffect(() => {
        const checkAuth = () => {
            if (status === "loading") return;

            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const nextAuthToken = (session as any)?.backendToken;

            if (status === "authenticated") {
                if (nextAuthToken) {
                    if (isTokenValid(nextAuthToken)) {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        signOut({ callbackUrl: "/login" });
                    }
                } else {
                    signOut({ callbackUrl: "/login" });
                }
            } else if (status === "unauthenticated") {
                if (token && isTokenValid(token)) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                }
            }
        };

        checkAuth();
        const interval = setInterval(checkAuth, 5000);
        return () => clearInterval(interval);
    }, [status, session, router]);

    if (!isAuthenticated) {
        return <div className="bg-black text-white w-full h-screen flex items-center justify-center"><SpinnerGapIcon className="animate-spin" size={32} /></div>
    }

    return (
        <SidebarProvider>
            <SuccessToast />
            <AppSidebar />
            <Suspense fallback={<div className="bg-black text-white w-full h-screen flex items-center justify-center"><SpinnerGapIcon className="animate-spin" size={32} /></div>}>
                <DashboardContent />
            </Suspense>
        </SidebarProvider>
    )
}
