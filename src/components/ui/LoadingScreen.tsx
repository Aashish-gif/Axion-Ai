"use client";

import React from 'react';
import { Loader2, Play, ThumbsUp, MessageCircle, Eye, TrendingUp } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
    variant?: 'default' | 'youtube' | 'content';
}

export function LoadingScreen({ message = "Loading...", fullScreen = true, variant = 'default' }: LoadingScreenProps) {
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} flex flex-col items-center justify-center bg-bg-cream`}>
            {/* YouTube/Content Creator Themed Animation */}
            {variant === 'youtube' || variant === 'content' ? (
                <div className="relative mb-8">
                    {/* Animated Engagement Icons Orbiting */}
                    <div className="w-32 h-32 relative">
                        {/* Rotating Ring with Icons */}
                        <div className="absolute inset-0 border-4 border-dashed border-accent-red rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                        
                        {/* Play Button (Center) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-accent-red to-orange-500 rounded-2xl flex items-center justify-center shadow-[4px_4px_0_#111827] border-[3px] border-dark-border z-10">
                            <Play size={32} className="text-white fill-white ml-1" />
                        </div>

                        {/* Orbiting Icons */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[3px_3px_0_#111827] border-[2px] border-dark-border" style={{ animation: 'orbit-pause 3s linear infinite' }}>
                            <Eye size={20} className="text-accent-red" />
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[3px_3px_0_#111827] border-[2px] border-dark-border">
                            <ThumbsUp size={20} className="text-blue-500" />
                        </div>
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[3px_3px_0_#111827] border-[2px] border-dark-border">
                            <MessageCircle size={20} className="text-green-500" />
                        </div>
                        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[3px_3px_0_#111827] border-[2px] border-dark-border">
                            <TrendingUp size={20} className="text-purple-500" />
                        </div>
                    </div>

                    {/* Pulsing Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent-red/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
            ) : (
                /* Default Loader - Triple Ring Animation */
                <div className="relative mb-8">
                    {/* Outer Ring - Spinning */}
                    <div className="w-24 h-24 border-4 border-dashed border-accent-red rounded-full animate-spin"></div>
                    
                    {/* Middle Ring - Counter-rotating */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-solid border-dark-border rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    
                    {/* Inner Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                </div>
            )}

            {/* Loading Text */}
            <h2 className={`font-heading font-black text-2xl md:text-3xl text-dark-border mb-3 ${variant === 'youtube' || variant === 'content' ? 'animate-bounce' : 'animate-pulse'}`}>
                {message}
            </h2>

            {/* Progress Bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden border-2 border-dark-border">
                <div className="h-full bg-gradient-to-r from-accent-red via-orange-500 to-accent-red rounded-full animate-progress"></div>
            </div>

            {/* Decorative Dots or Stats */}
            {variant === 'youtube' || variant === 'content' ? (
                <div className="flex gap-4 mt-6">
                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-accent-red animate-pulse">0</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Views</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-blue-500 animate-pulse" style={{ animationDelay: '100ms' }}>0</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Likes</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-green-500 animate-pulse" style={{ animationDelay: '200ms' }}>0</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Comments</div>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2 mt-6">
                    <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            )}

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

// Mini loader for buttons and small components
export function MiniLoader({ size = 16, className = "", variant = 'default' }: { size?: number; className?: string; variant?: 'default' | 'youtube' }) {
    if (variant === 'youtube') {
        return (
            <div className="relative inline-flex items-center justify-center">
                <Play size={size} className="text-accent-red animate-pulse" />
                <Loader2 size={size * 0.6} className="absolute animate-spin text-white" />
            </div>
        );
    }
    return (
        <Loader2 
            size={size} 
            className={`animate-spin text-current ${className}`} 
        />
    );
}
