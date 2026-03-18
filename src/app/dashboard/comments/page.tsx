"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, MessageSquare, ExternalLink, Youtube } from "lucide-react";

interface Comment {
    id: string;
    text: string;
    author: string;
    authorAvatar: string;
    publishedAt: string;
    videoId: string;
    videoTitle: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch("/api/youtube/comments");
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to fetch comments");
                }
                const data = await res.json();
                setComments(data.comments);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchComments();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 size={48} className="animate-spin text-accent-red mb-4" />
                <p className="font-heading font-bold text-dark-border">Fetching your audience's thoughts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border-[3px] border-red-200 rounded-3xl">
                <Youtube size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="font-heading font-black text-2xl text-red-600 mb-2">Oops! Couldn't load comments</h2>
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <a href="/dashboard">
                    <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-[4px_4px_0_#111827]">Back to Dashboard</button>
                </a>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <header className="mb-10">
                <h1 className="font-heading font-black text-3xl md:text-[32px] text-dark-border mb-2">
                    Audience Feedback 💬
                </h1>
                <p className="text-gray-500 font-bold">Real-time comments from your latest videos.</p>
            </header>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-4">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="font-heading font-black text-xl text-dark-border">No comments found yet</h3>
                        <p className="text-gray-500 font-bold">Try syncing your channel or uploading a new video!</p>
                    </Card>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.id} bg="white" className="p-6 transition-all hover:border-accent-red group">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full border-2 border-dark-border overflow-hidden shadow-[2px_2px_0_#111827]">
                                        <img src={comment.authorAvatar} alt={comment.author} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-black text-dark-border mr-2 tracking-tight">{comment.author}</span>
                                            <span className="text-xs font-bold text-gray-400">{new Date(comment.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                        <Badge variant="dark" className="text-[10px] hidden sm:block truncate max-w-[200px]">
                                            {comment.videoTitle}
                                        </Badge>
                                    </div>
                                    <div 
                                        className="text-gray-700 font-medium leading-relaxed mb-4 prose prose-sm max-w-none prose-p:my-0"
                                        dangerouslySetInnerHTML={{ __html: comment.text }}
                                    />
                                    <div className="flex items-center gap-4">
                                        <a 
                                            href={`https://www.youtube.com/watch?v=${comment.videoId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-black text-accent-red hover:underline"
                                        >
                                            View Video <ExternalLink size={12} />
                                        </a>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                            READ ONLY
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
