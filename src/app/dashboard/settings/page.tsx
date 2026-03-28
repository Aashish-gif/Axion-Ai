"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import {
    Loader2, Youtube, Link2, Settings, Plus, X, CheckCircle, XCircle, 
    AlertCircle, Trash2, Users, Video, ChevronRight, Moon, Sun, Mail, Globe
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

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [usageData, setUsageData] = useState<any>(null);
    const [showAddChannelModal, setShowAddChannelModal] = useState(false);

    const handleLanguageChange = async (newLanguage: string) => {
        setLanguage(newLanguage as keyof typeof LANGUAGES);
        
        // Also save to database
        try {
            setSaving(true);
            const res = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: newLanguage }),
            });
            
            if (!res.ok) {
                console.error('Failed to save language preference');
            }
        } catch (error) {
            console.error('Failed to update language:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        // Check if we need to show add channel modal
        const action = searchParams.get('action');
        if (action === 'add-channel') {
            setShowAddChannelModal(true);
            // Clear the action from URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        loadSettings();
        loadProfileData();
    }, [searchParams]);

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/dashboard/settings');
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setUsageData(data.usage);
                setEmailNotif(data.user.emailNotifications);
                
                // Load language from database if available
                if (data.settings?.language) {
                    setLanguage(data.settings.language as keyof typeof LANGUAGES);
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProfileData = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch profile data");
            }
            const data = await res.json();
            setProfileData(data);
        } catch (err: any) {
            console.error('Failed to load profile data:', err);
        }
    };

    const updateSetting = async (key: string, value: boolean) => {
        setSaving(true);
        try {
            const res = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            });
            
            if (res.ok) {
                // Update local state
                if (key === 'emailNotifications') setEmailNotif(value);
            }
        } catch (error) {
            console.error('Failed to update setting:', error);
        } finally {
            setSaving(false);
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

                // Also update settings page data
                await loadSettings();
                alert('YouTube channel disconnected successfully!');
            } catch (err: any) {
                alert(err.message);
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

    // Show loading screen while fetching data
    if (loading) {
        return <LoadingScreen message="Loading your settings..." variant="default" fullScreen={false} />;
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-3xl mx-auto pb-10">
            <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-8">
                Settings ⚙️
            </h1>

            <div className="space-y-8">
                {/* Channel Management */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-black text-xl text-dark-border flex items-center gap-2">
                            <Link2 size={24} className="text-accent-red" />
                            Channel Management
                        </h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="green" className="text-xs">
                                {profileData?.stats.totalConnectedChannels || 0} connected
                            </Badge>
                            <button
                                onClick={() => setShowAddChannelModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-accent-red text-white font-bold text-xs rounded-xl border-2 border-dark-border shadow-[2px_2px_0_#111827] hover:bg-red-700 transition-colors"
                            >
                                <Plus size={14} />
                                Add Channel
                            </button>
                        </div>
                    </div>

                    {/* Connected Channels */}
                    {profileData?.channels.youtube.connected ? (
                        <Card bg="white" className="p-6 border-4 border-dark-border shadow-solid mb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white">
                                        <Youtube size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-black text-lg text-dark-border mb-1">YouTube</h3>
                                        <p className="text-green-600 font-medium flex items-center gap-2 mb-2">
                                            <CheckCircle size={16} />
                                            Connected as {profileData.channels.youtube.channelTitle}
                                        </p>
                                        {profileData.channels.youtube.channelData && (
                                            <div className="grid grid-cols-3 gap-4 mt-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(profileData.channels.youtube.channelData.subscriberCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Subscribers</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(profileData.channels.youtube.channelData.videoCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Videos</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-black text-dark-border">
                                                        {formatNumber(profileData.channels.youtube.channelData.viewCount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Total Views</div>
                                                </div>
                                            </div>
                                        )}
                                        {profileData.channels.youtube.connectedAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Connected on {formatDate(profileData.channels.youtube.connectedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
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
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6 border-2 border-dashed border-gray-300 bg-gray-50">
                            <div className="text-center">
                                <p className="font-bold text-lg mb-2">No channels connected yet</p>
                                <p className="text-sm text-gray-600 mb-4">Connect your social media channels to manage them here</p>
                                <button
                                    onClick={() => setShowAddChannelModal(true)}
                                    className="px-6 py-3 bg-accent-red text-white font-bold rounded-xl border-2 border-dark-border shadow-[2px_2px_0_#111827] hover:bg-red-700 transition-colors"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Connect Your First Channel
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* Available Channels */}
                    <div className="mt-6">
                        <h3 className="font-heading font-black text-lg text-dark-border mb-4">Available Channels</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* YouTube - Already Connected */}
                            {profileData?.channels.youtube.connected ? (
                                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                                            <Youtube size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-dark-border">YouTube</h4>
                                            <p className="text-xs text-green-600 font-medium">Connected</p>
                                        </div>
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowAddChannelModal(false);
                                        window.location.href = "/api/auth/youtube";
                                    }}
                                    className="border-2 border-gray-200 bg-white rounded-xl p-4 hover:border-accent-red hover:bg-red-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <Youtube size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className="font-bold text-dark-border group-hover:text-accent-red">YouTube</h4>
                                            <p className="text-xs text-gray-500">Connect your channel</p>
                                        </div>
                                        <Plus size={20} className="text-gray-400 group-hover:text-accent-red" />
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Add Channel Modal */}
                    {showAddChannelModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl border-4 border-dark-border shadow-solid max-w-lg w-full p-6 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-heading font-black text-xl text-dark-border">Add New Channel</h3>
                                    <button
                                        onClick={() => setShowAddChannelModal(false)}
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setShowAddChannelModal(false);
                                            window.location.href = "/api/auth/youtube";
                                        }}
                                        className="w-full border-2 border-gray-200 bg-white rounded-xl p-4 hover:border-accent-red hover:bg-red-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                                <Youtube size={24} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-bold text-dark-border group-hover:text-accent-red">YouTube</h4>
                                                <p className="text-xs text-gray-500">Connect your YouTube channel</p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-400 group-hover:text-accent-red" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Notifications */}
                <section>
                    <h2 className="font-heading font-black text-xl mb-4 text-dark-border">{t('settings.notifications')}</h2>
                    <div className="space-y-4">
                        <Card className="p-8 flex items-center justify-between bg-white border-4 border-dark-border shadow-solid relative overflow-hidden">
                            {/* Background gradient effect */}
                            <div className={`absolute inset-0 opacity-10 transition-all duration-300 ${emailNotif ? 'bg-gradient-to-br from-green-200 to-blue-200' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}></div>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${emailNotif ? 'bg-gradient-to-br from-green-400 to-blue-400' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
                                    <Mail size={32} className={emailNotif ? "text-white animate-bounce" : "text-gray-600"} />
                                </div>
                                <div>
                                    <div className="font-heading font-black text-2xl mb-2 text-dark-border flex items-center gap-2">
                                        {t('settings.email_notifications')}
                                        <Badge variant={emailNotif ? 'green' : 'dark'} className="text-xs !bg-gray-100 !text-gray-600">
                                            {emailNotif ? t('common.on') : t('common.off')}
                                        </Badge>
                                    </div>
                                    <div className="text-base font-medium text-gray-600">{t('settings.email_desc')}</div>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <input
                                    type="checkbox"
                                    id="email-notifications"
                                    checked={emailNotif}
                                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                                    className="sr-only"
                                />
                                <label 
                                    htmlFor="email-notifications"
                                    className={`relative w-24 h-12 rounded-full border-[4px] border-dark-border transition-all duration-500 shadow-[4px_4px_0_#111827] focus:outline-none cursor-pointer hover:scale-105 active:scale-95 ${emailNotif ? "bg-gradient-to-r from-green-400 via-blue-400 to-green-500" : "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500"
                                        }`}
                                >
                                    <div
                                        className={`absolute top-[3px] left-[3px] w-7 h-7 bg-white rounded-full border-[3px] border-dark-border transition-all duration-500 flex items-center justify-center shadow-lg ${emailNotif ? "translate-x-12" : "translate-x-0"
                                            }`}
                                    >
                                        <Mail size={16} className={emailNotif ? "text-green-600" : "text-gray-600"} />
                                    </div>
                                    {/* Animated dots */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${emailNotif ? 'left-8 opacity-0' : 'left-4 opacity-100'}`}>
                                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                    </div>
                                    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${emailNotif ? 'right-4 opacity-100' : 'right-8 opacity-0'}`}>
                                        <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                                    </div>
                                </label>
                            </div>
                        </Card>
                        <Card className="p-8 flex items-center justify-between bg-white border-4 border-dark-border shadow-solid relative overflow-hidden">
                            {/* Background gradient effect */}
                            <div className={`absolute inset-0 opacity-10 transition-all duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-yellow-200 to-orange-200'}`}></div>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-yellow-300 to-orange-300'}`}>
                                    {theme === 'dark' ? <Moon size={32} className="text-yellow-400 animate-pulse" /> : <Sun size={32} className="text-yellow-600 animate-spin-slow" />}
                                </div>
                                <div>
                                    <div className="font-heading font-black text-2xl mb-2 text-dark-border flex items-center gap-2">
                                        {t('settings.dark_mode')}
                                        <Badge variant={theme === 'dark' ? 'green' : 'yellow'} className="text-xs">
                                            {theme === 'dark' ? t('common.on') : t('common.off')}
                                        </Badge>
                                    </div>
                                    <div className="text-base font-medium text-gray-600">{t('settings.dark_mode_desc')}</div>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <input
                                    type="checkbox"
                                    id="dark-mode"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                    className="sr-only"
                                />
                                <label 
                                    htmlFor="dark-mode"
                                    className={`relative w-24 h-12 rounded-full border-[4px] border-dark-border transition-all duration-500 shadow-[4px_4px_0_#111827] focus:outline-none cursor-pointer hover:scale-105 active:scale-95 ${theme === 'dark' ? "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900" : "bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400"
                                        }`}
                                >
                                    <div
                                        className={`absolute top-[3px] left-[3px] w-7 h-7 bg-white rounded-full border-[3px] border-dark-border transition-all duration-500 flex items-center justify-center shadow-lg ${theme === 'dark' ? "translate-x-12" : "translate-x-0"
                                            }`}
                                    >
                                        {theme === 'dark' ? <Moon size={16} className="text-gray-700" /> : <Sun size={16} className="text-yellow-600" />}
                                    </div>
                                    {/* Animated dots */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${theme === 'dark' ? 'left-8 opacity-0' : 'left-4 opacity-100'}`}>
                                        <div className="w-1 h-1 bg-yellow-600 rounded-full"></div>
                                    </div>
                                    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${theme === 'dark' ? 'right-4 opacity-100' : 'right-8 opacity-0'}`}>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </label>
                            </div>
                        </Card>
                        <Card className="p-8 flex items-center justify-between bg-white border-4 border-dark-border shadow-solid relative overflow-hidden">
                            {/* Background gradient effect */}
                            <div className={`absolute inset-0 opacity-10 transition-all duration-300 bg-gradient-to-br from-blue-200 to-purple-200`}></div>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-400 to-purple-400">
                                    <Globe size={32} className="text-white animate-spin-slow" />
                                </div>
                                <div>
                                    <div className="font-heading font-black text-2xl mb-2 text-dark-border flex items-center gap-2">
                                        {t('settings.language')}
                                        <Badge variant="dark" className="text-xs !bg-blue-100 !text-blue-600">
                                            {LANGUAGES[language].nativeName}
                                        </Badge>
                                    </div>
                                    <div className="text-base font-medium text-gray-600">{t('settings.language_desc')}</div>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="w-48 h-12 px-4 border-[4px] border-dark-border rounded-2xl shadow-[4px_4px_0_#111827] focus:outline-none focus:border-accent-red transition-all duration-300 bg-white font-bold text-dark-border hover:scale-105 active:scale-95"
                                >
                                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                                        <option key={code} value={code} className="font-medium">
                                            {lang.name} ({lang.nativeName})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}
