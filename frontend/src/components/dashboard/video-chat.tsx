import React, { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import {
    ListBulletsIcon,
    ArrowUpIcon,
    SpinnerGapIcon,
    ChatTeardropTextIcon,
    CrownSimpleIcon,
    SparkleIcon,
    TargetIcon,
    WarningIcon,
    CopyIcon,
    CheckIcon,
} from "@phosphor-icons/react"
import { SummaryView } from "./summary-view"
import { InterviewView } from "./interview-view"
import { usePlanStatus } from "@/hooks/usePlanStatus"

interface VideoChatProps {
    activeVideoId: string
}

export function VideoChat({ activeVideoId }: VideoChatProps) {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const router = useRouter()
    const action = searchParams.get("action")
    const { isPro, limits, loading: planLoading, planStatus } = usePlanStatus()
    const CHAT_LIMIT = limits.chatLimit 

    const [question, setQuestion] = useState("")
    const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([])
    const [chatLoading, setChatLoading] = useState(false)
    const [chatLimitReached, setChatLimitReached] = useState(false)
    const [chatCount, setChatCount] = useState(0)

    const [view, setView] = useState<'chat' | 'summary' | 'interview'>('chat')
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Keep the newest message in view
    useEffect(() => {
        if (view !== 'chat') return
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [chatHistory, chatLoading, view])

    // Grow the textarea with its content, up to its max height
    useEffect(() => {
        const el = inputRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [question])

    // Wait for the session to resolve so history doesn't load once with a stale localStorage token and again with the session one
    const token = status === 'loading'
        ? null
        : (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

    useEffect(() => {
        if (planStatus !== null) {
            setChatLimitReached(chatCount >= CHAT_LIMIT);
        }
    }, [CHAT_LIMIT, chatCount, planStatus]);

    useEffect(() => {
        setQuestion("");
        setView('chat');
        setChatHistory([]);
        setChatLimitReached(false);
        setChatCount(0);

        const initChat = async () => {
            if (!token) return;

            if (activeVideoId) {
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/chat/${activeVideoId}`, {
                        headers: { Authorization: token }
                    });
                    if (res.data.chatHistory) {
                        setChatHistory(res.data.chatHistory);

                        const userMsgCount = res.data.chatHistory.filter((m: any) => m.role === 'user').length;
                        setChatCount(userMsgCount);
                    } else {
                        setChatHistory([]);
                    }
                } catch (err) {
                    console.error("Failed to load chat history", err);
                    setChatHistory([]);
                }
            } else {
                setChatHistory([]);
            }

            if (action === 'summary') {
                setView('summary');
            } else if (action === 'interview') {
                setView('interview');
            }
        };

        initChat();
        // token is a dependency so history loads once the session finishes loading after a refresh
    }, [activeVideoId, action, token]);

    const askQuestion = async () => {
        if (!question.trim() || !activeVideoId || chatLimitReached || chatLoading) return;
        const userQ = question.trim();
        setQuestion("");
        setView('chat');

        setChatHistory(prev => [...prev, { role: "user", text: userQ }]);
        setChatLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/ask/${activeVideoId}`, {
                question: userQ
            }, {
                headers: { Authorization: token }
            });

            setChatHistory(prev => [...prev, { role: "ai", text: res.data.answer }]);
            const newCount = chatCount + 1;
            setChatCount(newCount);
        } catch (error: any) {
            console.error(error);
            if (error?.response?.data?.limitReached) {
                setChatLimitReached(true);
                setChatHistory(prev => prev.filter((_, i) => i !== prev.length - 1));
            } else {
                setChatHistory(prev => [...prev, { role: "ai", text: error?.response?.data?.message || "Sorry, I couldn't answer that right now. Please try again." }]);
            }
        } finally {
            setChatLoading(false);
        }
    }

    const remaining = Math.max(CHAT_LIMIT - chatCount, 0)
    const showTabs = chatHistory.length > 0 || view !== 'chat'

    return (
        <div className="flex flex-1 flex-col w-full h-full overflow-hidden">
            {/* View Switcher */}
            {showTabs && (
                <div className="shrink-0 border-b border-white/[0.06] px-4">
                    <div role="tablist" aria-label="Video tools" className="mx-auto flex max-w-3xl gap-1 py-2.5 overflow-x-auto no-scrollbar">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                role="tab"
                                aria-selected={view === id}
                                onClick={() => setView(id)}
                                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                            >
                                <Icon size={16} weight={view === id ? 'fill' : 'regular'} className={view === id ? 'text-brand' : ''} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                <div className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
                    {view === 'summary' ? (
                        <SummaryView activeVideoId={activeVideoId} />
                    ) : view === 'interview' ? (
                        <InterviewView activeVideoId={activeVideoId} />
                    ) : chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center text-center pt-10 md:pt-16 animate-in fade-in duration-500">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
                                <SparkleIcon size={22} weight="fill" className="text-brand" />
                            </span>
                            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your video is ready</h2>
                            <p className="mt-2 text-white/50 max-w-sm text-sm">Ask a question below, or jump straight to the summary or interview practice.</p>

                            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                                {SUGGESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuestion(q)}
                                        disabled={chatLimitReached}
                                        className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left text-sm text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                <button onClick={() => setView('summary')} className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                    <ListBulletsIcon size={16} /> Show summary
                                </button>
                                <button onClick={() => setView('interview')} className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                    <TargetIcon size={16} /> Interview practice
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {chatHistory.map((chat, idx) => (
                                <ChatBubble key={idx} role={chat.role} text={chat.text} />
                            ))}
                            {chatLoading && (
                                <div className="flex gap-3">
                                    <AiAvatar />
                                    <div className="flex items-center gap-1 rounded-2xl px-1 py-3" aria-label="AI is thinking">
                                        <span className="typing-dot size-1.5 rounded-full bg-white/60" />
                                        <span className="typing-dot size-1.5 rounded-full bg-white/60" />
                                        <span className="typing-dot size-1.5 rounded-full bg-white/60" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {view === 'chat' && (
                <div className="shrink-0 px-4 pb-4 pt-2">
                    <div className="mx-auto max-w-3xl">
                        {/* Chat Limit Banner */}
                        {chatLimitReached && (
                            <div role="alert" className="mb-3 rounded-xl border border-pro/25 bg-pro/[0.07] px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                                <WarningIcon size={18} weight="fill" className="text-pro shrink-0" />
                                <p className="flex-1 text-sm text-white/65">
                                    {isPro
                                        ? <>You&apos;ve used all <span className="font-semibold text-white">{CHAT_LIMIT} messages</span> for this video.</>
                                        : <>The free plan includes <span className="font-semibold text-white">{CHAT_LIMIT} messages</span> per video.</>}
                                </p>
                                {!isPro && (
                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-pro px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110 transition"
                                    >
                                        <CrownSimpleIcon size={12} weight="fill" /> Upgrade
                                    </button>
                                )}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => { e.preventDefault(); askQuestion(); }}
                            className={`rounded-2xl border bg-surface p-2 shadow-xl shadow-black/40 transition-colors ${chatLimitReached ? 'border-white/5 opacity-50' : 'border-white/10 focus-within:border-white/25'}`}
                        >
                            <label htmlFor="chat-input" className="sr-only">Ask about the video</label>
                            <textarea
                                id="chat-input"
                                ref={inputRef}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={chatLimitReached ? "Message limit reached for this video" : "Ask anything about the video…"}
                                disabled={chatLimitReached}
                                maxLength={1000}
                                className="block w-full bg-transparent text-white placeholder:text-white/30 resize-none outline-none min-h-[44px] max-h-[200px] px-2.5 py-2 text-[15px] leading-relaxed no-scrollbar disabled:cursor-not-allowed"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                        e.preventDefault();
                                        askQuestion();
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between gap-2 pl-2.5">
                                <span className="text-xs text-white/30">
                                    {chatLimitReached
                                        ? 'Limit reached'
                                        : planStatus
                                            ? `${remaining} of ${CHAT_LIMIT} messages left`
                                            : <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>}
                                </span>
                                <button
                                    type="submit"
                                    disabled={chatLoading || !question.trim() || chatLimitReached}
                                    aria-label="Send"
                                    className="flex size-9 items-center justify-center rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    {chatLoading ? <SpinnerGapIcon size={16} className="animate-spin" weight="bold" /> : <ArrowUpIcon size={16} weight="bold" />}
                                </button>
                            </div>
                        </form>
                        <p className="mt-2 text-center text-[11px] text-white/25">Answers are generated from the video transcript and can be wrong.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const TABS = [
    { id: 'chat', label: 'Chat', icon: ChatTeardropTextIcon },
    { id: 'summary', label: 'Summary', icon: ListBulletsIcon },
    { id: 'interview', label: 'Interview prep', icon: TargetIcon },
] as const

const SUGGESTIONS = [
    "What is the main idea of this video?",
    "List the key steps explained",
    "Explain the hardest concept simply",
    "What should I remember from this?",
]

function AiAvatar() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
            <SparkleIcon size={14} weight="fill" className="text-brand" />
        </span>
    )
}

function ChatBubble({ role, text }: { role: string; text: string }) {
    const [copied, setCopied] = useState(false)

    if (role === 'user') {
        return (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/10 px-4 py-2.5 text-[15px] leading-relaxed text-white whitespace-pre-wrap">
                    {text}
                </div>
            </div>
        )
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch { /* clipboard unavailable */ }
    }

    return (
        <div className="group flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <AiAvatar />
            <div className="min-w-0 flex-1">
                <div className="text-[15px] leading-relaxed text-white/85 whitespace-pre-wrap pt-0.5">{text}</div>
                <button
                    onClick={copy}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-white/35 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
                >
                    {copied ? <CheckIcon size={12} weight="bold" /> : <CopyIcon size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    )
}
