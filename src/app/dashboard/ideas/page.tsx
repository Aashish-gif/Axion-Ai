"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Lightbulb, TrendingUp, Target, Clock, BarChart3, Sparkles, AlertCircle, CheckCircle2, Loader2, Filter } from "lucide-react";

interface VideoIdea {
  title: string;
  hook: string;
  description: string;
  targetAudience: string;
  trendingScore: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  estimatedDifficulty: 'Easy' | 'Medium' | 'Hard';
  contentGapsToFill: string[];
  keywords: string[];
  thumbnailConcept: string;
  whyItWillWork: string;
  category: string;
}

export default function IdeasPage() {
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedIdeas, setGeneratedIdeas] = useState<VideoIdea[]>([]);
    const [metadata, setMetadata] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'trending' | 'competition'>('trending');

    const predefinedTopics = [
        "🎮 Gaming", "💄 Beauty & Fashion", "🍳 Food & Cooking", 
        "✈️ Travel", "💪 Fitness", "🎵 Music & Entertainment",
        "💼 Business & Finance", "🏋️ Lifestyle & Vlogs", "📱 Tech Reviews",
        "🎬 Film & Animation", "📚 Education & Tutorials", "🐾 Pets & Animals"
    ];

    const handleGenerateIdeas = async () => {
        if (!topic.trim()) return;
        
        setIsGenerating(true);
        try {
            const res = await fetch('/api/dashboard/ideas/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    marketScenario: "2024 YouTube trends: Short-form driving long-form discovery, authentic storytelling over polished production, educational entertainment (edutainment), series-based content for binge-watching, community-driven content based on comments/polls"
                })
            });
            
            const data = await res.json();
            setGeneratedIdeas(data.ideas);
            setMetadata(data.metadata);
        } catch (error) {
            console.error("Failed to generate ideas:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getTrendingScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    const getCompetitionBadge = (level: string) => {
        if (level === 'Low') return <Badge variant="green">Low Competition 🔵</Badge>;
        if (level === 'Medium') return <Badge variant="yellow">Medium 🟡</Badge>;
        return <Badge variant="red">High 🔴</Badge>;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Tutorial': 'bg-mint',
            'Review': 'bg-yellow',
            'Case Study': 'bg-lavender',
            'Opinion': 'bg-blue',
            'Challenge': 'bg-red-50',
            'List': 'bg-purple-50'
        };
        return colors[category] || 'bg-gray-50';
    };

    const filteredIdeas = generatedIdeas.filter(idea => {
        if (selectedCategory === 'all') return true;
        return idea.category === selectedCategory;
    });

    const sortedIdeas = [...filteredIdeas].sort((a, b) => {
        if (sortBy === 'trending') return b.trendingScore - a.trendingScore;
        if (sortBy === 'competition') {
            const order = { 'Low': 1, 'Medium': 2, 'High': 3 };
            return order[a.competitionLevel] - order[b.competitionLevel];
        }
        return 0;
    });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            {/* Hero Banner Card */}
            <Card
                className="p-8 md:p-12 mb-10 text-center flex flex-col items-center justify-center border-white shadow-[8px_10px_0px_#111827]"
                style={{ background: 'linear-gradient(135deg, #FF3B3B, #FF6B35)' }}
            >
                <span className="text-6xl mb-4 drop-shadow-md">🧠</span>
                <h1 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">
                    AI-Powered Idea Factory
                </h1>
                <p className="text-white/90 font-medium text-lg md:text-xl mb-8 max-w-3xl">
                    Generate data-driven video ideas for ANY niche - Entertainment, Education, Lifestyle, Tech, Beauty, Gaming & more. Let AI tell you what will go viral.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mb-6">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                        placeholder="What's your niche? (e.g., Next.js tutorials, camera reviews, productivity tips...)"
                        className="flex-1 bg-white/10 border-2 border-white/40 text-white placeholder:text-white/60 rounded-2xl px-5 py-3 font-bold outline-none focus:border-white focus:bg-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                    />
                    <Button
                        variant="secondary"
                        className="whitespace-nowrap flex items-center justify-center gap-2"
                        onClick={handleGenerateIdeas}
                        disabled={isGenerating || !topic.trim()}
                    >
                        {isGenerating ? (
                            <><Loader2 size={18} className="animate-spin" /> Analyzing Trends...</>
                        ) : (
                            <><Sparkles size={18} /> Generate Ideas</>
                        )}
                    </Button>
                </div>

                {/* Quick Select Topics */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {predefinedTopics.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/40 rounded-xl text-white font-bold text-sm transition-all"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Stats Overview */}
            {metadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card bg="white" className="p-4 border-2 border-dark-border shadow-solid">
                        <div className="text-xs font-black text-gray-500 uppercase mb-1">Total Ideas</div>
                        <div className="text-3xl font-black text-dark-border">{metadata.totalIdeas}</div>
                    </Card>
                    <Card bg="mint" className="p-4 border-2 border-dark-border shadow-solid">
                        <div className="text-xs font-black text-gray-500 uppercase mb-1">Avg Trend Score</div>
                        <div className="text-3xl font-black text-green-600">{metadata.avgTrendingScore}</div>
                    </Card>
                    <Card bg="lavender" className="p-4 border-2 border-dark-border shadow-solid">
                        <div className="text-xs font-black text-gray-500 uppercase mb-1">Low Competition</div>
                        <div className="text-3xl font-black text-purple-600">{metadata.lowCompetitionCount}</div>
                    </Card>
                    <Card bg="yellow" className="p-4 border-2 border-dark-border shadow-solid">
                        <div className="text-xs font-black text-gray-500 uppercase mb-1">Categories</div>
                        <div className="text-3xl font-black text-yellow-600">{metadata.categories.length}</div>
                    </Card>
                </div>
            )}

            {/* Filters & Sort */}
            {generatedIdeas.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-black text-2xl text-dark-border flex items-center gap-2">
                        <Lightbulb size={24} className="text-accent-red" />
                        Generated Ideas ({sortedIdeas.length})
                    </h2>
                    <div className="flex gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border-2 border-dark-border rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-accent-red"
                        >
                            <option value="all">All Categories</option>
                            {metadata?.categories.map((cat: string) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border-2 border-dark-border rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-accent-red"
                        >
                            <option value="trending">Sort by Trending</option>
                            <option value="competition">Sort by Competition</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <LoadingScreen message="Analyzing Market Trends..." variant="content" fullScreen={false} />
                    <ul className="mt-8 space-y-2 text-left bg-white p-6 rounded-2xl border-[3px] border-dark-border shadow-[4px_5px_0_#111827]">
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Current trending topics</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Content gap analysis</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Competition levels</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Viral potential scoring</li>
                    </ul>
                </div>
            ) : sortedIdeas.length === 0 ? (
                <div className="text-center py-20">
                    <Lightbulb size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-heading font-bold text-xl text-gray-400">Enter your niche above to generate AI-powered video ideas</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedIdeas.map((idea, i) => (
                        <Card 
                            key={i} 
                            className={`p-6 relative group overflow-hidden ${getCategoryColor(idea.category)}`}
                            hoverLift
                        >
                            {/* Number Background */}
                            <div className="absolute -top-4 -right-2 text-8xl font-heading font-black text-black opacity-[0.03] select-none transition-transform group-hover:scale-110">
                                {String(i + 1).padStart(2, '0')}
                            </div>

                            {/* Header */}
                            <div className="relative z-10 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-4xl font-heading font-black text-accent-red/20">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`px-3 py-1 rounded-lg border-2 font-black text-xs ${getTrendingScoreColor(idea.trendingScore)}`}>
                                            🔥 {idea.trendingScore}/100
                                        </div>
                                        {getCompetitionBadge(idea.competitionLevel)}
                                    </div>
                                </div>

                                <Badge variant="dark" className="mb-2">{idea.category}</Badge>
                                
                                <h3 className="font-heading font-black text-xl leading-tight mb-2">
                                    {idea.title}
                                </h3>
                                
                                <p className="font-bold text-accent-red italic text-sm mb-3">
                                    "{idea.hook}"
                                </p>
                            </div>

                            {/* Description */}
                            <p className="font-medium text-gray-700 text-sm leading-snug mb-4 relative z-10">
                                {idea.description}
                            </p>

                            {/* Details */}
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <Target size={14} />
                                    <span>{idea.targetAudience}</span>
                                    <span>•</span>
                                    <Clock size={14} />
                                    <span>{idea.estimatedDifficulty}</span>
                                </div>

                                {/* Keywords */}
                                <div className="flex flex-wrap gap-1">
                                    {idea.keywords.slice(0, 4).map((kw, idx) => (
                                        <span key={idx} className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded border border-gray-300">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>

                                {/* Why It Will Work */}
                                <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-2">
                                        <BarChart3 size={14} className="shrink-0 mt-0.5 text-accent-red" />
                                        <p className="text-xs font-bold text-gray-700">{idea.whyItWillWork}</p>
                                    </div>
                                </div>

                                {/* Thumbnail Concept */}
                                <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-accent-red" />
                                        <p className="text-xs font-bold text-gray-700"><strong>Thumbnail:</strong> {idea.thumbnailConcept}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
