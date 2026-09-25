"use client"
import React, { Suspense, useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VideoProcessor } from "@/components/dashboard/video-processor"
import { VideoChat } from "@/components/dashboard/video-chat"
import {SidebarInset,SidebarProvider,SidebarTrigger} from "@/components/ui/sidebar"
import { YoutubeLogoIcon, SpinnerGapIcon, CheckCircleIcon, VideoCameraIcon, XIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
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
        <div role="status" className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-surface/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/60 backdrop-blur">
                <CheckCircleIcon size={20} weight="fill" className="mt-px shrink-0 text-emerald-400" />
                <span className="flex-1 text-white/85">{successMessage}</span>
                <button onClick={() => dispatch(setSuccessMessage(null))} aria-label="Dismiss" className="text-white/40 hover:text-white transition-colors">
                    <XIcon size={16} weight="bold" />
                </button>
            </div>
        </div>
    )
}

function FullScreenSpinner() {
    return (
        <div className="bg-background w-full h-screen flex items-center justify-center">
            <SpinnerGapIcon className="animate-spin text-white/60" size={28} />
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
        <SidebarInset className="bg-background text-white flex flex-col h-svh overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-3 px-3 md:px-4 border-b border-white/[0.08] bg-background/80 backdrop-blur">
                <SidebarTrigger className="text-white/60 hover:bg-white/5 hover:text-white shrink-0" />
                <div className="h-5 w-px bg-white/10 shrink-0" />
                {activeVideoId ? (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {activeVideo?.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={activeVideo.thumbnail}
                                alt=""
                                className="h-8 aspect-video rounded-md object-cover ring-1 ring-white/10 shrink-0"
                                onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${activeVideoId}/mqdefault.jpg` }}
                            />
                        ) : (
                            <span className="flex h-8 aspect-video items-center justify-center rounded-md bg-surface-2 shrink-0">
                                <VideoCameraIcon size={14} className="text-white/40" />
                            </span>
                        )}
                        <h1 className="text-sm font-medium text-white/90 truncate" title={activeVideoTitle ?? ""}>
                            {activeVideoTitle}
                        </h1>
                        <a
                            href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                        >
                            <YoutubeLogoIcon size={14} weight="fill" className="text-brand" />
                            Open on YouTube
                            <ArrowSquareOutIcon size={12} />
                        </a>
                    </div>
                ) : (
                    <h1 className="text-sm font-medium text-white/70">New video</h1>
                )}
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
        return <FullScreenSpinner />
    }

    return (
        <SidebarProvider>
            <SuccessToast />
            {/* The sidebar reads ?v= to highlight the active video, so it sits inside the Suspense boundary */}
            <Suspense fallback={<FullScreenSpinner />}>
                <AppSidebar />
                <DashboardContent />
            </Suspense>
        </SidebarProvider>
    )
}
