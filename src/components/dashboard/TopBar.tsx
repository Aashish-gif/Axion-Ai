"use client";

import React from 'react';
import { ChannelSwitcher } from './ChannelSwitcher';
import { Search, Bell, LogOut } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';

export function TopBar() {
    const router = useRouter();
    const [userName, setUserName] = React.useState("");
    const [userEmail, setUserEmail] = React.useState("");
    const [showProfile, setShowProfile] = React.useState(false);
    const [loggingOut, setLoggingOut] = React.useState(false);

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
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }
        fetchUser();
    }, []);

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
                <button 
                    suppressHydrationWarning
                    className="hidden sm:flex w-11 h-11 bg-white border-[3px] border-dark-border rounded-xl shadow-[4px_5px_0_#111827] items-center justify-center transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none hover:text-accent-red"
                >
                    <Bell size={20} />
                </button>
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
