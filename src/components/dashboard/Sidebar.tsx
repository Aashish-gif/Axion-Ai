"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Play, LogOut, User, Plus, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [userInitials, setUserInitials] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [firstVideoId, setFirstVideoId] = useState<string>("1");

    const navItems = [
        { label: "Dashboard", emoji: "📊", href: "/dashboard" },
        { label: "Reply Studio", emoji: "🤖", href: "/dashboard/comments" },
        { label: "Video Reports", emoji: "🎬", href: `/dashboard/report/${firstVideoId}`, notification: true },
        { label: "Idea Factory", emoji: "💡", href: "/dashboard/ideas" },
        { label: "Settings", emoji: "⚙️", href: "/dashboard/settings" },
    ];

    // Fetch user info on mount
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [userRes, videosRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/youtube/videos")
                ]);

                if (userRes.ok) {
                    const data = await userRes.json();
                    setUserName(data.user.name);
                    const parts = data.user.name.split(" ");
                    const initials = parts.length >= 2
                        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                        : data.user.name.substring(0, 2).toUpperCase();
                    setUserInitials(initials);
                }

                if (videosRes.ok) {
                    const data = await videosRes.json();
                    if (data.videos && data.videos.length > 0) {
                        setFirstVideoId(data.videos[0].id);
                    }
                }
            } catch {
                // Silently fail
            }
        }
        fetchInitialData();
    }, []);

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

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-white border-r-[3px] border-dark-border z-40 shadow-[4px_0_0_rgba(17,24,39,0.05)]">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="bg-accent-red text-white w-8 h-8 rounded-lg flex items-center justify-center border-2 border-dark-border shadow-[2px_2px_0_#111827]">
                            <Play size={16} fill="currentColor" />
                        </div>
                        <span className="font-heading font-black text-xl tracking-tight text-dark-border">Axionix</span>
                    </Link>

                    <div className="text-xs font-bold text-gray-400 mb-4 px-2 uppercase tracking-wider">MAIN</div>
                    <nav className="space-y-2 mb-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all relative ${isActive
                                            ? "bg-accent-red text-white font-heading font-extrabold border-[2.5px] border-dark-border shadow-[3px_4px_0_#111827]"
                                            : "text-gray-600 font-bold border-[2.5px] border-transparent hover:border-dark-border hover:shadow-[3px_4px_0_#111827] hover:translate-x-[3px] hover:text-dark-border"
                                        }`}
                                >
                                    <span className="text-xl">{item.emoji}</span>
                                    <span>{item.label}</span>
                                    {item.notification && !isActive && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent-red rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="text-xs font-bold text-gray-400 mb-4 px-2 uppercase tracking-wider">ACCOUNT</div>
                    
                    {/* User Account - Clickable to Profile */}
                    <Link
                        href="/dashboard/profile"
                        className={`flex items-center gap-3 px-2 mb-3 p-2 rounded-xl transition-all ${pathname === "/dashboard/profile"
                            ? "bg-accent-red text-white font-heading font-extrabold border-[2.5px] border-dark-border shadow-[3px_4px_0_#111827]"
                            : "text-gray-600 font-bold border-[2.5px] border-transparent hover:border-dark-border hover:shadow-[3px_4px_0_#111827] hover:translate-x-[3px] hover:text-dark-border"
                        }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-orange-400 border-2 border-dark-border flex items-center justify-center text-white font-bold text-sm shadow-[2px_2px_0_#111827]">
                            {userInitials || "..."}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <div className="font-bold text-sm truncate text-inherit">{userName || "Loading..."}</div>
                            <div className="text-xs font-bold text-inherit opacity-70">View Profile</div>
                        </div>
                        <ChevronRight size={16} className="text-inherit" />
                    </Link>
                    
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        suppressHydrationWarning
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-heading font-bold rounded-xl border-[2.5px] border-dark-border shadow-[3px_4px_0_#111827] bg-white text-dark-border transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:text-accent-red active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50"
                    >
                        <LogOut size={16} />
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-dark-border z-40 pb-safe shadow-[0_-4px_0_rgba(17,24,39,0.05)]">
                <div className="flex justify-around items-center p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${isActive
                                        ? "bg-accent-red text-white border-2 border-dark-border shadow-[2px_3px_0_#111827] -translate-y-1"
                                        : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100 border-2 border-transparent"
                                    }`}
                            >
                                <span className="text-xl leading-none">{item.emoji}</span>
                                {item.notification && !isActive && (
                                    <div className="absolute right-2 top-2 w-2 h-2 bg-accent-red rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
