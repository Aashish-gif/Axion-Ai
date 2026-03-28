"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockVideos } from "@/lib/mockData";
import { Play, Youtube, AlertCircle, Loader2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

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

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'urgent';
    title: string;
    message: string;
    icon: string;
    timestamp: Date;
    videoId?: string;
    metric?: string;
}

export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connected, setConnected] = useState(false);
    const [userName, setUserName] = useState("");
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [stats, setStats] = useState<ChannelStats | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pageTransition, setPageTransition] = useState(true);
    const { searchQuery } = useSearch();
    const { t } = useLanguage();

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageTransition(false);
        }, 600); // 0.6 second page load
        return () => clearTimeout(timer);
    }, []);

    // Check for URL parameters (e.g., after YouTube connection)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        
        if (success === 'youtube_connected') {
            // Refresh data after successful YouTube connection
            fetchData();
            // Clean up URL
            window.history.replaceState({}, document.title, '/dashboard');
        }
        
        if (error) {
            console.error('YouTube connection error:', error);
            // Clean up URL
            window.history.replaceState({}, document.title, '/dashboard');
        }
    }, []);

    const fetchData = async () => {
        try {
            const [vRes, sRes] = await Promise.all([
                fetch("/api/youtube/videos"),
                fetch("/api/youtube/stats")
            ]);
            if (vRes.ok) {
                const vData = await vRes.json();
                setVideos(vData.videos);
                
                // Generate dynamic notifications based on video data
                generateNotifications(vData.videos, stats);
            }
            if (sRes.ok) {
                const sData = await sRes.json();
                setStats(sData);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    };

    const generateNotifications = (videos: YouTubeVideo[], currentStats: ChannelStats | null) => {
        const newNotifications: Notification[] = [];
        
        // Check for high-performing videos
        videos.forEach(video => {
            // Viral performance alert
            if (video.sentimentScore >= 90) {
                newNotifications.push({
                    id: `viral-${video.id}`,
                    type: 'success',
                    title: '🔥 Video Going Viral!',
                    message: `"${video.title.substring(0, 50)}..." has a ${video.sentimentScore}% positive sentiment! Consider pinning a comment or creating a follow-up.`,
                    icon: '🚀',
                    timestamp: new Date(),
                    videoId: video.id,
                    metric: `Sentiment: ${video.sentimentScore}%`
                });
            }
            
            // High engagement alert
            if (video.commentCount >= 500) {
                newNotifications.push({
                    id: `engagement-${video.id}`,
                    type: 'info',
                    title: '💬 High Engagement Detected',
                    message: `Your video is generating lots of discussion (${video.commentCount.toLocaleString()} comments). Great community interaction!`,
                    icon: '💡',
                    timestamp: new Date(),
                    videoId: video.id,
                    metric: `${video.commentCount.toLocaleString()} comments`
                });
            }
            
            // Needs attention alert
            if (video.sentimentScore < 60 && video.commentCount > 50) {
                newNotifications.push({
                    id: `attention-${video.id}`,
                    type: 'warning',
                    title: '⚠️ Video Needs Attention',
                    message: `Lower than average sentiment score (${video.sentimentScore}%). Review comments to understand audience concerns.`,
                    icon: '🎯',
                    timestamp: new Date(),
                    videoId: video.id,
                    metric: `Sentiment: ${video.sentimentScore}%`
                });
            }
        });
        
        // Subscriber milestone check
        if (currentStats?.totalSubscribers) {
            const subs = currentStats.totalSubscribers;
            const milestones = [1000, 5000, 10000, 50000, 100000];
            
            milestones.forEach(milestone => {
                if (subs >= milestone && subs < milestone + 100) {
                    newNotifications.push({
                        id: `milestone-${milestone}`,
                        type: 'success',
                        title: '🎉 Subscriber Milestone!',
                        message: `Congratulations! You just crossed ${milestone.toLocaleString()} subscribers! Keep up the amazing work!`,
                        icon: '🏆',
                        timestamp: new Date(),
                        metric: `${subs.toLocaleString()} subscribers`
                    });
                }
            });
        }
        
        // Trending sentiment alert
        if (currentStats?.avgSentiment && parseFloat(currentStats.avgSentiment) >= 85) {
            newNotifications.push({
                id: 'sentiment-trend',
                type: 'success',
                title: '❤️ Audience Loves Your Content',
                message: `Your average sentiment is ${currentStats.avgSentiment} - that's exceptional! Your audience is highly engaged and satisfied.`,
                icon: '✨',
                timestamp: new Date(),
                metric: `Avg Sentiment: ${currentStats.avgSentiment}`
            });
        }
        
        // Upload consistency reminder
        const recentVideos = videos.filter(v => v.commentCount > 0);
        if (recentVideos.length < 3) {
            newNotifications.push({
                id: 'consistency-reminder',
                type: 'info',
                title: '📹 Upload Consistency Tip',
                message: 'Upload at least 1-2 videos per week to maintain momentum and grow faster. Your audience is waiting!',
                icon: '📅',
                timestamp: new Date()
            });
        }
        
        // Sort by urgency and recency
        const sortedNotifications = newNotifications.sort((a, b) => {
            const urgencyOrder = { urgent: 0, warning: 1, info: 2, success: 3 };
            if (urgencyOrder[a.type] !== urgencyOrder[b.type]) {
                return urgencyOrder[a.type] - urgencyOrder[b.type];
            }
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
        
        setNotifications(sortedNotifications.slice(0, 10)); // Max 10 notifications
    };

    useEffect(() => {
        async function checkStatus() {
            try {
                // Fetch User Info for the greeting
                const userRes = await fetch("/api/auth/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserName(userData.user.name);
                } else {
                    // User is not logged in at all
                    console.warn("User not authenticated, redirecting to login...");
                }

                // Fetch YouTube Status
                const res = await fetch("/api/youtube/status");
                if (res.ok) {
                    const data = await res.json();
                    setConnected(data.connected);
                } else if (res.status === 401) {
                    // Not authenticated - redirect to login
                    console.warn("Not authenticated");
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

    // Show loading screen during page transition
    if (pageTransition || (loading && !connected)) {
        return <LoadingScreen message="Loading your dashboard..." variant="youtube" />;
    }

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
                    <p className="text-gray-500 font-bold">
                        {!userName ? "Please log in to continue." : "Your YouTube channel is not connected."}
                    </p>
                </div>

                <Card bg="lavender" className="p-12 flex flex-col items-center text-center border-dashed border-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-[3px] border-dark-border shadow-[4px_4px_0_#111827] mb-8">
                        <Youtube size={48} className="text-red-600" fill="currentColor" />
                    </div>
                    <h2 className="font-heading font-black text-3xl text-dark-border mb-4">
                        {!userName ? "Welcome! Let's Get Started" : "Connect Your Channel!"}
                    </h2>
                    <p className="text-gray-600 font-bold max-w-md mb-10 leading-relaxed">
                        {!userName 
                            ? "You need to be logged in before connecting your YouTube channel. Please log in first."
                            : "To see what your audience is saying, read comments, and get AI insights, you need to connect your YouTube channel first."
                        }
                    </p>
                    
                    {!userName ? (
                        <Link href="/auth">
                            <Button variant="primary" className="flex items-center gap-3 text-lg px-8 py-6">
                                Login / Register
                            </Button>
                        </Link>
                    ) : (
                        <a href="/api/auth/youtube">
                            <Button variant="primary" className="flex items-center gap-3 text-lg px-8 py-6">
                                <Play size={20} fill="currentColor" /> Connect YouTube Channel
                            </Button>
                        </a>
                    )}

                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-500 bg-white/50 px-4 py-2 rounded-full border-2 border-dark-border/10">
                        <AlertCircle size={16} />
                        <span>{!userName ? "Create an account or login to continue" : "Read-only access to your comments and videos"}</span>
                    </div>
                </Card>
            </div>
        );
    }

    const statConfig = [
        { 
            bg: "mint" as const, 
            emoji: "💬", 
            label: t('reports.comments').toUpperCase(), 
            value: stats?.totalComments?.toLocaleString() || "0", 
            trend: stats?.trends?.comments || "+12% this week", 
            badge: null 
        },
        { 
            bg: "yellow" as const, 
            emoji: "😊", 
            label: t('reports.sentiment').toUpperCase(), 
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

    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Dynamic Notifications Section */}
            {notifications.length > 0 && (
                <div className="mb-8 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-black text-xl text-dark-border flex items-center gap-2">
                            🔔 Live Notifications
                        </h2>
                        <Button 
                            variant="secondary" 
                            onClick={() => setNotifications([])}
                            className="!py-1 !px-3 text-sm"
                        >
                            Clear All
                        </Button>
                    </div>
                    
                    <div className="grid gap-3">
                        {notifications.map((notification) => {
                            const bgColors = {
                                success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
                                warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
                                info: 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200',
                                urgent: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                            };
                            
                            return (
                                <Card 
                                    key={notification.id} 
                                    className={`p-5 border-[3px] transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${bgColors[notification.type]}`}
                                    onClick={() => notification.videoId && (window.location.href = `/dashboard/report/${notification.videoId}`)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl shrink-0">{notification.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-heading font-black text-lg text-dark-border truncate pr-4">
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs font-bold text-gray-500 shrink-0">
                                                    {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 mb-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            {notification.metric && (
                                                <Badge 
                                                    variant={notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'red' : 'dark'} 
                                                    className="text-xs"
                                                >
                                                    {notification.metric}
                                                </Badge>
                                            )}
                                        </div>
                                        {notification.videoId && (
                                            <div className="hidden sm:flex items-center text-accent-red font-bold text-sm shrink-0">
                                                View →
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
            
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
                <h2 className="font-heading font-black text-2xl text-dark-border">{t('dashboard.recent')}</h2>
            </div>

            {/* Recent Videos Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white border-4 border-dashed border-gray-100 rounded-[2rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dark-border/5 mx-auto mb-6">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <p className="font-heading font-black text-gray-400 text-2xl mb-2">
                            {searchQuery ? `No videos matching "${searchQuery}"` : "No videos found"}
                        </p>
                        <p className="text-gray-400 font-bold">Try searching for something else or sync your channel.</p>
                    </div>
                ) : (
                    filteredVideos.map((video) => (
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
