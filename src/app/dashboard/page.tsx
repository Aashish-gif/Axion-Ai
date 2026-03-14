import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockVideos } from "@/lib/mockData";
import { Play } from "lucide-react";

export default function DashboardHome() {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-1">
                        Hey, MrKreator! 👋
                    </h1>
                    <p className="text-gray-500 font-bold">Here is what your audience is saying today.</p>
                </div>
                <Button variant="primary" className="flex items-center gap-2 w-fit">
                    <Play size={18} fill="currentColor" /> Sync Channel
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {[
                    { bg: "mint" as const, emoji: "💬", label: "TOTAL COMMENTS", value: "48,291", trend: "+12% this week", badge: null },
                    { bg: "yellow" as const, emoji: "😊", label: "AVG SENTIMENT", value: "84%", trend: "Mostly Positive", badge: null },
                    { bg: "blue" as const, emoji: "🏆", label: "TOP REQUEST", value: "More Tutorials!", trend: "Mentioned 421 times", badge: null },
                    { bg: "lavender" as const, emoji: "❤️", label: "CHANNEL VIBE", value: "Growing", trend: "", badge: "On Fire" },
                ].map((stat, i) => (
                    <Card key={i} bg={stat.bg} hoverLift className="p-5 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-3xl">{stat.emoji}</span>
                            {stat.badge && <Badge variant="green" className="text-xs !py-0.5">{stat.badge}</Badge>}
                        </div>
                        <div>
                            <div className="text-[10px] md:text-xs font-black text-gray-500 tracking-wider mb-1">{stat.label}</div>
                            <div className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-dark-border leading-none">{stat.value}</div>
                            {stat.trend && <div className="text-xs font-bold text-green-600 mt-2">{stat.trend}</div>}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-black text-2xl text-dark-border">Recent Videos</h2>
            </div>

            {/* Recent Videos Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockVideos.map((video) => (
                    <Link href={`/dashboard/report/${video.id}`} key={video.id} className="block group">
                        <Card hoverLift className="flex flex-col h-full bg-white transition-all overflow-hidden group-hover:-translate-y-1">
                            <div
                                className="h-[180px] w-full flex items-center justify-center relative border-b-[3px] border-dark-border"
                                style={{ background: `linear-gradient(135deg, ${video.gradientFrom}, ${video.gradientTo})` }}
                            >
                                <span className="text-6xl drop-shadow-md z-10 transition-transform group-hover:scale-110">{video.emoji}</span>

                                {/* Hover Play Overlay */}
                                <div className="absolute inset-0 bg-dark-border/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-[3px] border-dark-border shadow-[4px_4px_0_#111827]">
                                        <Play size={24} fill="currentColor" className="ml-1 text-dark-border" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-heading font-extrabold text-lg text-dark-border leading-tight mb-4 flex-1 line-clamp-2">
                                    {video.title}
                                </h3>

                                <div className="flex items-center gap-2 mt-auto pt-2">
                                    <Badge variant={video.sentimentScore >= 80 ? 'green' : 'red'} className="text-xs">
                                        {video.sentimentScore}% Positive
                                    </Badge>
                                    <Badge variant="dark" className="text-xs bg-gray-100 !text-gray-600 !border-gray-300 !shadow-none">
                                        {video.commentCount} cmts
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
