import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { CaretDownIcon } from "@phosphor-icons/react"
import { CopyButton, ErrorCard, SectionSkeleton } from "./summary-view"

interface InterviewViewProps {
    activeVideoId: string
}

export function InterviewView({ activeVideoId }: InterviewViewProps) {
    const { data: session, status } = useSession()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
    // Wait for the session to resolve so the effect doesn't fire once with a stale localStorage token and again with the session one
    const token = status === 'loading'
        ? null
        : (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)


    const generateInterviewQuestions = async () => {
        setData(null)
        setLoading(true)
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/interview/${activeVideoId}`,
                {},
                { headers: { Authorization: token } }
            )
            const questions = res.data.questions
            if (!questions) {
                setData({ error: "No questions generated." })
                return
            }
            setData(questions)
        } catch (error) {
            console.error("Error generating interview questions:", error)
            setData({ error: "Couldn't generate interview questions. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    // token is a dependency so this re-runs once the session finishes loading after a refresh
    useEffect(() => {
        if (!activeVideoId || !token) return
        // Fetching data on mount; the loading state it sets is intentional
        // eslint-disable-next-line react-hooks/set-state-in-effect
        generateInterviewQuestions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVideoId, token])

    const parseQ = (qData: any) => {
        if (!qData) return []
        if (typeof qData === 'string') {
            try { return JSON.parse(qData) } catch (e) { return [] }
        }
        return qData
    }

    if (loading || (!data && token)) {
        return <SectionSkeleton label="Preparing interview questions… this can take a few seconds the first time." />
    }
    if (!data) return null
    if (data.error) {
        return <ErrorCard message={data.error} onRetry={generateInterviewQuestions} />
    }

    const levels = LEVELS.map(level => ({ ...level, questions: parseQ(data[level.key]) as QA[] }))
        .filter(level => level.questions.length > 0)
    const total = levels.reduce((n, l) => n + l.questions.length, 0)
    const visible = filter === 'all' ? levels : levels.filter(l => l.id === filter)

    const plainText = levels.map(l =>
        `${l.label} questions\n` + l.questions.map((q, i) => `Q${i + 1}. ${q.question}\nA: ${q.answer}`).join('\n\n')
    ).join('\n\n')

    return (
        <article className="space-y-6 animate-in fade-in duration-300">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">Interview prep</h2>
                    <p className="text-sm text-white/40">{total} questions · try answering before you reveal</p>
                </div>
                <CopyButton text={plainText} />
            </header>

            <div role="tablist" aria-label="Difficulty" className="flex flex-wrap gap-2">
                <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All <span className="text-white/35">{total}</span></FilterChip>
                {levels.map(l => (
                    <FilterChip key={l.id} active={filter === l.id} onClick={() => setFilter(l.id)}>
                        <span className={`size-1.5 rounded-full ${l.dot}`} /> {l.label} <span className="text-white/35">{l.questions.length}</span>
                    </FilterChip>
                ))}
            </div>

            {visible.map(level => (
                <section key={level.id} className="space-y-2">
                    {filter === 'all' && (
                        <h3 className="flex items-center gap-2 pt-2 text-sm font-semibold text-white/70">
                            <span className={`size-1.5 rounded-full ${level.dot}`} /> {level.label}
                        </h3>
                    )}
                    {level.questions.map((q, i) => (
                        <details key={i} className="group rounded-xl border border-white/[0.07] bg-white/[0.02] open:border-white/15 open:bg-white/[0.04] transition-colors">
                            <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                                <span className="mt-0.5 shrink-0 font-mono text-xs text-white/35">Q{i + 1}</span>
                                <span className="flex-1 text-[15px] font-medium leading-relaxed text-white/90">{q.question}</span>
                                <span className="mt-0.5 shrink-0 text-xs text-white/35 group-open:hidden">Reveal answer</span>
                                <CaretDownIcon size={16} className="mt-1 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 pl-11">
                                <p className="text-[15px] leading-relaxed text-white/70 whitespace-pre-wrap">{q.answer}</p>
                            </div>
                        </details>
                    ))}
                </section>
            ))}
        </article>
    )
}

interface QA { question: string; answer: string }

const LEVELS = [
    { id: 'easy', key: 'easyQuestions', label: 'Easy', dot: 'bg-emerald-400' },
    { id: 'medium', key: 'mediumQuestions', label: 'Medium', dot: 'bg-amber-400' },
    { id: 'hard', key: 'hardQuestions', label: 'Hard', dot: 'bg-red-400' },
] as const

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${active ? 'border-white/20 bg-white/10 text-white' : 'border-white/[0.08] text-white/55 hover:bg-white/5 hover:text-white/80'}`}
        >
            {children}
        </button>
    )
}
