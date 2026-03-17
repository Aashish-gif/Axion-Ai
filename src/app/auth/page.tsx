"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, Lock, Play, ArrowRight, User } from "lucide-react";
import Link from 'next/link';

export default function AuthPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication by setting a cookie
        document.cookie = "axion_auth=true; path=/";
        // Redirect to dashboard
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-bg-cream px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-red/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-card-blue/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Floating Emojis matching Landing page theme */}
            <div className="absolute top-[15%] left-[10%] text-4xl animate-float opacity-50" style={{ animationDelay: '0s' }}>🚀</div>
            <div className="absolute bottom-[20%] right-[15%] text-5xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🎬</div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
                <div className="bg-accent-red text-white w-10 h-10 rounded-xl flex items-center justify-center border-[2.5px] border-dark-border shadow-[2px_2px_0_#111827]">
                    <Play size={20} fill="currentColor" />
                </div>
                <span className="font-heading font-black text-2xl tracking-tight text-dark-border">
                    Axionix
                </span>
            </Link>

            <div className="w-full max-w-md z-10 relative">
                {/* Blur backdrop container */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[32px] border-[3px] border-dark-border shadow-[8px_10px_0px_#111827]"></div>
                
                <div className="relative p-8 md:p-10 flex flex-col h-full bg-white/60 backdrop-blur-md rounded-[29px]">
                    <div className="mb-8 text-center">
                        <h1 className="font-heading font-black text-4xl text-dark-border mb-2">
                            {isSignIn ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-600 font-medium h-6">
                            {isSignIn ? 'Sign in to access your dashboard' : 'Join thousands of amazing creators'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 mb-8">
                        {!isSignIn && (
                            <div>
                                <label className="block text-sm font-bold text-dark-border mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-bold text-dark-border mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-dark-border">Password</label>
                                {isSignIn && (
                                    <a href="#" className="text-xs font-bold text-accent-red hover:underline">Forgot?</a>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full text-lg mt-2 flex items-center justify-center gap-2"
                        >
                            {isSignIn ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
                        </Button>
                    </form>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 font-bold text-gray-500 bg-[#FaFaF9]">Or continue with</span>
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={handleSubmit} 
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 font-heading font-bold rounded-2xl border-[3px] border-dark-border bg-white text-dark-border transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none shadow-[4px_5px_0_#111827] drop-shadow-[0_0_15px_rgba(255,59,59,0.2)] hover:drop-shadow-[0_0_20px_rgba(255,59,59,0.4)]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-bold text-gray-600">
                            {isSignIn ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsSignIn(!isSignIn)} 
                                className="ml-2 text-accent-red hover:underline"
                            >
                                {isSignIn ? 'Sign up for free' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
