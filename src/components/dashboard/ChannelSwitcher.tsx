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

const mockChannels: Channel[] = [
    {
        id: '1',
        name: 'Axionix Official',
        subscribers: '1.2M',
        avatarUrl: 'https://ui-avatars.com/api/?name=Axionix+Official&background=FF3B3B&color=fff',
    },
    {
        id: '2',
        name: 'Tech Updates',
        subscribers: '450K',
        avatarUrl: 'https://ui-avatars.com/api/?name=Tech+Updates&background=111827&color=fff',
    }
];

export function ChannelSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState<Channel>(mockChannels[0]);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                        {mockChannels.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => {
                                    setActiveChannel(channel);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors border-b-2 border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={channel.avatarUrl} 
                                        alt={channel.name} 
                                        className="w-10 h-10 rounded-full border-2 border-dark-border"
                                    />
                                    <div className="text-left">
                                        <div className="font-bold text-dark-border text-sm">{channel.name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{channel.subscribers} subs</div>
                                    </div>
                                </div>
                                {activeChannel.id === channel.id && (
                                    <Check size={18} className="text-accent-red" />
                                )}
                            </button>
                        ))}
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
