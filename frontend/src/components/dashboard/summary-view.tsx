import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { SpinnerGapIcon, CopyIcon, CheckIcon, WarningCircleIcon, ArrowClockwiseIcon } from "@phosphor-icons/react"

interface SummaryViewProps {
    activeVideoId: string
}

export function SummaryView({ activeVideoId }: SummaryViewProps) {
    const { data: session, status } = useSession()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    // Wait for the session to resolve so the effect doesn't fire once with a stale localStorage token and again with the session one
    const token = status === 'loading'
        ? null
        : (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)


    const fetchSummary = async () => {
        setData(null)
        setLoading(true)
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/summary/${activeVideoId}`,
                { headers: { Authorization: token } }
            )
            const summary = res.data.summary
            if (!summary) {
                setData({ error: "Summary not available." })
                return
            }
            setData(summary)
        } catch (error) {
            console.error("Error fetching summary:", error)
            setData({ error: "Couldn't load the summary. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    // token is a dependency so this re-runs once the session finishes loading after a refresh
    useEffect(() => {
        if (!activeVideoId || !token) return
        // Fetching data on mount; the loading state it sets is intentional
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSummary()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVideoId, token])

    if (loading || (!data && token)) {
        return <SectionSkeleton label="Loading summary…" />
    }
    if (!data) return null
    if (data.error) {
        return <ErrorCard message={data.error} onRetry={fetchSummary} />
    }

    const keypoints: string[] = (() => {
        const kp = typeof data.keypointSummary === 'string' ? safeParse(data.keypointSummary) : data.keypointSummary
        return Array.isArray(kp) ? kp : []
    })()

    const plainText = [
        data.shortSummary && `TL;DR\n${data.shortSummary}`,
        data.longSummary && `Detailed summary\n${data.longSummary}`,
        keypoints.length > 0 && `Key takeaways\n${keypoints.map(k => `- ${k}`).join('\n')}`,
    ].filter(Boolean).join('\n\n')

    return (
        <article className="space-y-8 animate-in fade-in duration-300">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">Summary</h2>
                    <p className="text-sm text-white/40">Generated from the video transcript</p>
                </div>
                <CopyButton text={plainText} />
            </header>

            {data.shortSummary && (
                <section className="rounded-2xl border border-brand/20 bg-brand/[0.06] p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">TL;DR</p>
                    <p className="text-[15px] leading-relaxed text-white/90 text-pretty">{data.shortSummary}</p>
                </section>
            )}

            {keypoints.length > 0 && (
                <section>
                    <h3 className="mb-3 text-sm font-semibold text-white/70">Key takeaways</h3>
                    <ol className="space-y-2">
                        {keypoints.map((kp, i) => (
                            <li key={i} className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/[0.07] font-mono text-xs text-white/60">{i + 1}</span>
                                <span className="text-[15px] leading-relaxed text-white/80">{kp}</span>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {data.longSummary && (
                <section>
                    <h3 className="mb-3 text-sm font-semibold text-white/70">Detailed summary</h3>
                    <p className="text-[15px] leading-7 text-white/75 whitespace-pre-wrap text-pretty">{data.longSummary}</p>
                </section>
            )}
        </article>
    )
}

function safeParse(value: string) {
    try { return JSON.parse(value) } catch { return [] }
}

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                } catch { /* clipboard unavailable */ }
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
            {copied ? <CheckIcon size={14} weight="bold" className="text-emerald-400" /> : <CopyIcon size={14} />}
            {copied ? "Copied" : "Copy"}
        </button>
    )
}

export function SectionSkeleton({ label }: { label: string }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-live="polite">
            <p className="flex items-center gap-2 text-sm text-white/50">
                <SpinnerGapIcon className="animate-spin" size={16} /> {label}
            </p>
            <div className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
            <div className="space-y-2">
                {[0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
            <div className="space-y-2">
                <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-11/12 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-white/[0.04] animate-pulse" />
            </div>
        </div>
    )
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5">
            <p className="flex items-center gap-2 text-sm text-red-300">
                <WarningCircleIcon size={18} weight="fill" /> {message}
            </p>
            <button onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                <ArrowClockwiseIcon size={14} /> Try again
            </button>
        </div>
    )
}
