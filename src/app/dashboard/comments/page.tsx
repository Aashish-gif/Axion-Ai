"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Loader2, MessageSquare, ExternalLink, Youtube,
    Sparkles, Copy, CheckCheck, ThumbsUp, MessageCircle,
    AlertTriangle, Filter, RefreshCw, Zap, ChevronDown
} from "lucide-react";

interface Comment {
    id: string;
    text: string;
    author: string;
    authorAvatar: string;
    publishedAt: string;
    videoId: string;
    videoTitle: string;
    likeCount?: number;
    replyCount?: number;
}

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    commentCount: number;
    sentimentScore: number;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
}

interface SmartReply {
    reply: string;
    intent: "question" | "praise" | "criticism" | "suggestion" | "spam" | "other";
    emoji: string;
    priority: "high" | "medium" | "low";
}

type FilterType = "all" | "question" | "praise" | "criticism" | "suggestion" | "high";

const INTENT_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    question:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",   label: "Question"    },
    praise:      { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-300",  label: "Praise"      },
    criticism:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-300",    label: "Criticism"   },
    suggestion:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300", label: "Suggestion"  },
    spam:        { bg: "bg-gray-50",   text: "text-gray-400",   border: "border-gray-200",   label: "Spam"        },
    other:       { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", label: "Other"       },
};

const PRIORITY_DOT: Record<string, string> = {
    high:   "bg-red-500",
    medium: "bg-yellow-400",
    low:    "bg-gray-300",
};

const DEMO_COMMENTS: Comment[] = [
    // Next.js Full Course 2024 comments
    { id: "demo-1", author: "TechWithMike", authorAvatar: "https://ui-avatars.com/api/?name=TechWithMike&background=FF3B3B&color=fff", text: "Bro this tutorial literally saved my project 🔥 Can you do one on React Server Components next?", publishedAt: "2026-03-25T10:00:00Z", videoId: "demoVid1", videoTitle: "Next.js Full Course 2024", likeCount: 47, replyCount: 2 },
    { id: "demo-2", author: "Sarah_Creates", authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Creates&background=8B5CF6&color=fff", text: "I've watched this 3 times already. Best explanation of this topic by far. Please keep making more content like this!", publishedAt: "2026-03-24T14:30:00Z", videoId: "demoVid1", videoTitle: "Next.js Full Course 2024", likeCount: 31, replyCount: 1 },
    { id: "demo-3", author: "CodeNewbie99", authorAvatar: "https://ui-avatars.com/api/?name=CodeNewbie&background=10B981&color=fff", text: "Honestly the audio quality in this one was a bit low, had to turn my volume all the way up. Content is great tho!", publishedAt: "2026-03-23T09:15:00Z", videoId: "demoVid1", videoTitle: "Next.js Full Course 2024", likeCount: 12, replyCount: 0 },
    
    // React Hooks Deep Dive comments
    { id: "demo-4", author: "dev_priya", authorAvatar: "https://ui-avatars.com/api/?name=dev+priya&background=F59E0B&color=fff", text: "How do you handle authentication in this setup? I'm getting a 401 error when I try to protect the API routes the way you showed", publishedAt: "2026-03-22T16:45:00Z", videoId: "demoVid2", videoTitle: "React Hooks Deep Dive", likeCount: 28, replyCount: 3 },
    { id: "demo-5", author: "XxGammerBoy2009xX", authorAvatar: "https://ui-avatars.com/api/?name=GammerBoy&background=6B7280&color=fff", text: "first!!!! 🔥🔥🔥🔥 subscribe to my channel", publishedAt: "2026-03-22T08:00:00Z", videoId: "demoVid2", videoTitle: "React Hooks Deep Dive", likeCount: 0, replyCount: 0 },
    { id: "demo-6", author: "ReactMaster", authorAvatar: "https://ui-avatars.com/api/?name=ReactMaster&background=06B6D4&color=fff", text: "This explanation of useEffect cleanup functions is exactly what I needed. Finally understand why the return function matters!", publishedAt: "2026-03-21T19:30:00Z", videoId: "demoVid2", videoTitle: "React Hooks Deep Dive", likeCount: 89, replyCount: 4 },
    
    // TypeScript Crash Course comments
    { id: "demo-7", author: "FullstackAlex", authorAvatar: "https://ui-avatars.com/api/?name=Alex+Dev&background=3B82F6&color=fff", text: "You should do a comparison video between this approach and the Pages Router. I think a lot of people are still confused about when to use which one.", publishedAt: "2026-03-21T11:20:00Z", videoId: "demoVid3", videoTitle: "TypeScript Crash Course", likeCount: 19, replyCount: 1 },
    { id: "demo-8", author: "JustLearning_2024", authorAvatar: "https://ui-avatars.com/api/?name=Just+Learning&background=EC4899&color=fff", text: "Subscribed instantly. I've been looking for this exact explanation for weeks. Nobody else explains this clearly. Thank you so much! 🙏", publishedAt: "2026-03-20T20:00:00Z", videoId: "demoVid3", videoTitle: "TypeScript Crash Course", likeCount: 55, replyCount: 0 },
    { id: "demo-9", author: "TypeScriptGuru", authorAvatar: "https://ui-avatars.com/api/?name=TS+Guru&background=8B5CF6&color=fff", text: "Great content! One suggestion: could you cover advanced types like conditional types and mapped types in your next video?", publishedAt: "2026-03-19T15:45:00Z", videoId: "demoVid3", videoTitle: "TypeScript Crash Course", likeCount: 34, replyCount: 2 },
];

const DEMO_VIDEOS: Video[] = [
    { id: "demoVid1", title: "Next.js Full Course 2024", thumbnail: "", commentCount: 3, sentimentScore: 85, emoji: "🚀", gradientFrom: "#FF3B3B", gradientTo: "#FF6B35" },
    { id: "demoVid2", title: "React Hooks Deep Dive", thumbnail: "", commentCount: 3, sentimentScore: 78, emoji: "⚛️", gradientFrom: "#3B82F6", gradientTo: "#2DD4BF" },
    { id: "demoVid3", title: "TypeScript Crash Course", thumbnail: "", commentCount: 3, sentimentScore: 92, emoji: "💻", gradientFrom: "#8B5CF6", gradientTo: "#EC4899" },
];

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string>("all");
    const [replies, setReplies] = useState<Record<string, SmartReply>>({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [generated, setGenerated] = useState(false);
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch videos first
                const videosRes = await fetch("/api/youtube/videos");
                if (videosRes.ok) {
                    const videosData = await videosRes.json();
                    if (videosData.videos && videosData.videos.length > 0) {
                        setVideos(videosData.videos);
                    }
                }

                // Then fetch comments (with video filter if selected)
                const commentsUrl = selectedVideoId !== "all" ? `/api/youtube/comments?videoId=${selectedVideoId}` : "/api/youtube/comments";
                const commentsRes = await fetch(commentsUrl);
                if (!commentsRes.ok) {
                    const data = await commentsRes.json();
                    throw new Error(data.error || "Failed to fetch comments");
                }
                const data = await commentsRes.json();
                if (!data.comments || data.comments.length === 0) {
                    // Auto-activate demo mode if no real comments found
                    setComments(DEMO_COMMENTS);
                    setVideos(DEMO_VIDEOS);
                    setDemoMode(true);
                } else {
                    setComments(data.comments);
                    setDemoMode(false);
                }
            } catch (err: any) {
                // On error, still show demo mode so feature is always visible
                setComments(DEMO_COMMENTS);
                setVideos(DEMO_VIDEOS);
                setDemoMode(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedVideoId]);

    const handleGenerateReplies = async () => {
        if (generating || comments.length === 0) return;
        setGenerating(true);
        try {
            const res = await fetch("/api/youtube/smart-replies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments }),
            });
            if (!res.ok) throw new Error("Failed to generate replies");
            const data = await res.json();
            setReplies(data.replies || {});
            setGenerated(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (commentId: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(commentId);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredComments = useMemo(() => {
        let filtered = comments;
        
        // Filter by selected video (only if not in demo mode or if demo mode with specific video selection)
        if (selectedVideoId !== "all") {
            filtered = filtered.filter(c => c.videoId === selectedVideoId);
        }
        
        // Then apply intent/priority filter
        if (filter === "all") return filtered;
        if (filter === "high") return filtered.filter(c => replies[c.id]?.priority === "high");
        return filtered.filter(c => replies[c.id]?.intent === filter);
    }, [comments, replies, filter, selectedVideoId]);

    // Stats
    const stats = useMemo(() => {
        const intentCounts = { question: 0, praise: 0, criticism: 0, suggestion: 0, spam: 0, other: 0 };
        const priorityCounts = { high: 0, medium: 0, low: 0 };
        Object.values(replies).forEach(r => {
            intentCounts[r.intent] = (intentCounts[r.intent] || 0) + 1;
            priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1;
        });
        return { intentCounts, priorityCounts };
    }, [replies]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 size={48} className="animate-spin text-accent-red mb-4" />
                <p className="font-heading font-bold text-dark-border">Fetching your audience's thoughts...</p>
            </div>
        );
    }

    if (error && comments.length === 0) {
        return (
            <div className="p-8 text-center bg-red-50 border-[3px] border-red-200 rounded-3xl">
                <Youtube size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="font-heading font-black text-2xl text-red-600 mb-2">Couldn't load comments</h2>
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <a href="/dashboard">
                    <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-[4px_4px_0_#111827]">Back to Dashboard</button>
                </a>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-10">

            {/* ── PAGE HEADER ── */}
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-heading font-black text-3xl text-dark-border flex items-center gap-3">
                            <span className="text-4xl">🤖</span> AI Reply Studio
                        </h1>
                        <p className="text-gray-500 font-bold mt-1">
                            Gemini reads every comment & writes a reply <span className="text-accent-red">that sounds like you.</span>
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateReplies}
                        disabled={generating || comments.length === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-black text-white border-[3px] border-dark-border shadow-[4px_4px_0_#111827] transition-all
                            ${generating || comments.length === 0
                                ? "bg-gray-300 cursor-not-allowed opacity-60"
                                : "bg-accent-red hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111827] active:translate-y-0 active:shadow-none"
                            }`}
                    >
                        {generating ? (
                            <><Loader2 size={18} className="animate-spin" /> Generating Replies...</>
                        ) : generated ? (
                            <><RefreshCw size={18} /> Regenerate All</>
                        ) : (
                            <><Zap size={18} /> Generate Smart Replies</>
                        )}
                    </button>
                </div>
            </header>

            {/* ── VIDEO SELECTION DROPDOWN ── */}
            {videos.length > 0 && (
                <div className="mb-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <Youtube size={18} className="text-dark-border" />
                        <span className="font-black text-dark-border text-sm">Filter by Video:</span>
                        {demoMode && (
                            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-lg">🧪 Demo Mode</span>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={selectedVideoId}
                            onChange={(e) => setSelectedVideoId(e.target.value)}
                            className="w-full sm:w-96 appearance-none bg-white border-4 border-dark-border rounded-2xl px-4 py-3 pr-12 font-bold text-dark-border shadow-[2px_2px_0_#111827] focus:outline-none focus:border-accent-red transition-colors cursor-pointer hover:bg-gray-50"
                        >
                            <option value="all">📺 All Videos ({comments.length} comments)</option>
                            {videos.map((video) => (
                                <option key={video.id} value={video.id}>
                                    {video.emoji} {video.title.length > 60 ? video.title.substring(0, 60) + "..." : video.title} ({video.commentCount} comments)
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-border pointer-events-none" />
                    </div>
                </div>
            )}

            {/* ── DEMO MODE BANNER ── */}
            {demoMode && (
                <div className="mb-6 flex items-start gap-3 bg-yellow-50 border-[3px] border-yellow-400 rounded-2xl p-4 animate-in fade-in duration-300">
                    <span className="text-2xl shrink-0">🧪</span>
                    <div>
                        <p className="font-black text-yellow-800 text-sm">Demo Mode — No real comments found on your channel yet</p>
                        <p className="font-medium text-yellow-700 text-xs mt-0.5">
                            Showing sample comments so you can explore the AI Reply Studio fully. Once your videos get comments, they'll replace these automatically.
                        </p>
                    </div>
                </div>
            )}

            {/* ── STATS ROW (shown after generation) ── */}

            {generated && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-in fade-in duration-300">
                    <Card bg="white" className="p-4 border-4 border-dark-border shadow-solid text-center">
                        <div className="text-3xl font-black text-red-500">{stats.priorityCounts.high}</div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mt-1">🔥 High Priority</div>
                    </Card>
                    <Card bg="mint" className="p-4 border-4 border-dark-border shadow-solid text-center">
                        <div className="text-3xl font-black text-dark-border">{stats.intentCounts.question}</div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mt-1">❓ Questions</div>
                    </Card>
                    <Card bg="yellow" className="p-4 border-4 border-dark-border shadow-solid text-center">
                        <div className="text-3xl font-black text-dark-border">{stats.intentCounts.praise}</div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mt-1">🌟 Praise</div>
                    </Card>
                    <Card bg="lavender" className="p-4 border-4 border-dark-border shadow-solid text-center">
                        <div className="text-3xl font-black text-dark-border">{stats.intentCounts.criticism + stats.intentCounts.suggestion}</div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mt-1">💡 Feedback</div>
                    </Card>
                </div>
            )}

            {/* ── FILTER BAR (shown after generation) ── */}
            {generated && (
                <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-300">
                    <Filter size={14} className="text-gray-400 shrink-0" />
                    {([
                        { key: "all",        label: "All",         emoji: "💬" },
                        { key: "high",       label: "Priority",    emoji: "🔥" },
                        { key: "question",   label: "Questions",   emoji: "❓" },
                        { key: "praise",     label: "Praise",      emoji: "🌟" },
                        { key: "criticism",  label: "Criticism",   emoji: "⚠️" },
                        { key: "suggestion", label: "Suggestions", emoji: "💡" },
                    ] as { key: FilterType; label: string; emoji: string }[]).map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all
                                ${filter === f.key
                                    ? "bg-dark-border text-white border-dark-border shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
                                    : "bg-white text-dark-border border-dark-border/30 hover:border-dark-border"
                                }`}
                        >
                            {f.emoji} {f.label}
                            {f.key !== "all" && (
                                <span className="ml-1 opacity-60">
                                    {f.key === "high"
                                        ? stats.priorityCounts.high
                                        : stats.intentCounts[f.key as keyof typeof stats.intentCounts] ?? 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ── GENERATE PROMPT (before generation) ── */}
            {!generated && comments.length > 0 && (
                <Card bg="lavender" className="p-8 border-4 border-dark-border shadow-solid mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-purple-600" size={22} />
                            <h2 className="font-heading font-black text-xl text-dark-border">Ready to save you hours</h2>
                        </div>
                        <p className="text-dark-border/70 font-medium leading-relaxed">
                            You have <strong>{comments.length} comments</strong> waiting across your latest videos.
                            Axion AI will read each one, understand its intent, and draft a reply that sounds
                            <strong> authentically like you</strong> — prioritised by what needs your attention most.
                        </p>
                        <p className="text-xs font-bold text-purple-700 mt-3 bg-purple-100 px-3 py-1.5 rounded-lg inline-block">
                            ✨ First feature of its kind in any YouTube analytics tool
                        </p>
                    </div>
                    <div className="text-6xl opacity-30 hidden sm:block">🤖</div>
                </Card>
            )}

            {/* ── COMMENT CARDS ── */}
            <div className="space-y-5">
                {comments.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-4">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="font-heading font-black text-xl text-dark-border">No comments found yet</h3>
                        <p className="text-gray-500 font-bold">Try syncing your channel or uploading a new video!</p>
                    </Card>
                ) : (
                    filteredComments.map((comment) => {
                        const smart = replies[comment.id];
                        const intentStyle = smart ? INTENT_STYLES[smart.intent] : null;
                        const isSkip = smart?.reply === "SKIP";

                        if (isSkip && filter !== "all") return null;

                        return (
                            <Card
                                key={comment.id}
                                bg="white"
                                className={`border-4 transition-all duration-200 overflow-hidden
                                    ${smart?.priority === "high" ? "border-accent-red shadow-[4px_4px_0_#FF3B3B]" :
                                      smart?.priority === "medium" ? "border-dark-border shadow-solid" :
                                      "border-dark-border/30"
                                    }`}
                            >
                                <div className="p-5">
                                    {/* ── TOP ROW: Avatar + author + meta ── */}
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-11 h-11 rounded-full border-2 border-dark-border overflow-hidden shadow-[2px_2px_0_#111827]">
                                                <img
                                                    src={comment.authorAvatar}
                                                    alt={comment.author}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=FF3B3B&color=fff`;
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-black text-dark-border tracking-tight">{comment.author}</span>
                                                <span className="text-xs font-bold text-gray-400">
                                                    {new Date(comment.publishedAt).toLocaleDateString()}
                                                </span>
                                                {/* Priority dot */}
                                                {smart && (
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${PRIORITY_DOT[smart.priority]}`}
                                                        title={`${smart.priority} priority`}
                                                    />
                                                )}
                                                {/* Intent badge */}
                                                {smart && !isSkip && (
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${intentStyle?.bg} ${intentStyle?.text} ${intentStyle?.border}`}>
                                                        {smart.emoji} {intentStyle?.label}
                                                    </span>
                                                )}
                                                {isSkip && (
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-gray-50 text-gray-400 border-gray-200 flex items-center gap-1">
                                                        <AlertTriangle size={10} /> Spam
                                                    </span>
                                                )}
                                            </div>
                                            {/* Like & reply count */}
                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                                {(comment.likeCount ?? 0) > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp size={11} /> {comment.likeCount}
                                                    </span>
                                                )}
                                                {(comment.replyCount ?? 0) > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle size={11} /> {comment.replyCount} replies
                                                    </span>
                                                )}
                                                <Badge variant="dark" className="text-[9px] !px-2 !py-0.5 truncate max-w-[160px] hidden sm:inline-flex">
                                                    {comment.videoTitle}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── COMMENT TEXT ── */}
                                    <div
                                        className="text-gray-700 font-medium leading-relaxed mb-4 pl-1"
                                        dangerouslySetInnerHTML={{ __html: comment.text }}
                                    />

                                    {/* ── SMART REPLY BOX ── */}
                                    {smart && !isSkip && (
                                        <div className={`rounded-2xl border-2 ${intentStyle?.border} ${intentStyle?.bg} p-4 mt-2`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Sparkles size={13} className={intentStyle?.text} />
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${intentStyle?.text}`}>
                                                            AI Draft Reply
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm font-bold leading-relaxed ${intentStyle?.text}`}>
                                                        {smart.reply}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(comment.id, smart.reply)}
                                                    title="Copy reply"
                                                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border-2 transition-all
                                                        ${copied === comment.id
                                                            ? "bg-green-500 text-white border-green-600 shadow-none"
                                                            : `bg-white ${intentStyle?.text} ${intentStyle?.border} hover:shadow-[2px_2px_0_rgba(0,0,0,0.2)] active:shadow-none`
                                                        }`}
                                                >
                                                    {copied === comment.id ? (
                                                        <><CheckCheck size={13} /> Copied!</>
                                                    ) : (
                                                        <><Copy size={13} /> Copy</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── LINKS ROW ── */}
                                    <div className="flex items-center gap-4 mt-4">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${comment.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-black text-accent-red hover:underline"
                                        >
                                            View Video <ExternalLink size={11} />
                                        </a>
                                        <a
                                            href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline"
                                        >
                                            Reply on YouTube <ExternalLink size={11} />
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* ── BOTTOM CTA: if filtered and no results ── */}
            {generated && filteredComments.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-bold">
                    No {filter} comments found. Try a different filter!
                </div>
            )}
        </div>
    );
}
