"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingScreen({ message = "Loading...", fullScreen = true }: LoadingScreenProps) {
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} flex flex-col items-center justify-center bg-bg-cream`}>
            {/* Animated Logo Container */}
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

            {/* Loading Text */}
            <h2 className="font-heading font-black text-2xl md:text-3xl text-dark-border mb-3 animate-pulse">
                {message}
            </h2>

            {/* Progress Bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden border-2 border-dark-border">
                <div className="h-full bg-gradient-to-r from-accent-red via-orange-500 to-accent-red rounded-full animate-progress"></div>
            </div>

            {/* Decorative Dots */}
            <div className="flex gap-2 mt-6">
                <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-accent-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

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
export function MiniLoader({ size = 16, className = "" }: { size?: number; className?: string }) {
    return (
        <Loader2 
            size={size} 
            className={`animate-spin text-current ${className}`} 
        />
    );
}
