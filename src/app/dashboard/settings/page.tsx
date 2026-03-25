"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingScreen, MiniLoader } from "@/components/ui/LoadingScreen";
import { Loader2 } from "lucide-react";

// Custom Toggle Component
function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-14 h-8 rounded-full border-[2.5px] border-dark-border transition-colors shadow-[2px_2px_0_#111827] focus:outline-none ${checked ? "bg-green-400" : "bg-gray-300"
                }`}
        >
            <div
                className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full border-2 border-dark-border transition-transform ${checked ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </button>
    );
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [commentAlerts, setCommentAlerts] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [usageData, setUsageData] = useState<any>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/dashboard/settings');
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setUsageData(data.usage);
                setEmailNotif(data.user.emailNotifications);
                setWeeklyReport(data.user.weeklyDigest);
                setCommentAlerts(data.user.negativeSentimentAlerts);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
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
                if (key === 'weeklyDigest') setWeeklyReport(value);
                if (key === 'negativeSentimentAlerts') setCommentAlerts(value);
            }
        } catch (error) {
            console.error('Failed to update setting:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your YouTube channel? You will need to reconnect to view analytics and reports.')) {
            return;
        }
        
        setDisconnecting(true);
        try {
            const res = await fetch('/api/auth/disconnect-youtube', {
                method: 'POST',
            });
            
            if (res.ok) {
                // Reload settings to reflect changes
                await loadSettings();
                alert('YouTube channel disconnected successfully!');
            } else {
                alert('Failed to disconnect YouTube channel. Please try again.');
            }
        } catch (error) {
            console.error('Disconnect error:', error);
            alert('Failed to disconnect YouTube channel. Please try again.');
        } finally {
            setDisconnecting(false);
        }
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
                {/* Connected Channel */}
                <section>
                    <h2 className="font-heading font-black text-xl mb-4 text-dark-border">Connected Channel</h2>
                    {userData?.youtubeConnected ? (
                        <Card bg="mint" className="p-6 flex flex-col sm:flex-row items-center gap-6">
                            {userData.youtubeChannelThumbnail ? (
                                <img 
                                    src={userData.youtubeChannelThumbnail} 
                                    alt={userData.youtubeChannelTitle || 'Channel'} 
                                    className="w-20 h-20 rounded-full border-[3px] border-dark-border shadow-[4px_4px_0_#111827] shrink-0 object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-red to-orange-400 border-[3px] border-dark-border flex items-center justify-center text-white font-bold text-2xl shadow-[4px_4px_0_#111827] shrink-0">
                                    {userData.youtubeChannelTitle?.charAt(0) || userData.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-heading font-black text-2xl mb-1">{userData.youtubeChannelTitle || 'YouTube Channel'}</h3>
                                <p className="text-gray-600 font-bold mb-3">Connected via YouTube OAuth</p>
                                <Badge variant="green" className="!shadow-none flex items-center gap-2 w-fit mx-auto sm:mx-0">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Connected
                                </Badge>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="w-full sm:w-auto mt-4 sm:mt-0"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                            >
                                {disconnecting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Disconnecting...</>
                                ) : (
                                    "Disconnect"
                                )}
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-6 border-2 border-dashed border-gray-300 bg-gray-50">
                            <div className="text-center">
                                <p className="font-bold text-lg mb-2">No YouTube channel connected</p>
                                <p className="text-sm text-gray-600 mb-4">Connect your YouTube channel to access analytics and reports</p>
                                <a href="/api/auth/youtube">
                                    <Button variant="primary">Connect YouTube</Button>
                                </a>
                            </div>
                        </Card>
                    )}
                </section>

                {/* Notifications */}
                <section>
                    <h2 className="font-heading font-black text-xl mb-4 text-dark-border">Notifications</h2>
                    <div className="space-y-4">
                        <Card className="p-5 flex items-center justify-between bg-white">
                            <div>
                                <div className="font-bold text-lg mb-1">Email Updates</div>
                                <div className="text-sm font-medium text-gray-500">Receive an email when a new video report is ready.</div>
                            </div>
                            <Toggle checked={emailNotif} onChange={(v) => updateSetting('emailNotifications', v)} />
                        </Card>
                        <Card className="p-5 flex items-center justify-between bg-white">
                            <div>
                                <div className="font-bold text-lg mb-1">Weekly Digest</div>
                                <div className="text-sm font-medium text-gray-500">Get a summary of your channel's performance every Monday.</div>
                            </div>
                            <Toggle checked={weeklyReport} onChange={(v) => updateSetting('weeklyDigest', v)} />
                        </Card>
                        <Card className="p-5 flex items-center justify-between bg-white">
                            <div>
                                <div className="font-bold text-lg mb-1">Negative Sentiment Alerts</div>
                                <div className="text-sm font-medium text-gray-500">Alert if a video's sentiment drops below 50%.</div>
                            </div>
                            <Toggle checked={commentAlerts} onChange={(v) => updateSetting('negativeSentimentAlerts', v)} />
                        </Card>
                    </div>
                </section>

                {/* Plan & Billing */}
                <section>
                    <h2 className="font-heading font-black text-xl mb-4 text-dark-border">Billing & Plan</h2>
                    <Card bg="yellow" className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="font-heading font-black text-2xl mb-1 flex items-center gap-3">
                                    {usageData?.plan || 'Pro'} Plan <Badge variant="dark" className="text-xs !py-0.5 align-middle">{usageData?.planStatus || 'Active'}</Badge>
                                </h3>
                                <p className="text-gray-700 font-bold">{usageData?.price || '$19/month'}, next billing on {usageData?.nextBilling || 'Oct 12, 2024'}.</p>
                            </div>
                            <Button variant="dark" className="w-full sm:w-auto">Manage Billing</Button>
                        </div>

                        <div className="bg-white/50 rounded-xl p-4 border-2 border-dark-border border-dashed">
                            <div className="font-bold mb-3 leading-none">Usage this month</div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1 h-3 bg-white border-2 border-dark-border rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-accent-red transition-all duration-500" 
                                        style={{ width: `${((usageData?.reportsGenerated || 0) / (usageData?.reportsLimit || 20)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="font-black text-sm w-12 text-right">{usageData?.reportsGenerated || 0} / {usageData?.reportsLimit || 20}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500">You've generated {usageData?.reportsGenerated || 0} PDF reports out of your {usageData?.reportsLimit || 20} allowance.</p>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
