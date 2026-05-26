import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import {
    YoutubeLogoIcon,
    ListBulletsIcon,
    ArrowUpIcon,
    SpinnerGapIcon,
    ChatCircleTextIcon,
    ChatTeardropTextIcon
} from "@phosphor-icons/react"
import { SummaryView } from "./summary-view"
import { InterviewView } from "./interview-view"

interface VideoChatProps {
    activeVideoId: string
}

export function VideoChat({ activeVideoId }: VideoChatProps) {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const action = searchParams.get("action")

    const [question, setQuestion] = useState("")
    const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([])
    const [chatLoading, setChatLoading] = useState(false)
    const [chatLimitReached, setChatLimitReached] = useState(false)
    const [chatCount, setChatCount] = useState(0)
    const CHAT_LIMIT = 3

    const [view, setView] = useState<'chat' | 'summary' | 'interview'>('chat')
    const [summaryData, setSummaryData] = useState<any>(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [interviewData, setInterviewData] = useState<any>(null)
    const [interviewLoading, setInterviewLoading] = useState(false)

    useEffect(() => {
        setQuestion("");
        setView('chat');
        setSummaryData(null);
        setInterviewData(null);
        setChatHistory([]);
        setChatLimitReached(false);
        setChatCount(0);

        const initChat = async () => {
            const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
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
                        if (userMsgCount >= 3) setChatLimitReached(true);
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
                await fetchSummary();
            } else if (action === 'interview') {
                setView('interview');
                await generateSummary();
            }
        };

        initChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVideoId, action]);

    const saveChatToDB = async (role: string, text: string) => {
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
        if (!token || !activeVideoId) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/chat/${activeVideoId}/save`, {
                role, text
            }, { headers: { Authorization: token } });
        } catch (e) {
            console.error("Failed to save chat msg to DB", e);
        }
    };

    const fetchSummary = async () => {
        if (!activeVideoId) return;
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');

        setSummaryLoading(true);

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/summary/${activeVideoId}`, {
                headers: { Authorization: token }
            });
            const summary = res.data.summary;
            if (!summary) {
                setSummaryData({ error: "Summary not available." });
                return;
            }

            setSummaryData(summary);
        } catch (error) {
            console.error("Error fetching summary:", error);
            setSummaryData({ error: "Error fetching summary. Please make sure the video is processed." });
        } finally {
            setSummaryLoading(false);
        }
    }

    const askQuestion = async () => {
        if (!question || !activeVideoId || chatLimitReached) return;
        const userQ = question;
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
        setQuestion("");
        setView('chat');

        const historyToSend = chatHistory.slice(-6);

        setChatHistory(prev => [...prev, { role: "user", text: userQ }]);
        setChatLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/ask/${activeVideoId}`, {
                question: userQ,
                chatHistory: historyToSend
            }, {
                headers: { Authorization: token }
            });

            setChatHistory(prev => [...prev, { role: "ai", text: res.data.answer }]);
            const newCount = chatCount + 1;
            setChatCount(newCount);
            if (newCount >= CHAT_LIMIT) setChatLimitReached(true);
        } catch (error: any) {
            console.error(error);
            if (error?.response?.data?.limitReached) {
                setChatLimitReached(true);
                setChatHistory(prev => prev.filter((_, i) => i !== prev.length - 1)); // remove optimistic user msg
            } else {
                setChatHistory(prev => [...prev, { role: "ai", text: "Error fetching answer." }]);
            }
        } finally {
            setChatLoading(false);
        }
    }

    const generateSummary = async () => {
        if (!activeVideoId) return;
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');

        setInterviewLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/interview/${activeVideoId}`, {}, {
                headers: { Authorization: token }
            });

            const data = res.data.questions;
            if (!data) {
                setInterviewData({ error: "No questions generated." });
                return;
            }

            setInterviewData(data);
        } catch (error) {
            console.error("Error generating interview questions:", error);
            setInterviewData({ error: "Error generating interview questions. Please make sure the video is processed." });
        } finally {
            setInterviewLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col px-4 max-w-4xl mx-auto w-full h-full overflow-hidden">
            {/* View Switcher */}
            {(chatHistory.length > 0 || summaryData || interviewData || view !== 'chat') && (
                <div className="flex gap-2 py-4 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={() => setView('chat')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${view === 'chat' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                        <ChatTeardropTextIcon size={18} /> Chat
                    </button>
                    <button
                        onClick={() => {
                            setView('summary');
                            if (!summaryData) fetchSummary();
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${view === 'summary' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                        <ListBulletsIcon size={18} className={view === 'summary' ? 'text-emerald-400' : ''} /> Summary
                    </button>
                    <button
                        onClick={() => {
                            setView('interview');
                            if (!interviewData) generateSummary();
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${view === 'interview' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                        <ChatCircleTextIcon size={18} className={view === 'interview' ? 'text-blue-400' : ''} /> Interview Questions
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pb-8 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden">
                {view === 'summary' ? (
                    <SummaryView data={summaryData} loading={summaryLoading} />
                ) : view === 'interview' ? (
                    <InterviewView data={interviewData} loading={interviewLoading} />
                ) : chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                        <div className="bg-white/5 p-4 rounded-full"><YoutubeLogoIcon size={32} className="text-white" /></div>
                        <h2 className="text-2xl font-bold">Video Processed & Ready!</h2>
                        <p className="text-white/50 max-w-sm text-sm">Ask any question about the video below, or use the quick actions.</p>
                        <div className="flex flex-wrap gap-3 mt-4 items-center justify-center">
                            <button onClick={() => { setView('summary'); fetchSummary(); }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-colors border border-white/10 text-sm flex items-center gap-2 font-medium">
                                <ListBulletsIcon size={18} className="text-emerald-400" /> Show Summary
                            </button>
                            <button onClick={() => { setView('interview'); generateSummary(); }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-colors border border-white/10 text-sm flex items-center gap-2 font-medium">
                                <ChatCircleTextIcon size={18} className="text-blue-400" /> Interview Questions
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {chatHistory.map((chat, idx) => (
                            <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${chat.role === 'user' ? 'bg-white/10 text-white' : 'bg-transparent text-white/90 whitespace-pre-wrap'}`}>
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="p-4 flex items-center gap-2 text-white/50"><SpinnerGapIcon className="animate-spin" size={20} /> AI is thinking...</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="w-full pb-6 pt-2 shrink-0 relative">

                {/* Chat Limit Banner */}
                {chatLimitReached && (
                    <div className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                        <div className="bg-amber-500/20 p-1.5 rounded-full shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-amber-400" viewBox="0 0 256 256">
                                <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-amber-400 font-semibold text-xs">Chat Limit Reached</p>
                            <p className="text-amber-400/70 text-xs leading-relaxed">
                                You have hit your chat limit. Only <span className="font-bold text-amber-400">3 messages</span> are allowed — no more messages can be sent.
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages remaining indicator */}
                {!chatLimitReached && chatCount > 0 && (
                    <div className="mb-2 flex justify-end">
                        <span className="text-white/30 text-xs">{CHAT_LIMIT - chatCount} message{CHAT_LIMIT - chatCount !== 1 ? 's' : ''} remaining</span>
                    </div>
                )}

                <div className={`bg-[#0a0a0a] rounded-[24px] flex flex-col p-3 shadow-lg border transition-colors ${chatLimitReached ? 'border-amber-500/20 opacity-50' : 'border-white/5 focus-within:border-white/20'
                    }`}>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={chatLimitReached ? "Chat limit reached. You cannot send more messages." : "Ask anything about the video..."}
                        disabled={chatLimitReached}
                        className="w-full bg-transparent text-white placeholder:text-white/50 resize-none outline-none min-h-[44px] max-h-[200px] px-3 py-2 text-base [&::-webkit-scrollbar]:hidden disabled:cursor-not-allowed"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                askQuestion();
                            }
                        }}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                            {/* Paperclip icon removed as requested */}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={askQuestion}
                                disabled={chatLoading || !question || chatLimitReached}
                                className="p-2 bg-white text-black hover:text-black rounded-full hover:bg-white/90 disabled:opacity-50 transition-colors ml-1"
                            >
                                <ArrowUpIcon size={20} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
