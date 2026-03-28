"use client";

import React from 'react';
import { ChannelSwitcher } from './ChannelSwitcher';
import { Search, Bell, LogOut, AlertCircle, TrendingUp, Award, MessageCircle, Plus } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'urgent';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export function TopBar() {
    const router = useRouter();
    const [userName, setUserName] = React.useState("");
    const [userEmail, setUserEmail] = React.useState("");
    const [showProfile, setShowProfile] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [loggingOut, setLoggingOut] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth");
            router.refresh();
        } catch {
            setLoggingOut(false);
        }
    };

    const { searchQuery, setSearchQuery } = useSearch();
    const [inputValue, setInputValue] = React.useState(searchQuery);

    // Debounce search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, setSearchQuery]);

    React.useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUserName(data.user.name);
                    setUserEmail(data.user.email);
                }
                
                // Fetch notifications from dashboard
                const dashRes = await fetch("/api/youtube/videos");
                if (dashRes.ok) {
                    const dashData = await dashRes.json();
                    generateNotifications(dashData.videos);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }
        fetchUser();
    }, []);

    const generateNotifications = (videos: any[]) => {
        const newNotifications: Notification[] = [];
        
        videos.forEach(video => {
            if (video.sentimentScore >= 90) {
                newNotifications.push({
                    id: `viral-${video.id}`,
                    type: 'success',
                    title: '🔥 Video Going Viral!',
                    message: `${video.title.substring(0, 40)}... has ${video.sentimentScore}% positive sentiment`,
                    timestamp: new Date(),
                    read: false
                });
            }
            if (video.commentCount >= 500) {
                newNotifications.push({
                    id: `engagement-${video.id}`,
                    type: 'info',
                    title: '💬 High Engagement',
                    message: `${video.commentCount.toLocaleString()} comments on your video`,
                    timestamp: new Date(),
                    read: false
                });
            }
            if (video.sentimentScore < 60 && video.commentCount > 50) {
                newNotifications.push({
                    id: `attention-${video.id}`,
                    type: 'warning',
                    title: '⚠️ Needs Attention',
                    message: `Lower sentiment score (${video.sentimentScore}%) - review comments`,
                    timestamp: new Date(),
                    read: false
                });
            }
        });
        
        setNotifications(newNotifications.slice(0, 10));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : "??";

    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-0 bg-bg-cream/90 backdrop-blur-md z-40 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b-[3px] border-dark-border shadow-[0_4px_0_#111827]">
            <div className="flex-1 w-full max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search videos, ideas, or comments..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        suppressHydrationWarning
                        className="w-full pl-11 pr-4 py-2.5 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end w-full md:w-auto gap-4">
                {/* Add Channel Button */}
                <button
                    onClick={() => router.push("/api/auth/youtube")}
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-accent-red text-white font-bold text-sm rounded-xl border-2 border-dark-border shadow-[2px_2px_0_#111827] hover:bg-red-700 transition-colors"
                >
                    <Plus size={16} />
                    Add Channel
                </button>
                
                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        suppressHydrationWarning
                        className="w-11 h-11 bg-white border-[3px] border-dark-border rounded-xl shadow-[4px_5px_0_#111827] flex items-center justify-center transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none hover:text-accent-red relative"
                    >
                        <Bell size={20} className={unreadCount > 0 ? "text-accent-red animate-pulse" : ""} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-4 w-96 max-h-[500px] bg-white border-[3px] border-dark-border rounded-2xl shadow-[8px_8px_0_#111827] p-4 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-gray-100">
                                <h3 className="font-heading font-black text-lg text-dark-border flex items-center gap-2">
                                    🔔 Notifications
                                </h3>
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-accent-red hover:underline"
                                >
                                    Mark all read
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="font-bold text-gray-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => {
                                        const icons = {
                                            success: <TrendingUp className="text-green-600" size={20} />,
                                            warning: <AlertCircle className="text-yellow-600" size={20} />,
                                            info: <MessageCircle className="text-blue-600" size={20} />,
                                            urgent: <AlertCircle className="text-red-600" size={20} />
                                        };
                                        
                                        return (
                                            <div 
                                                key={notification.id}
                                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${notification.read ? 'bg-white border-gray-200' : 'bg-gradient-to-r from-gray-50 to-white border-accent-red/30'}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 mt-0.5">
                                                        {icons[notification.type]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-bold text-sm mb-1 ${notification.read ? 'text-gray-600' : 'text-dark-border'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <span className="text-xs text-gray-400 mt-1 block">
                                                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-accent-red rounded-full shrink-0 mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="mt-3 w-full py-2 bg-accent-red text-white font-bold text-sm rounded-lg border-2 border-dark-border hover:bg-red-700 transition-colors"
                                >
                                    View Dashboard
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                <ChannelSwitcher />
                
                <div className="relative">
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        suppressHydrationWarning
                        className="w-11 h-11 rounded-xl bg-accent-red border-[3px] border-dark-border shadow-[4px_5px_0_#111827] flex items-center justify-center overflow-hidden transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    >
                        <span className="font-heading font-black text-white text-sm">{initials}</span>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-4 w-64 bg-white border-[3px] border-dark-border rounded-2xl shadow-[8px_8px_0_#111827] p-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-100">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ACCOUNT</p>
                                <p className="font-heading font-black text-dark-border text-lg leading-tight truncate">{userName}</p>
                                <p className="text-xs font-bold text-gray-500 truncate">{userEmail}</p>
                            </div>
                            <div className="space-y-1">
                                <a 
                                    href="/dashboard/settings"
                                    className="w-full text-left px-3 py-2 rounded-lg font-bold text-dark-border hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    Add Channel
                                </a>
                                <button className="w-full text-left px-3 py-2 rounded-lg font-bold text-dark-border hover:bg-gray-50 transition-colors">Profile Settings</button>
                                <button 
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full text-left px-3 py-2 rounded-lg font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    {loggingOut ? "Signing out..." : "Sign Out"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
