"use client"

import React, { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { 
  YoutubeLogoIcon, 
  PlusIcon, 
  VideoCameraIcon, 
  ClockCounterClockwiseIcon,
  StarIcon,
  SidebarSimpleIcon,
  TrashIcon,
  DotsThreeIcon,
  ListBulletsIcon,
  ChatCircleTextIcon,
  SignOutIcon
} from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import axios from "axios"
import { useRouter } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/videos`, {
            headers: { Authorization: token }
        }).then(res => {
            if (res.data.success) {
                setVideos(res.data.videos)
            }
        }).catch(err => console.error("Failed to fetch history:", err))

        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`, {
            headers: { Authorization: token }
        }).then(res => {
            if (res.data.success) {
                setUserProfile(res.data.user)
            }
        }).catch(err => console.error("Failed to fetch profile:", err))
    }
  }, [session])

  const executeDelete = async (videoId: string) => {
    const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) return;

    try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/delete/${videoId}`, {
            headers: { Authorization: token }
        });
        setVideos(prev => prev.filter(v => v.videoId !== videoId));
        setConfirmDeleteId(null);
        // If the deleted video is currently active, redirect to dashboard
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("v") === videoId) {
            router.push('/dashboard');
        }
    } catch (error) {
        console.error("Failed to delete video:", error);
        alert("Failed to delete video");
    }
  }

  return (
    <Sidebar className="border-r-0 !bg-[#171717] text-white w-[260px]" {...props}>
      <SidebarHeader className="p-3 pb-0 !bg-[#171717]">
        <SidebarMenu>
          <SidebarMenuItem className="mb-4 mt-1 flex items-center justify-between w-full px-2">
            <div 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 hover:bg-[#212121] hover:text-white px-2 py-1.5 rounded-lg cursor-pointer text-white/90 transition-colors flex-1"
            >
              <YoutubeLogoIcon size={24} className="text-red-500" weight="fill" />
              <span className="font-semibold text-sm tracking-wide">YouTube AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-white/70 hover:text-white rounded-md hover:bg-[#212121] transition-colors">
                <SidebarSimpleIcon size={18} />
              </button>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="px-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white text-black hover:text-black px-4 py-2.5 text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <PlusIcon size={16} weight="bold" />
              New Video Process
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="!bg-[#171717] px-3 pt-4 custom-scrollbar">
        <SidebarGroup className="mt-2 px-1">
          <SidebarGroupLabel className="text-xs font-semibold text-white/50 px-2 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <ClockCounterClockwiseIcon size={14} weight="bold" /> Recent Videos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-1 mt-1">
              {videos.length === 0 && (
                <div className="text-white/30 text-xs px-2 py-1">No videos processed yet.</div>
              )}
              {videos.map(v => (
                  <SidebarMenuButton 
                    key={v.id} 
                    onClick={() => router.push(`?v=${v.videoId}`)}
                    className="hover:bg-[#212121] hover:text-white text-white/80 text-sm h-9 rounded-lg font-medium flex items-center gap-2.5 cursor-pointer group relative"
                  >
                     <VideoCameraIcon size={16} className="shrink-0 text-red-400" />
                     <span className="truncate flex-1 text-left pr-6">{v.title || v.videoId}</span>
                     
                     <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
                          <DropdownMenuTrigger asChild>
                            <div role="button" className="p-1 hover:text-white text-white/50 rounded-md hover:bg-white/10 z-10 flex items-center justify-center cursor-pointer">
                                <DotsThreeIcon size={20} weight="bold" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-[#2f2f2f] text-white border-white/10 rounded-xl shadow-xl overflow-hidden p-1">
                            {confirmDeleteId === v.videoId ? (
                                <div className="flex flex-col gap-1">
                                    <div className="text-[10px] text-white/50 font-bold px-2 py-1.5 uppercase tracking-wider text-center">Are you sure?</div>
                                    <DropdownMenuItem 
                                      className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center justify-center gap-2 rounded-lg font-medium py-2 px-2.5"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          executeDelete(v.videoId);
                                      }}
                                    >
                                      Yes, Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer flex items-center justify-center gap-2 rounded-lg font-medium py-2 px-2.5"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setConfirmDeleteId(null);
                                      }}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                </div>
                            ) : (
                                <>
                                  <DropdownMenuItem 
                                    className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer flex items-center gap-2.5 rounded-lg font-medium py-2 px-2.5 mb-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`?v=${v.videoId}&action=summary`);
                                    }}
                                  >
                                    <ListBulletsIcon size={16} weight="bold" />
                                    Show Summary
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer flex items-center gap-2.5 rounded-lg font-medium py-2 px-2.5 mb-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`?v=${v.videoId}&action=interview`);
                                    }}
                                  >
                                    <ChatCircleTextIcon size={16} weight="bold" />
                                    Interview Questions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-2.5 rounded-lg font-medium py-2 px-2.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setConfirmDeleteId(v.videoId);
                                    }}
                                  >
                                    <TrashIcon size={16} weight="bold" />
                                    Delete Video
                                  </DropdownMenuItem>
                                </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </SidebarMenuButton>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="!bg-[#171717] p-3 pb-4 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-[#212121] hover:text-white h-[52px] rounded-xl px-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white font-bold text-sm shadow-sm">
                      {(session?.user?.name || userProfile?.name || "U")[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden text-left">
                      <span className="text-sm font-semibold text-white/90 truncate">{session?.user?.name || userProfile?.name || "User"}</span>
                      <span className="text-xs text-white/50 font-medium truncate">{session?.user?.email || userProfile?.email || "Free Plan"}</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px] bg-[#212121] border-white/10 text-white rounded-xl shadow-xl p-1 mb-2">
                <DropdownMenuItem 
                  className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer flex items-center gap-2.5 rounded-lg font-medium py-2 px-2.5"
                  onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      signOut({ callbackUrl: "/login" });
                  }}
                >
                  <SignOutIcon size={16} weight="bold" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
