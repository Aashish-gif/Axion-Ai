"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
    const [emailNotif, setEmailNotif] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [commentAlerts, setCommentAlerts] = useState(false);

    return (
        <div className="animate-in fade-in duration-500 max-w-3xl mx-auto pb-10">
            <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-8">
                Settings ⚙️
            </h1>

            <div className="space-y-8">
                {/* Connected Channel */}
                <section>
                    <h2 className="font-heading font-black text-xl mb-4 text-dark-border">Connected Channel</h2>
                    <Card bg="mint" className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-red to-orange-400 border-[3px] border-dark-border flex items-center justify-center text-white font-bold text-2xl shadow-[4px_4px_0_#111827] shrink-0">
                            MK
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-heading font-black text-2xl mb-1">MrKreator</h3>
                            <p className="text-gray-600 font-bold mb-3">142,593 Subscribers</p>
                            <Badge variant="green" className="!shadow-none flex items-center gap-2 w-fit mx-auto sm:mx-0">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Connected
                            </Badge>
                        </div>
                        <Button variant="secondary" className="w-full sm:w-auto mt-4 sm:mt-0">Disconnect</Button>
                    </Card>
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
                            <Toggle checked={emailNotif} onChange={setEmailNotif} />
                        </Card>
                        <Card className="p-5 flex items-center justify-between bg-white">
                            <div>
                                <div className="font-bold text-lg mb-1">Weekly Digest</div>
                                <div className="text-sm font-medium text-gray-500">Get a summary of your channel's performance every Monday.</div>
                            </div>
                            <Toggle checked={weeklyReport} onChange={setWeeklyReport} />
                        </Card>
                        <Card className="p-5 flex items-center justify-between bg-white">
                            <div>
                                <div className="font-bold text-lg mb-1">Negative Sentiment Alerts</div>
                                <div className="text-sm font-medium text-gray-500">Alert if a video's sentiment drops below 50%.</div>
                            </div>
                            <Toggle checked={commentAlerts} onChange={setCommentAlerts} />
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
                                    Pro Plan <Badge variant="dark" className="text-xs !py-0.5 align-middle">Active</Badge>
                                </h3>
                                <p className="text-gray-700 font-bold">$19/month, next billing on Oct 12, 2024.</p>
                            </div>
                            <Button variant="dark" className="w-full sm:w-auto">Manage Billing</Button>
                        </div>

                        <div className="bg-white/50 rounded-xl p-4 border-2 border-dark-border border-dashed">
                            <div className="font-bold mb-3 leading-none">Usage this month</div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1 h-3 bg-white border-2 border-dark-border rounded-full overflow-hidden">
                                    <div className="w-[60%] h-full bg-accent-red"></div>
                                </div>
                                <span className="font-black text-sm w-12 text-right">12 / 20</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500">You've generated 12 PDF reports out of your 20 allowance.</p>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
