"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockVideos } from "@/lib/mockData";
import { Play, Youtube, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    commentCount: number;
    sentimentScore: number;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
}

interface ChannelStats {
    totalComments: number;
    totalSubscribers: number;
    totalVideos: number;
    avgSentiment: string;
    vibe: string;
    trends?: {
        comments: string;
        subscribers: string;
        sentiment: string;
        vibe: string;
    }
}

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
}

export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connected, setConnected] = useState(false);
    const [userName, setUserName] = useState("");
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [stats, setStats] = useState<ChannelStats | null>(null);

    const fetchData = async () => {
        try {
            const [vRes, sRes] = await Promise.all([
                fetch("/api/youtube/videos"),
                fetch("/api/youtube/stats")
            ]);
            if (vRes.ok) {
                const vData = await vRes.json();
                setVideos(vData.videos);
            }
            if (sRes.ok) {
                const sData = await sRes.json();
                setStats(sData);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    };

    useEffect(() => {
        async function checkStatus() {
            try {
                // Fetch User Info for the greeting
                const userRes = await fetch("/api/auth/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserName(userData.user.name);
                }

                // Fetch YouTube Status
                const res = await fetch("/api/youtube/status");
                if (res.ok) {
                    const data = await res.json();
                    setConnected(data.connected);
                }
            } catch (error) {
                console.error("Failed to check status:", error);
            } finally {
                setLoading(false);
            }
        }
        checkStatus();
    }, []);

    useEffect(() => {
        if (!connected) return;
        fetchData();
    }, [connected]);

    const handleSync = async () => {
        setSyncing(true);
        await fetchData();
        setSyncing(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 size={48} className="animate-spin text-accent-red mb-4" />
                <p className="font-heading font-bold text-dark-border">Loading dashboard...</p>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                    <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-1">
                        Hey, {userName.split(' ')[0] || "Creator"}! 👋
                    </h1>
                    <p className="text-gray-500 font-bold">Your YouTube channel is not connected.</p>
                </div>

                <Card bg="lavender" className="p-12 flex flex-col items-center text-center border-dashed border-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-[3px] border-dark-border shadow-[4px_4px_0_#111827] mb-8">
                        <Youtube size={48} className="text-red-600" fill="currentColor" />
                    </div>
                    <h2 className="font-heading font-black text-3xl text-dark-border mb-4">Connect Your Channel!</h2>
                    <p className="text-gray-600 font-bold max-w-md mb-10 leading-relaxed">
                        To see what your audience is saying, read comments, and get AI insights, you need to connect your YouTube channel first.
                    </p>
                    
                    <a href="/api/youtube/auth">
                        <Button variant="primary" className="flex items-center gap-3 text-lg px-8 py-6">
                            <Play size={20} fill="currentColor" /> Connect YouTube Channel
                        </Button>
                    </a>

                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-500 bg-white/50 px-4 py-2 rounded-full border-2 border-dark-border/10">
                        <AlertCircle size={16} />
                        <span>Read-only access to your comments and videos</span>
                    </div>
                </Card>
            </div>
        );
    }

    const statConfig = [
        { 
            bg: "mint" as const, 
            emoji: "💬", 
            label: "TOTAL COMMENTS", 
            value: stats?.totalComments?.toLocaleString() || "0", 
            trend: stats?.trends?.comments || "+12% this week", 
            badge: null 
        },
        { 
            bg: "yellow" as const, 
            emoji: "😊", 
            label: "AVG SENTIMENT", 
            value: stats?.avgSentiment || "84%", 
            trend: stats?.trends?.sentiment || "Mostly Positive", 
            badge: null 
        },
        { 
            bg: "blue" as const, 
            emoji: "🏆", 
            label: "TOTAL SUBS", 
            value: stats?.totalSubscribers?.toLocaleString() || "0", 
            trend: stats?.trends?.subscribers || "Channel Totals", 
            badge: null 
        },
        { 
            bg: "lavender" as const, 
            emoji: "❤️", 
            label: "CHANNEL VIBE", 
            value: stats?.vibe || "Growing", 
            trend: stats?.trends?.vibe || "Active", 
            badge: stats?.vibe === "On Fire! 🔥" ? "On Fire" : null 
        },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-1">
                        Hey, {userName.split(' ')[0] || "Creator"}! 👋
                    </h1>
                    <p className="text-gray-500 font-bold">Here is what your audience is saying today.</p>
                </div>
                <Button 
                    variant="primary" 
                    className="flex items-center gap-2 w-fit disabled:opacity-70"
                    onClick={handleSync}
                    disabled={syncing}
                >
                    {syncing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                    {syncing ? "Syncing..." : "Sync Channel"}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {statConfig.map((stat, i) => (
                    <Card key={i} bg={stat.bg} hoverLift className="p-5 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-3xl">{stat.emoji}</span>
                            {stat.badge && <Badge variant="green" className="text-xs !py-0.5">{stat.badge}</Badge>}
                        </div>
                        <div>
                            <div className="text-[10px] md:text-xs font-black text-gray-500 tracking-wider mb-1">{stat.label}</div>
                            <div className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-dark-border leading-none">{stat.value}</div>
                            {stat.trend && <div className="text-xs font-bold text-green-600 mt-2">{stat.trend}</div>}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-black text-2xl text-dark-border">Recent Videos</h2>
            </div>

            {/* Recent Videos Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white border-4 border-dashed rounded-3xl">
                        <Loader2 size={48} className="animate-spin mx-auto text-gray-300 mb-4" />
                        <p className="font-heading font-bold text-gray-400 text-xl">Fetching your videos...</p>
                    </div>
                ) : (
                    videos.map((video) => (
                        <Link href={`/dashboard/report/${video.id}`} key={video.id} className="block group">
                            <Card hoverLift className="flex flex-col h-full bg-white transition-all overflow-hidden group-hover:-translate-y-1">
                                <div
                                    className="h-[180px] w-full flex items-center justify-center relative border-b-[3px] border-dark-border"
                                    style={{ background: `linear-gradient(135deg, ${video.gradientFrom}, ${video.gradientTo})` }}
                                >
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <span className="text-6xl drop-shadow-md z-10 transition-transform group-hover:scale-110">{video.emoji}</span>
                                    )}
                                    
                                    <div className="absolute top-4 left-4 z-20">
                                        <div className="w-10 h-10 bg-white rounded-lg border-2 border-dark-border flex items-center justify-center text-xl shadow-[2px_2px_0_#111827]">
                                            {video.emoji}
                                        </div>
                                    </div>

                                    {/* Hover Play Overlay */}
                                    <div className="absolute inset-0 bg-dark-border/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-30">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-[3px] border-dark-border shadow-[4px_4px_0_#111827]">
                                            <Play size={24} fill="currentColor" className="ml-1 text-dark-border" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-heading font-extrabold text-lg text-dark-border leading-tight mb-4 flex-1 line-clamp-2">
                                        {video.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-auto pt-2">
                                        <Badge variant={video.sentimentScore >= 80 ? 'green' : 'red'} className="text-xs">
                                            {video.sentimentScore}% Positive
                                        </Badge>
                                        <Badge variant="dark" className="text-xs bg-gray-100 !text-gray-600 !border-gray-300 !shadow-none">
                                            {video.commentCount.toLocaleString()} cmts
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
