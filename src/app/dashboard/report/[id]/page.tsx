"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Download, Loader2, AlertCircle } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface VideoReport {
    id: string;
    title: string;
    thumbnailUrl?: string;
    description?: string;
    commentCount: number;
    sentimentScore: number;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    goodPoints: string[];
    improvPoints: string[];
    flagPoints: string[];
    thumbnailStrategy?: string[];
    questions: string[];
    nextVideoIdea: string;
    whatIsGreat: string;
    whatIsBad: string;
    overallSummary: string;
    viralStrategy?: string;
    // New comprehensive fields
    videoSummary?: string;
    contentGaps?: string[];
    retentionInsights?: string[];
    trendingTopics?: string[];
    competitorComparison?: string;
    technicalIssues?: string[];
    audienceInsights?: string;
    metrics: {
        views: string;
        likes: string;
        favorites: string;
        shares: string;
        watchTime: string;
        downloads: string;
        // NEW: Advanced analytics metrics
        impressions?: number;
        ctr?: string;
        subscribersGained?: number;
        avgViewDuration?: string;
        comments?: number;
    };
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [video, setVideo] = useState<VideoReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");
    const [pageTransition, setPageTransition] = useState(true);

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageTransition(false);
        }, 700); // 0.7 second page load for reports
        return () => clearTimeout(timer);
    }, []);

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

    // Removed chat functionality

    const handleDownloadPDF = async () => {
        if (downloading) return;
        setDownloading(true);

        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const element = document.getElementById("report-content");
            if (!element || !video) return;

            const downloadBtn = element.querySelector('[data-pdf-ignore]');
            if (downloadBtn) (downloadBtn as HTMLElement).style.display = 'none';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: "#FFF9F0",
            });

            if (downloadBtn) (downloadBtn as HTMLElement).style.display = 'flex';

            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("p", "mm", "a4", true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
            
            const safeTitle = video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
            const fileName = `${safeTitle}-analytics-report.pdf`;
            pdf.save(fileName);
        } catch (err: any) {
            console.error("PDF Generation failed:", err);
            alert(`Failed to generate PDF: ${err.message || 'Unknown error'}. Please check console for details.`);
        } finally {
            setDownloading(false);
        }
    };

    // Show loading screen during page transition
    if (pageTransition || loading) {
        return <LoadingScreen message="Generating your deep dive report..." variant="youtube" />;
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
                {/* ===== SECTION 1: HEADER & OVERVIEW ===== */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Card
                            className="w-[220px] h-[124px] shrink-0 overflow-hidden border-[3px] bg-white relative"
                        >
                            {video.thumbnailUrl ? (
                                <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ background: `linear-gradient(135deg, ${video.gradientFrom}, ${video.gradientTo})` }}
                                >
                                    <span className="text-5xl drop-shadow-md">{video.emoji}</span>
                                </div>
                            )}
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
                </div>

                {/* ===== SECTION 2: EXECUTIVE SUMMARY ===== */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <Card bg="white" className="p-6 border-4 border-dark-border shadow-solid md:col-span-2">
                        <h2 className="font-heading font-black text-xl mb-3 flex items-center gap-2">
                            📋 Executive Summary
                        </h2>
                        <p className="text-base font-medium leading-relaxed text-dark-border/80">
                            {video.overallSummary}
                        </p>
                    </Card>

                    <Card bg="lavender" className="p-6 border-4 border-dark-border shadow-solid">
                        <h2 className="font-heading font-black text-xl mb-3 flex items-center gap-2">
                            🚀 Viral Strategy
                        </h2>
                        <p className="text-base font-bold leading-relaxed text-dark-border">
                            {video.viralStrategy || "Analyze deeper to reveal your viral path."}
                        </p>
                    </Card>
                </div>

                {/* ===== NEW SECTION: ANALYTICS METRICS ===== */}
                {(video.metrics.impressions !== undefined || video.metrics.ctr || video.metrics.subscribersGained || video.metrics.avgViewDuration) && (
                    <div className="mb-10">
                        <h2 className="font-heading font-black text-2xl mb-6 flex items-center gap-2">
                            📊 Video Analytics Performance
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {video.metrics.impressions !== undefined && (
                                <Card bg="mint" className="p-5 border-4 border-dark-border shadow-solid">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">👁️</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Impressions</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {typeof video.metrics.impressions === 'number' 
                                                    ? video.metrics.impressions.toLocaleString() 
                                                    : video.metrics.impressions}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Times thumbnail was shown</div>
                                </Card>
                            )}

                            {video.metrics.ctr && (
                                <Card bg="yellow" className="p-5 border-4 border-dark-border shadow-solid">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">🎯</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">CTR</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {video.metrics.ctr}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Click-through rate</div>
                                </Card>
                            )}

                            {video.metrics.watchTime && (
                                <Card bg="blue" className="p-5 border-4 border-dark-border shadow-solid">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">⏱️</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Watch Time</div>
                                            <div className="font-heading font-black text-xl text-dark-border">
                                                {video.metrics.watchTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Total hours watched</div>
                                </Card>
                            )}

                            {video.metrics.avgViewDuration && (
                                <Card bg="red" className="p-5 border-4 border-dark-border shadow-solid">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">📈</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Avg Duration</div>
                                            <div className="font-heading font-black text-xl text-dark-border">
                                                {video.metrics.avgViewDuration}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Average view duration</div>
                                </Card>
                            )}

                            {video.metrics.subscribersGained !== undefined && (
                                <Card bg="lavender" className="p-5 border-4 border-dark-border shadow-solid sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">❤️</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Subscribers Gained</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {typeof video.metrics.subscribersGained === 'number' 
                                                    ? video.metrics.subscribersGained.toLocaleString() 
                                                    : video.metrics.subscribersGained}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">New subscribers from this video</div>
                                </Card>
                            )}

                            {video.metrics.views && (
                                <Card bg="white" className="p-5 border-4 border-dark-border shadow-solid sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">▶️</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Total Views</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {parseInt(video.metrics.views).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Lifetime views</div>
                                </Card>
                            )}

                            {video.metrics.likes && (
                                <Card bg="white" className="p-5 border-4 border-dark-border shadow-solid sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">👍</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Likes</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {parseInt(video.metrics.likes).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Total likes</div>
                                </Card>
                            )}

                            {video.metrics.comments && (
                                <Card bg="white" className="p-5 border-4 border-dark-border shadow-solid sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">💬</span>
                                        <div>
                                            <div className="text-xs font-black text-gray-500 uppercase">Comments</div>
                                            <div className="font-heading font-black text-2xl text-dark-border">
                                                {video.metrics.comments.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">Total comments</div>
                                </Card>
                            )}
                        </div>

                        {/* Analytics Insights Card */}
                        <Card bg="lavender" className="mt-4 p-6 border-4 border-dark-border shadow-solid">
                            <h3 className="font-heading font-black text-lg mb-3 flex items-center gap-2">
                                💡 Performance Insights
                            </h3>
                            <ul className="space-y-2 text-sm font-medium text-dark-border/80">
                                {video.metrics.ctr && (
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-black">✓</span>
                                        <span>
                                            <strong>CTR Analysis:</strong> Your {video.metrics.ctr} CTR is {parseFloat(video.metrics.ctr) >= 4 ? 'above' : 'below'} industry average (4-5%). 
                                            {parseFloat(video.metrics.ctr) < 4 ? ' Consider testing new thumbnails/titles.' : ' Great thumbnail performance!'}
                                        </span>
                                    </li>
                                )}
                                {video.metrics.avgViewDuration && video.metrics.watchTime && (
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-black">✓</span>
                                        <span>
                                            <strong>Retention:</strong> Average watch time of {video.metrics.avgViewDuration} shows {parseInt(video.metrics.avgViewDuration) > 120 ? 'strong' : 'room for improvement in'} audience engagement.
                                        </span>
                                    </li>
                                )}
                                {video.metrics.subscribersGained !== undefined && video.metrics.views && (
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-black">✓</span>
                                        <span>
                                            <strong>Conversion Rate:</strong> {((video.metrics.subscribersGained / parseInt(video.metrics.views)) * 100).toFixed(2)}% of viewers subscribed ({video.metrics.subscribersGained} total). 
                                            {((video.metrics.subscribersGained / parseInt(video.metrics.views)) * 100) >= 0.7 ? ' Excellent conversion!' : ' Add stronger CTAs to improve.'}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </Card>
                    </div>
                )}

                {/* ===== SECTION 3: VIDEO CONTENT ANALYSIS ===== */}
                {video.videoSummary && (
                    <div className="mb-10">
                        <h2 className="font-heading font-black text-2xl mb-4">🎬 Content Analysis</h2>
                        <Card bg="white" className="p-8 border-4 border-dark-border shadow-solid mb-6">
                            <h3 className="font-heading font-black text-lg mb-3">What This Video Is About</h3>
                            <p className="text-lg font-medium leading-relaxed text-dark-border/80 mb-6">
                                {video.videoSummary}
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-300">
                                    <h4 className="font-heading font-black text-lg mb-3 text-blue-900 flex items-center gap-2">
                                        👥 Audience Insights
                                    </h4>
                                    <p className="text-blue-800 font-bold">{video.audienceInsights || "Analyzing audience demographics and preferences..."}</p>
                                </div>
                                
                                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-300">
                                    <h4 className="font-heading font-black text-lg mb-3 text-purple-900 flex items-center gap-2">
                                        ⚔️ Competitive Positioning
                                    </h4>
                                    <p className="text-purple-800 font-bold">{video.competitorComparison || "Loading competitive analysis..."}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ===== SECTION 4: PERFORMANCE INSIGHTS ===== */}
                <div className="mb-10">
                    <h2 className="font-heading font-black text-2xl mb-4">📊 Performance Deep Dive</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card bg="yellow" className="p-6 border-4 border-dark-border shadow-solid">
                            <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                                🎯 Content Gaps
                            </h3>
                            <p className="text-sm font-bold text-dark-border/70 mb-4">What viewers wanted but didn't get:</p>
                            <ul className="space-y-2">
                                {video.contentGaps?.map((gap, i) => (
                                    <li key={i} className="flex items-start gap-3 font-bold text-dark-border">
                                        <div className="bg-accent-red text-white w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs border-2 border-dark-border shadow-[1px_1px_0_#111827]">
                                            {i + 1}
                                        </div>
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card bg="mint" className="p-6 border-4 border-dark-border shadow-solid">
                            <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                                📈 Retention Insights
                            </h3>
                            <p className="text-sm font-bold text-dark-border/70 mb-4">Where viewers drop off or rewatch:</p>
                            <ul className="space-y-2">
                                {video.retentionInsights?.map((insight, i) => (
                                    <li key={i} className="flex items-start gap-3 font-bold text-dark-border">
                                        <div className="bg-accent-red text-white w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs border-2 border-dark-border shadow-[1px_1px_0_#111827]">
                                            {i + 1}
                                        </div>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 border-4 border-red-300 bg-red-50 shadow-solid">
                            <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                                ⚠️ Technical Quality Check
                            </h3>
                            {video.technicalIssues && video.technicalIssues.length > 0 ? (
                                <ul className="space-y-2">
                                    {video.technicalIssues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-3 font-bold text-red-700">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="bg-green-100 p-4 rounded-xl border-2 border-green-300">
                                    <p className="text-green-700 font-bold flex items-center gap-2">
                                        ✅ No technical issues detected! Excellent production quality.
                                    </p>
                                </div>
                            )}
                        </Card>

                        <Card bg="lavender" className="p-6 border-4 border-dark-border shadow-solid">
                            <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                                🔥 Trending Opportunities
                            </h3>
                            <p className="text-sm font-bold text-dark-border/70 mb-4">Hot topics in your niche:</p>
                            <ul className="space-y-2">
                                {video.trendingTopics?.map((topic, i) => (
                                    <li key={i} className="flex items-start gap-3 font-bold text-dark-border">
                                        <span className="text-xl mr-2">📈</span>
                                        {topic}
                                    </li>
                                ))}
                            </ul>
                        </Card>
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

                    <Card bg="lavender" className="p-8 border-4 border-dark-border shadow-solid mb-10">
                        <h2 className="font-heading font-black text-2xl mb-4 flex items-center gap-2">
                            🚀 Viral Growth Strategy
                        </h2>
                        <p className="text-lg font-bold leading-relaxed text-dark-border">
                            {video.viralStrategy || "Analyze deeper to reveal your viral path."}
                        </p>
                    </Card>

                {/* ===== SECTION 5: METRICS & SENTIMENT ===== */}
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
                    <Card bg="yellow" className="p-8 border-4">
                        <h2 className="font-heading font-black text-2xl mb-4 flex items-center gap-2">🖼️ Thumbnail & Hook Strategy</h2>
                        <ul className="space-y-3">
                            {video.thumbnailStrategy && video.thumbnailStrategy.length > 0 ? (
                                video.thumbnailStrategy.map((pt, i) => (
                                    <li key={i} className="flex items-start gap-3 font-bold text-dark-border">
                                        <div className="bg-accent-red text-white w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs border-2 border-dark-border shadow-[1px_1px_0_#111827]">
                                            {i + 1}
                                        </div>
                                        {pt}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 italic">No specific thumbnail strategy generated.</li>
                            )}
                        </ul>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Next Idea Card */}
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

                {/* ===== SECTION 6: AI RECOMMENDATIONS ===== */}
                <h2 className="font-heading font-black text-2xl mb-6">💡 Expert Recommendations</h2>
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
                    <Card className={`p-6 ${video.flagPoints.length > 0 ? 'bg-[#FFF0F0] border-red-500 animate-pulse-subtle' : 'bg-[#FFE4E4]'}`}>
                        <h3 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                            {video.flagPoints.length > 0 ? '🚩 CRITICAL RED FLAGS' : '🚩 Red Flags'}
                        </h3>
                        <ul className="space-y-3">
                            {video.flagPoints.length > 0 ? (
                                video.flagPoints.map((pt: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 font-bold text-red-700">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 shrink-0 border-2 border-white shadow-sm"></div>
                                        {pt}
                                    </li>
                                ))
                            ) : (
                                <li className="font-medium text-gray-500 italic flex items-center gap-2">
                                    <span>Everything looks solid! No major red flags found. 🎉</span>
                                </li>
                            )}
                        </ul>
                        {video.flagPoints.length > 0 && (
                            <div className="mt-6 p-3 bg-white/50 rounded-xl border border-red-200 text-xs font-bold text-red-600">
                                ⚠️ These points are significantly hurting your retention. Fix these first!
                            </div>
                        )}
                    </Card>
                </div>

                {/* ===== SECTION 7: QUESTION BANK ===== */}
                <div className="mb-10">
                    <h2 className="font-heading font-black text-2xl mb-6">❓ Viewer Question Bank</h2>
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
