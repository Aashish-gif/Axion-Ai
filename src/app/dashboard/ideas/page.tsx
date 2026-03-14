"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function IdeasPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const mockIdeas = [
        { title: "React Context API Explained Visually", hook: "Stop passing props down 5 levels. Here is the visual guide to Context.", bg: "mint" as const },
        { title: "Top 10 VS Code Extensions 2024", hook: "I wish I knew about #4 earlier. Boost your productivity today.", bg: "yellow" as const },
        { title: "Building a SaaS in a weekend", hook: "Watch me build a real, profitable app using Next.js from scratch.", bg: "blue" as const },
        { title: "Why your CSS looks bad", hook: "The 3 common design mistakes developers make and how to fix them.", bg: "lavender" as const },
        { title: "Understand TypeScript in 10 Minutes", hook: "Types, Interfaces, Generics - explained simply without the jargon.", bg: "mint" as const },
        { title: "Framer Motion Next.js Tutorial", hook: "Add buttery smooth animations to your app router projects.", bg: "yellow" as const },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            {/* Hero Banner Card */}
            <Card
                className="p-8 md:p-12 mb-10 text-center flex flex-col items-center justify-center border-white shadow-[8px_10px_0px_#111827]"
                style={{ background: 'linear-gradient(135deg, #FF3B3B, #FF6B35)' }}
            >
                <span className="text-6xl mb-4 drop-shadow-md">🧠</span>
                <h1 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">
                    What Should You Make Next?
                </h1>
                <p className="text-white/90 font-medium text-lg md:text-xl mb-8 max-w-2xl">
                    Tell us what you want to talk about, and we'll analyze your past comments to generate the most highly-requested hook.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                    <input
                        type="text"
                        placeholder="e.g. Next.js tutorial, camera review..."
                        className="flex-1 bg-white/10 border-2 border-white/40 text-white placeholder:text-white/60 rounded-2xl px-5 py-3 font-bold outline-none focus:border-white focus:bg-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                    />
                    <Button
                        variant="secondary"
                        className="whitespace-nowrap flex items-center justify-center gap-2"
                        onClick={() => setIsGenerating(true)}
                    >
                        {isGenerating ? "✨ Thinking..." : "✨ Generate Ideas"}
                    </Button>
                </div>
            </Card>

            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-black text-2xl text-dark-border">Generated Ideas</h2>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockIdeas.map((idea, i) => (
                    <Card key={i} bg={idea.bg} hoverLift className="p-6 relative group overflow-hidden">
                        <div className="absolute -top-4 -right-2 text-8xl font-heading font-black text-black opacity-[0.03] select-none transition-transform group-hover:scale-110">
                            0{i + 1}
                        </div>

                        <div className="text-4xl font-heading font-black text-accent-red/20 mb-4 inline-block relative z-10">
                            0{i + 1}
                        </div>

                        <h3 className="font-heading font-black text-xl leading-tight mb-3 relative z-10">
                            {idea.title}
                        </h3>
                        <p className="font-medium text-gray-700 leading-snug relative z-10">
                            "{idea.hook}"
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
