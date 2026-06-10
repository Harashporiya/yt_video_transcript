import React from 'react'
import { SpinnerGapIcon } from "@phosphor-icons/react"

export function InterviewView({ data, loading }: { data: any, loading: boolean }) {
    if (loading) {
        return <div className="flex items-center gap-2 text-white/50 p-4"><SpinnerGapIcon className="animate-spin" size={20}/> Generating interview questions...</div>
    }
    if (!data) return null;
    if (data.error) {
        return <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl">{data.error}</div>
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

    const formatSection = (title: string, qs: any[], color: string) => {
        if (!qs || qs.length === 0) return null;
        return (
            <div className="space-y-4">
                <h4 className={`font-semibold text-lg ${color}`}>{title}</h4>
                <div className="space-y-4">
                    {qs.map((q: any, i: number) => (
                        <div key={i} className="bg-black/40 p-4 rounded-xl">
                            <p className="font-medium text-white mb-2"><span className="opacity-50 mr-2">Q{i+1}:</span> {q.question}</p>
                            <p className="text-white/70"><span className="opacity-50 mr-2">A:</span> {q.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <div className="bg-white/5 p-6 rounded-2xl text-white/90 space-y-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">🎯</span> Interview & Practice Q&A
            </h3>
            {formatSection("🟢 Easy Questions", easy, "text-green-400")}
            {formatSection("🟡 Medium Questions", medium, "text-yellow-400")}
            {formatSection("🔴 Hard Questions", hard, "text-red-400")}
        </div>
    )
}
