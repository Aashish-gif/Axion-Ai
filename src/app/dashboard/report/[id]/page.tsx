"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Download, Loader2, AlertCircle } from "lucide-react";

interface VideoReport {
    id: string;
    title: string;
    commentCount: number;
    sentimentScore: number;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    goodPoints: string[];
    improvPoints: string[];
    flagPoints: string[];
    questions: string[];
    nextVideoIdea: string;
    whatIsGreat: string;
    whatIsBad: string;
    overallSummary: string;
    metrics: {
        views: string;
        likes: string;
        favorites: string;
        shares: string;
        watchTime: string;
        downloads: string;
    };
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [video, setVideo] = useState<VideoReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch(`/api/youtube/report/${resolvedParams.id}`);
                if (!res.ok) throw new Error("Failed to load report");
                const data = await res.json();
                setVideo(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [resolvedParams.id]);

    const handleDownloadPDF = async () => {
        if (downloading) return;
        setDownloading(true);

        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const element = document.getElementById("report-content");
            if (!element || !video) return;

            // Temporarily hide the download button during capture
            const downloadBtn = element.querySelector('[data-pdf-ignore]');
            if (downloadBtn) (downloadBtn as HTMLElement).style.display = 'none';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: "#FFF9F0", // Explicit HEX for background
            });

            // Restore the download button
            if (downloadBtn) (downloadBtn as HTMLElement).style.display = 'flex';

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            const safeTitle = video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            pdf.save(`${safeTitle}-report.pdf`);
        } catch (err: any) {
            console.error("PDF Generation failed:", err);
            alert(`Failed to generate PDF: ${err.message || 'Unknown error'}`);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 size={48} className="animate-spin text-accent-red mb-4" />
                <p className="font-heading font-bold text-dark-border">Generating your deep dive report...</p>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="p-8 text-center bg-red-50 border-[3px] border-red-200 rounded-3xl">
                <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="font-heading font-black text-2xl text-red-600 mb-2">Report Unavailable</h2>
                <p className="text-red-500 font-bold mb-6">{error || "We couldn't find the data for this video."}</p>
                <Link href="/dashboard">
                    <Button variant="primary">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

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
                            <Button 
                                variant="dark" 
                                className="ml-auto !py-1.5 !px-4 text-sm flex items-center gap-2 disabled:opacity-50" 
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                data-pdf-ignore
                            >
                                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {downloading ? "Generating PDF..." : "Download PDF Report"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Overall Summary Row */}
                <Card bg="white" className="p-8 border-4 border-dark-border mb-10 shadow-solid">
                    <h2 className="font-heading font-black text-2xl mb-4 flex items-center gap-2">
                        📑 Deep Dive Summary
                    </h2>
                    <p className="text-lg font-medium leading-relaxed text-dark-border/80 italic">
                        "{video.overallSummary}"
                    </p>
                </Card>

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
                            <h3 className="font-heading font-black italic text-2xl leading-tight mb-4 mt-4 flex-1">
                                "{video.nextVideoIdea}"
                            </h3>
                            <div className="inline-flex items-center gap-2 bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/20 font-bold text-sm">
                                🔥 Viral Potential
                            </div>
                        </div>
                    </Card>
                </div>

                {/* New: Detailed Stats & AI Summary */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <Card bg="white" className="p-8 border-4">
                         <h2 className="font-heading font-black text-2xl mb-6 flex items-center gap-2">📊 Video Metrics</h2>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dark-border/5">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Views</div>
                                <div className="text-2xl font-black text-dark-border">{parseInt(video.metrics?.views || "0").toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dark-border/5">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Likes</div>
                                <div className="text-2xl font-black text-dark-border">{parseInt(video.metrics?.likes || "0").toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dark-border/5">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Shares</div>
                                <div className="text-xl font-black text-gray-500">{video.metrics?.shares || "N/A"}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dark-border/5">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Watch Time</div>
                                <div className="text-sm font-black text-gray-400">{video.metrics?.watchTime || "N/A"}</div>
                            </div>
                         </div>
                    </Card>

                    <div className="space-y-6">
                        <Card bg="mint" className="p-6 border-l-8 border-l-green-500">
                             <h3 className="font-heading font-black text-xl mb-2 italic">🌟 What's Great?</h3>
                             <p className="text-dark-border font-medium leading-relaxed">
                                 {video.whatIsGreat}
                             </p>
                        </Card>
                        <Card bg="lavender" className="p-6 border-l-8 border-l-purple-500">
                             <h3 className="font-heading font-black text-xl mb-2 italic">📉 What's Missing?</h3>
                             <p className="text-dark-border font-medium leading-relaxed">
                                 {video.whatIsBad}
                             </p>
                        </Card>
                    </div>
                </div>

                {/* AI Insights 3-col grid */}
                <h2 className="font-heading font-black text-2xl mb-6">AI Insights</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <Card bg="mint" className="p-6">
                        <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">✅ The Good</h3>
                        <ul className="space-y-3">
                            {video.goodPoints.map((pt: string, i: number) => (
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
                            {video.improvPoints.map((pt: string, i: number) => (
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
                                video.flagPoints.map((pt: string, i: number) => (
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
                        {video.questions.length > 0 ? (
                            video.questions.map((q: string, i: number) => (
                                <Card key={i} bg="white" className="p-5 flex items-start gap-4">
                                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center border-2 border-dark-border shrink-0 text-xl shadow-[2px_2px_0_#111827]">
                                        ❓
                                    </div>
                                    <div className="font-bold text-lg pt-1">{q}</div>
                                </Card>
                            ))
                        ) : (
                            <div className="py-12 text-center bg-white border-4 border-dashed rounded-3xl">
                                <p className="font-heading font-bold text-gray-400 text-xl">No specific questions found in comments.</p>
                                <p className="text-gray-400 font-medium">Try syncing again later if you get new engagement!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
