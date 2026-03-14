"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", emoji: "📊", href: "/dashboard" },
        { label: "Video Reports", emoji: "🎬", href: "/dashboard/report/1", notification: true },
        { label: "Idea Factory", emoji: "💡", href: "/dashboard/ideas" },
        { label: "Settings", emoji: "⚙️", href: "/dashboard/settings" },
    ];

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
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-orange-400 border-2 border-dark-border flex items-center justify-center text-white font-bold text-sm shadow-[2px_2px_0_#111827]">
                            MK
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-sm truncate text-dark-border">MrKreator</div>
                            <div className="text-xs font-bold text-gray-500">Pro Plan</div>
                        </div>
                    </div>
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
