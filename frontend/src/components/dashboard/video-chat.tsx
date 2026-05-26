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
    }, [activeVideoId, action, status]);

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
        if (!question || !activeVideoId) return;
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
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { role: "ai", text: "Error fetching answer." }]);
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
                <div className="bg-[#0a0a0a] rounded-[24px] flex flex-col p-3 shadow-lg border border-white/5 focus-within:border-white/20">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything about the video..."
                        className="w-full bg-transparent text-white placeholder:text-white/50 resize-none outline-none min-h-[44px] max-h-[200px] px-3 py-2 text-base [&::-webkit-scrollbar]:hidden"
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
                                disabled={chatLoading || !question}
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
