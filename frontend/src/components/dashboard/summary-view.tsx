import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { SpinnerGapIcon } from "@phosphor-icons/react"

interface SummaryViewProps {
    activeVideoId: string
}

export function SummaryView({ activeVideoId }: SummaryViewProps) {
    const { data: session } = useSession()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!activeVideoId) return
        setData(null)
        fetchSummary()
    }, [activeVideoId])

    const fetchSummary = async () => {
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '')
        if (!token) return

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
            setData({ error: "Error fetching summary. Please make sure the video is processed." })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-white/50 p-4">
                <SpinnerGapIcon className="animate-spin" size={20} /> Generating summary...
            </div>
        )
    }
    if (!data) return null
    if (data.error) {
        return <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl">{data.error}</div>
    }

    const keypoints = typeof data.keypointSummary === 'string' ? JSON.parse(data.keypointSummary) : data.keypointSummary
    const keypointsText = Array.isArray(keypoints) ? keypoints.map((kp: string) => `• ${kp}`).join('\n') : ''

    return (
        <div className="bg-white/5 p-6 rounded-2xl text-white/90 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">✨</span> Video Summary
            </h3>
            {data.shortSummary && (
                <div>
                    <h4 className="font-semibold text-emerald-400 mb-2">Short Summary</h4>
                    <p className="leading-relaxed">{data.shortSummary}</p>
                </div>
            )}
            {data.longSummary && (
                <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Detailed Summary</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">{data.longSummary}</p>
                </div>
            )}
            {keypointsText && (
                <div>
                    <h4 className="font-semibold text-purple-400 mb-2">Key Takeaways</h4>
                    <pre className="font-sans whitespace-pre-wrap leading-relaxed">{keypointsText}</pre>
                </div>
            )}
        </div>
    )
}
