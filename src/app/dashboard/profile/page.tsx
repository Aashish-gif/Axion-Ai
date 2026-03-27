"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    User, Youtube, Mail, Calendar, Activity, Link2, 
    Settings, LogOut, Trash2, Eye, EyeOff, Users, Video, 
    TrendingUp, Shield, ChevronRight, ExternalLink, 
    CheckCircle, XCircle, AlertCircle
} from "lucide-react";

interface ProfileData {
    user: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
        lastLogin: string;
    };
    channels: {
        youtube: {
            connected: boolean;
            channelTitle: string | null;
            channelData: {
                id: string;
                title: string;
                description: string;
                thumbnail: string;
                publishedAt: string;
                subscriberCount: number;
                videoCount: number;
                viewCount: number;
                uploadsPlaylistId: string;
            } | null;
            connectedAt: string | null;
        };
    };
    stats: {
        accountAgeDays: number;
        totalConnectedChannels: number;
        lastActive: string;
    };
}

export default function ProfilePage() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [disconnecting, setDisconnecting] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch profile data");
            }
            const data = await res.json();
            setProfileData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectChannel = async (platform: string) => {
        if (platform === "youtube") {
            if (!confirm("Are you sure you want to disconnect your YouTube channel? This will remove access to your channel data.")) {
                return;
            }
            
            setDisconnecting(true);
            try {
                const res = await fetch("/api/user/profile", { method: "DELETE" });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to disconnect channel");
                }
                
                // Update local state
                if (profileData) {
                    setProfileData({
                        ...profileData,
                        channels: {
                            ...profileData.channels,
                            youtube: {
                                connected: false,
                                channelTitle: null,
                                channelData: null,
                                connectedAt: null
                            }
                        },
                        stats: {
                            ...profileData.stats,
                            totalConnectedChannels: profileData.stats.totalConnectedChannels - 1
                        }
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setDisconnecting(false);
            }
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-heading font-bold text-dark-border">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border-[3px] border-red-200 rounded-3xl">
                <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="font-heading font-black text-2xl text-red-600 mb-2">Profile Error</h2>
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <button 
                    onClick={fetchProfileData}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-[4px_4px_0_#111827] hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!profileData) return null;

    const { user, channels, stats } = profileData;

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            {/* ── PAGE HEADER ── */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <User size={32} className="text-accent-red" />
                    <h1 className="font-heading font-black text-3xl text-dark-border">Profile</h1>
                </div>
                <p className="text-gray-500 font-bold">
                    Manage your account settings and connected channels
                </p>
            </header>

            {/* ── USER INFO CARD ── */}
            <Card bg="white" className="p-6 border-4 border-dark-border shadow-solid mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-[4px_4px_0_#111827]">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-heading font-black text-xl text-dark-border mb-1">{user.name}</h2>
                            <p className="text-gray-600 font-medium flex items-center gap-2">
                                <Mail size={14} />
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Badge variant="dark" className="text-xs">
                        Active
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Member Since</span>
                        </div>
                        <div className="font-black text-dark-border">{formatDate(user.createdAt)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={16} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Age</span>
                        </div>
                        <div className="font-black text-dark-border">{stats.accountAgeDays} days</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={16} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</span>
                        </div>
                        <div className="font-black text-dark-border">{formatDate(stats.lastActive)}</div>
                    </div>
                </div>
            </Card>

            {/* ── CONNECTED CHANNELS ── */}
            <Card bg="white" className="p-6 border-4 border-dark-border shadow-solid mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-black text-xl text-dark-border flex items-center gap-2">
                        <Link2 size={24} className="text-accent-red" />
                        Connected Channels
                    </h2>
                    <Badge variant="green" className="text-xs">
                        {stats.totalConnectedChannels} connected
                    </Badge>
                </div>

                {/* YouTube Channel */}
                <div className="border-2 border-gray-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white">
                                <Youtube size={24} />
                            </div>
                            <div>
                                <h3 className="font-heading font-black text-lg text-dark-border mb-1">YouTube</h3>
                                {channels.youtube.connected ? (
                                    <>
                                        <p className="text-green-600 font-medium flex items-center gap-2 mb-2">
                                            <CheckCircle size={16} />
                                            Connected as {channels.youtube.channelTitle}
                                        </p>
                                        {channels.youtube.channelData && (
                                            <div className="grid grid-cols-3 gap-4 mt-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(channels.youtube.channelData.subscriberCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Subscribers</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(channels.youtube.channelData.videoCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Videos</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(channels.youtube.channelData.viewCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Total Views</div>
                                                </div>
                                            </div>
                                        )}
                                        {channels.youtube.connectedAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Connected on {formatDate(channels.youtube.connectedAt)}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 font-medium flex items-center gap-2">
                                        <XCircle size={16} />
                                        Not connected
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {channels.youtube.connected ? (
                                <button
                                    onClick={() => handleDisconnectChannel("youtube")}
                                    disabled={disconnecting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {disconnecting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            Disconnecting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Disconnect
                                        </>
                                    )}
                                </button>
                            ) : (
                                <a
                                    href="/api/youtube/auth"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-[2px_2px_0_#111827] hover:bg-red-700 transition-colors"
                                >
                                    <Link2 size={16} />
                                    Connect
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add more channels here in the future */}
                {stats.totalConnectedChannels === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <Link2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-bold">No channels connected yet</p>
                        <p className="text-sm mt-2">Connect your YouTube channel to get started</p>
                    </div>
                )}
            </Card>

            {/* ── ACCOUNT SETTINGS ── */}
            <Card bg="white" className="p-6 border-4 border-dark-border shadow-solid">
                <h2 className="font-heading font-black text-xl text-dark-border mb-6 flex items-center gap-2">
                    <Settings size={24} className="text-accent-red" />
                    Account Settings
                </h2>

                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-gray-600" />
                            <div className="text-left">
                                <div className="font-bold text-dark-border">Privacy & Security</div>
                                <div className="text-xs text-gray-500">Manage your privacy settings</div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <Eye size={20} className="text-gray-600" />
                            <div className="text-left">
                                <div className="font-bold text-dark-border">Data & Permissions</div>
                                <div className="text-xs text-gray-500">Control your data and app permissions</div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <LogOut size={20} className="text-gray-600" />
                            <div className="text-left">
                                <div className="font-bold text-dark-border">Sign Out</div>
                                <div className="text-xs text-gray-500">Sign out of your account</div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </Card>
        </div>
    );
}
