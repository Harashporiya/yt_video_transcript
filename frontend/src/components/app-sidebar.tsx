"use client"

import React, { useEffect, useState } from "react"
import {Sidebar,SidebarContent,SidebarFooter,SidebarHeader,SidebarMenu,SidebarMenuButton,
  SidebarMenuItem,SidebarGroup,SidebarGroupLabel,SidebarGroupContent,} from "@/components/ui/sidebar"
import { PlusIcon, VideoCameraIcon, SignOutIcon, CrownSimpleIcon, LightningIcon, CaretUpDownIcon } from "@phosphor-icons/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchVideos } from "@/store/slices/videoSlice"
import { usePlanStatus } from "@/hooks/usePlanStatus"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { videos, isLoading } = useAppSelector((s) => s.video)
  const activeVideoId = useSearchParams().get("v")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { isPro, loading: planLoading, planStatus, limits } = usePlanStatus()


  
  useEffect(() => {
    const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) {
      setProfileLoading(false);
      return;
    }

    // Load videos via Redux
    dispatch(fetchVideos(token));

    // Load user profile
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`, {
      headers: { Authorization: token }
    }).then(res => {
      if (res.data.success) setUserProfile(res.data.user);
    }).catch(console.error).finally(() => setProfileLoading(false));
  }, [])

  const loading = isLoading || profileLoading;
  const displayName = session?.user?.name || userProfile?.name || "User"
  const email = session?.user?.email || userProfile?.email
  const used = planStatus?.videosUsedThisMonth ?? 0
  const videoLimit = limits.videoLimit
  const usagePct = Math.min(100, Math.round((used / Math.max(videoLimit, 1)) * 100))

  return (
    <Sidebar className="border-r border-white/[0.08] text-white" {...props}>
      <SidebarHeader className="gap-3 p-3">
        <div className="flex items-center justify-between px-1 pt-1">
          <BrandLogo href="/dashboard" size="sm" />
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          <PlusIcon size={16} weight="bold" />
          New video
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2 custom-scrollbar">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-white/40">
            Your videos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
                    <div className="h-7 aspect-video rounded bg-white/[0.06] animate-pulse shrink-0" />
                    <div className="h-2.5 flex-1 rounded-full bg-white/[0.06] animate-pulse" />
                  </div>
                ))
              ) : videos.length === 0 ? (
                <div className="mx-1 rounded-xl border border-dashed border-white/10 px-3 py-5 text-center">
                  <VideoCameraIcon size={20} className="mx-auto text-white/25" />
                  <p className="mt-2 text-xs text-white/40">Videos you process will show up here.</p>
                </div>
              ) : (
                videos.map(v => {
                  const active = v.videoId === activeVideoId
                  return (
                    <SidebarMenuItem key={v.id}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => router.push(`/dashboard?v=${v.videoId}`)}
                        title={v.title || v.videoId}
                        className={`h-auto gap-2.5 rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${active ? '!bg-white/10 !text-white' : 'text-white/65 hover:!bg-white/5 hover:!text-white'}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="h-7 aspect-video rounded object-cover ring-1 ring-white/10 shrink-0"
                          onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` }}
                        />
                        <span className="truncate flex-1 text-left">{v.title || v.videoId}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-white/[0.08] p-3">
        {/* Plan usage */}
        {!planLoading && planStatus && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-white/80">
                {isPro ? <CrownSimpleIcon size={13} weight="fill" className="text-pro" /> : <LightningIcon size={13} weight="fill" className="text-white/50" />}
                {isPro ? "Pro plan" : "Free plan"}
              </span>
              <span className="font-mono text-white/45">{used}/{videoLimit} videos</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={videoLimit} aria-label="Videos used">
              <div className={`h-full rounded-full transition-all ${usagePct >= 100 ? 'bg-pro' : 'bg-white/60'}`} style={{ width: `${usagePct}%` }} />
            </div>
            {!isPro && (
              <button
                onClick={() => router.push("/pricing")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-pro py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
              >
                <CrownSimpleIcon size={12} weight="fill" /> Upgrade to Pro
              </button>
            )}
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 rounded-xl px-2 hover:!bg-white/5 data-[state=open]:!bg-white/5">
                  {loading ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="size-8 shrink-0 rounded-full bg-white/10 animate-pulse" />
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
                        <div className="h-2 w-32 rounded bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-orange-500 text-sm font-semibold text-white">
                        {displayName[0]?.toUpperCase()}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="truncate text-sm font-medium text-white/90">{displayName}</span>
                        <span className="truncate text-xs text-white/45">{email}</span>
                      </span>
                      <CaretUpDownIcon size={14} className="shrink-0 text-white/40" />
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-white/10 bg-surface p-1 text-white shadow-2xl">
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-white/75 focus:bg-white/10 focus:text-white"
                  onClick={() => router.push("/pricing")}
                >
                  {isPro
                    ? <><CrownSimpleIcon size={16} className="text-pro" weight="fill" /> Manage plan</>
                    : <><LightningIcon size={16} className="text-pro" weight="fill" /> Upgrade plan</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-white/75 focus:bg-white/10 focus:text-white"
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
