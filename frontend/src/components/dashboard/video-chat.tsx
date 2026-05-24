import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { 
    YoutubeLogoIcon, 
    ListBulletsIcon, 
    ArrowUpIcon,
    SpinnerGapIcon,
    ChatCircleTextIcon
} from "@phosphor-icons/react"

interface VideoChatProps {
    activeVideoId: string
}

export function VideoChat({ activeVideoId }: VideoChatProps) {
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const action = searchParams.get("action")
    const [question, setQuestion] = useState("")
    const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([])
    const [chatLoading, setChatLoading] = useState(false)

    useEffect(() => {
        setQuestion("");
        
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
                await fetchSummary();
            } else if (action === 'interview') {
                await generateSummary();
            }
        };

        initChat();
    }, [activeVideoId, action, session]);

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
        
        const userText = "Please show the video summary.";
        setChatHistory(prev => [...prev, { role: "user", text: userText }]);
        setChatLoading(true);
        await saveChatToDB("user", userText);

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/summary/${activeVideoId}`, {
                headers: { Authorization: token }
            });
            const summary = res.data.summary;
            if (!summary) {
                const aiText = "Summary not available.";
                setChatHistory(prev => [...prev, { role: "ai", text: aiText }]);
                await saveChatToDB("ai", aiText);
                return;
            }
            
            const keypoints = typeof summary.keypointSummary === 'string' ? JSON.parse(summary.keypointSummary) : summary.keypointSummary;
            const keypointsText = Array.isArray(keypoints) ? keypoints.map((kp: string) => `• ${kp}`).join('\n') : '';

            const text = `--- Short Summary ---\n${summary.shortSummary}\n\n--- Detailed Summary ---\n${summary.longSummary}\n\n--- Key Takeaways ---\n${keypointsText}`;
            setChatHistory(prev => [...prev, { role: "ai", text }]);
            await saveChatToDB("ai", text);
        } catch (error) {
            console.error("Error fetching summary:", error);
            const errText = "Error fetching summary. Please make sure the video is processed.";
            setChatHistory(prev => [...prev, { role: "ai", text: errText }]);
            await saveChatToDB("ai", errText);
        } finally {
            setChatLoading(false);
        }
    }

    const askQuestion = async () => {
        if (!question || !activeVideoId) return;
        const userQ = question;
        const token = (session as any)?.backendToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
        setQuestion("");
        
        // Get up to 6 previous messages
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
        
        const userText = "Please generate interview questions and summary for this video.";
        setChatHistory(prev => [...prev, { role: "user", text: userText }]);
        setChatLoading(true);
        await saveChatToDB("user", userText);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube/interview/${activeVideoId}`, {}, {
                headers: { Authorization: token }
            });
            
            const data = res.data.questions;
            if (!data) {
                const aiText = "No questions generated.";
                setChatHistory(prev => [...prev, { role: "ai", text: aiText }]);
                await saveChatToDB("ai", aiText);
                return;
            }

            const parseQ = (qData: any) => {
                if (!qData) return [];
                if (typeof qData === 'string') {
                    try { return JSON.parse(qData); } catch (e) { return []; }
                }
                return qData;
            };

            const easy = parseQ(data.easyQuestions);
            const medium = parseQ(data.mediumQuestions);
            const hard = parseQ(data.hardQuestions);

            const formatSection = (title: string, qs: any[]) => {
                if (!qs || qs.length === 0) return "";
                const list = qs.map((q: any, i: number) => `Q${i+1}: ${q.question}\nA: ${q.answer}`).join("\n\n");
                return `--- ${title} ---\n\n${list}`;
            };

            const combinedText = [
                formatSection("🟢 Easy Questions", easy),
                formatSection("🟡 Medium Questions", medium),
                formatSection("🔴 Hard Questions", hard)
            ].filter(Boolean).join("\n\n\n");

            const text = combinedText || "Summary generated successfully.";
            setChatHistory(prev => [...prev, { role: "ai", text }]);
            await saveChatToDB("ai", text);
        } catch (error) {
            console.error("Error generating interview questions:", error);
            const errText = "Error generating interview questions. Please make sure the video is processed.";
            setChatHistory(prev => [...prev, { role: "ai", text: errText }]);
            await saveChatToDB("ai", errText);
        } finally {
            setChatLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col px-4 max-w-4xl mx-auto w-full h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden">
                {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="bg-[#2f2f2f] p-4 rounded-full"><YoutubeLogoIcon size={32} className="text-red-500"/></div>
                        <h2 className="text-2xl font-bold">Video Processed & Ready!</h2>
                        <p className="text-white/50 max-w-sm text-sm">Ask any question about the video below, or use the quick actions.</p>
                        <div className="flex flex-wrap gap-3 mt-4 items-center justify-center">
                            <button onClick={fetchSummary} className="px-5 py-2.5 bg-[#2f2f2f] hover:bg-[#3f3f3f] hover:text-white rounded-lg transition-colors border border-white/10 text-sm flex items-center gap-2 font-medium">
                                <ListBulletsIcon size={18} className="text-emerald-400"/> Show Summary
                            </button>
                            <button onClick={generateSummary} className="px-5 py-2.5 bg-[#2f2f2f] hover:bg-[#3f3f3f] hover:text-white rounded-lg transition-colors border border-white/10 text-sm flex items-center gap-2 font-medium">
                                <ChatCircleTextIcon size={18} className="text-blue-400"/> Interview Questions
                            </button>
                        </div>
                    </div>
                ) : (
                    chatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${chat.role === 'user' ? 'bg-[#2f2f2f] text-white' : 'bg-transparent text-white/90 whitespace-pre-wrap'}`}>
                                {chat.text}
                            </div>
                        </div>
                    ))
                )}
                {chatLoading && (
                    <div className="flex justify-start">
                        <div className="p-4 flex items-center gap-2 text-white/50"><SpinnerGapIcon className="animate-spin" size={20}/> AI is thinking...</div>
                    </div>
                )}
            </div>
            
            <div className="w-full pb-6 pt-2 shrink-0 relative">
                <div className="bg-[#2f2f2f] rounded-[24px] flex flex-col p-3 shadow-lg border border-white/5 focus-within:border-white/20">
                    <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything about the video..." 
                        className="w-full bg-transparent text-white placeholder:text-white/50 resize-none outline-none min-h-[44px] max-h-[200px] px-3 py-2 text-base [&::-webkit-scrollbar]:hidden"
                        rows={1}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
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
