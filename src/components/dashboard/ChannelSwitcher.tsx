"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Youtube, Check } from 'lucide-react';
import { Button } from "@/components/ui/Button";

type Channel = {
    id: string;
    name: string;
    subscribers: string;
    avatarUrl: string;
};

export function ChannelSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch real channel info
    useEffect(() => {
        async function fetchChannel() {
            try {
                const res = await fetch("/api/youtube/stats");
                if (res.ok) {
                    const data = await res.json();
                    setActiveChannel({
                        id: 'mine',
                        name: data.channelName,
                        subscribers: (data.totalSubscribers / 1000).toFixed(0) + 'K', // Simple formatting
                        avatarUrl: data.channelAvatar
                    });
                }
            } catch (err) {
                console.error("Fetch channel switcher error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchChannel();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading || !activeChannel) {
        return (
            <div className="w-48 h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                suppressHydrationWarning
                className="flex items-center gap-3 p-2 pr-4 bg-white border-[3px] border-dark-border rounded-xl shadow-[4px_5px_0_#111827] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
                <img 
                    src={activeChannel.avatarUrl} 
                    alt={activeChannel.name} 
                    className="w-8 h-8 rounded-full border-2 border-dark-border"
                />
                <span className="font-heading font-bold text-dark-border max-w-[120px] truncate">
                    {activeChannel.name}
                </span>
                <ChevronDown size={18} className={`text-dark-border transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white border-[3px] border-dark-border rounded-2xl shadow-[8px_10px_0px_#111827] z-50 overflow-hidden flex flex-col">
                    <div className="p-3 border-b-[3px] border-dark-border bg-gray-50">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Channels</span>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        <button
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors border-b-2 border-gray-100 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <img 
                                    src={activeChannel.avatarUrl} 
                                    alt={activeChannel.name} 
                                    className="w-10 h-10 rounded-full border-2 border-dark-border"
                                />
                                <div className="text-left">
                                    <div className="font-bold text-dark-border text-sm">{activeChannel.name}</div>
                                    <div className="text-xs text-gray-500 font-medium">{activeChannel.subscribers} subs</div>
                                </div>
                            </div>
                            <Check size={18} className="text-accent-red" />
                        </button>
                    </div>

                    <div className="p-3 border-t-[3px] border-dark-border bg-gray-50">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-heading font-bold rounded-xl border-[2px] border-dark-border shadow-[2px_3px_0_#111827] bg-white text-dark-border transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-0 active:translate-y-0 active:shadow-none">
                            <Plus size={18} />
                            Add New Channel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
