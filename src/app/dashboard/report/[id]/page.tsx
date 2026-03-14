"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockVideos } from "@/lib/mockData";
import { ArrowLeft, Download } from "lucide-react";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const video = mockVideos.find((v) => v.id === resolvedParams.id) || mockVideos[0];

    const handleDownloadPDF = async () => {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;

        const element = document.getElementById("report-content");
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${video.title}-report.pdf`);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <Link href="/dashboard" className="inline-block mb-8">
                <Button variant="secondary" className="flex items-center gap-2 !px-4 !py-2">
                    <ArrowLeft size={18} /> Back
                </Button>
            </Link>

            <div id="report-content" className="bg-bg-cream">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-start md:items-center">
                    <Card
                        className="w-[180px] h-[110px] shrink-0 flex items-center justify-center border-[3px]"
                        style={{ background: `linear-gradient(135deg, ${video.gradientFrom}, ${video.gradientTo})` }}
                    >
                        <span className="text-5xl drop-shadow-md">{video.emoji}</span>
                    </Card>

                    <div className="flex-1">
                        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Deep Dive Report</div>
                        <h1 className="font-heading font-black text-3xl md:text-4xl text-dark-border mb-4">{video.title}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="green">Score: {video.sentimentScore}/100</Badge>
                            <Badge variant="dark" className="bg-white !text-dark-border !shadow-none">
                                {video.commentCount.toLocaleString()} Comments Analyzed
                            </Badge>
                            <Button variant="dark" className="ml-auto !py-1.5 !px-4 text-sm flex items-center gap-2" onClick={handleDownloadPDF}>
                                <Download size={16} /> Download PDF Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Two-column grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Sentiment Meter */}
                    <Card bg="mint" className="p-8">
                        <h2 className="font-heading font-black text-2xl mb-6">Audience Sentiment</h2>
                        <div className="flex items-center gap-8">
                            {/* SVG Donut */}
                            <div className="relative w-32 h-32 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path
                                        className="text-gray-200"
                                        strokeWidth="4"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-green-500 transition-all duration-1000 ease-out"
                                        strokeWidth="4"
                                        strokeDasharray={`${video.sentimentScore}, 100`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-heading font-black text-3xl text-green-600">{video.sentimentScore}%</span>
                                </div>
                            </div>

                            {/* Bar Rows */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>Positive</span>
                                        <span>{video.sentimentScore}%</span>
                                    </div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden border-2 border-dark-border">
                                        <div className="h-full bg-green-500" style={{ width: `${video.sentimentScore}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>Neutral</span>
                                        <span>{Math.max(0, 100 - video.sentimentScore - 5)}%</span>
                                    </div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden border-2 border-dark-border">
                                        <div className="h-full bg-yellow-400" style={{ width: `${Math.max(0, 100 - video.sentimentScore - 5)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>Negative</span>
                                        <span>{Math.min(100 - video.sentimentScore, 5)}%</span>
                                    </div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden border-2 border-dark-border">
                                        <div className="h-full bg-red-500" style={{ width: `${Math.min(100 - video.sentimentScore, 5)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* AI Idea Generator */}
                    <Card className="p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF3B3B, #FF6B35)' }}>
                        <div className="absolute top-4 right-4 text-6xl opacity-20">💡</div>
                        <div className="text-white relative z-10 h-full flex flex-col">
                            <div className="text-xs font-black uppercase tracking-wider mb-2 opacity-90">🧠 AI Idea Generator</div>
                            <h3 className="font-heading font-black italic text-3xl leading-tight mb-8 mt-4 flex-1">
                                "{video.nextVideoIdea}"
                            </h3>
                            <div className="inline-flex items-center gap-2 bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/20 font-bold text-sm">
                                🔥 Viral Potential
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Insights 3-col grid */}
                <h2 className="font-heading font-black text-2xl mb-6">AI Insights</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <Card bg="mint" className="p-6">
                        <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">✅ The Good</h3>
                        <ul className="space-y-3">
                            {video.goodPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-2 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0 border border-dark-border"></div>
                                    {pt}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card bg="yellow" className="p-6">
                        <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">🔧 Constructive Criticism</h3>
                        <ul className="space-y-3">
                            {video.improvPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-2 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shrink-0 border border-dark-border"></div>
                                    {pt}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card className="p-6 bg-[#FFE4E4]">
                        <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">🚩 Red Flags</h3>
                        <ul className="space-y-3">
                            {video.flagPoints.length > 0 ? (
                                video.flagPoints.map((pt, i) => (
                                    <li key={i} className="flex items-start gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 border border-dark-border"></div>
                                        {pt}
                                    </li>
                                ))
                            ) : (
                                <li className="font-medium text-gray-500 italic">No red flags detected! 🎉</li>
                            )}
                        </ul>
                    </Card>
                </div>

                {/* Question Bank section */}
                <div className="mb-10">
                    <h2 className="font-heading font-black text-2xl mb-6">Question Bank</h2>
                    <div className="max-h-[320px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {video.questions.map((q, i) => (
                            <Card key={i} bg="white" className="p-5 flex items-start gap-4">
                                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center border-2 border-dark-border shrink-0 text-xl shadow-[2px_2px_0_#111827]">
                                    ❓
                                </div>
                                <div className="font-bold text-lg pt-1">{q}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
