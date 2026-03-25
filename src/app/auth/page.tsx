"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, Play, ArrowRight, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [pageTransition, setPageTransition] = useState(true);
  const router = useRouter();

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageTransition(false);
    }, 800); // 0.8 second initial load
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Minimum loading time for better UX (0.8 seconds)
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isSignIn) {
        // Login
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login failed");
          await minLoadingTime;
          setLoading(false);
          return;
        }

        await minLoadingTime;
        router.push("/dashboard");
        router.refresh();
      } else {
        // Register
        if (!name || !email || !password) {
          setError("Please fill all fields!");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
          await minLoadingTime;
          setLoading(false);
          return;
        }

        await minLoadingTime;
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
      await minLoadingTime;
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setResetEmailSent(true);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Show loading screen during page transition
  if (pageTransition) {
    return <LoadingScreen message="Welcome to Axionix" />;
  }

  // Show loading screen during form submission
  if (loading) {
    return <LoadingScreen message={isSignIn ? "Signing you in..." : "Creating your account..."} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg-cream px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-red/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-card-blue/30 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Emojis matching Landing page theme */}
      <div
        className="absolute top-[15%] left-[10%] text-4xl animate-float opacity-50"
        style={{ animationDelay: "0s" }}
      >
        🚀
      </div>
      <div
        className="absolute bottom-[20%] right-[15%] text-5xl animate-float opacity-50"
        style={{ animationDelay: "1s" }}
      >
        🎬
      </div>

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
              {isSignIn ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600 font-medium h-6">
              {isSignIn
                ? "Sign in to access your dashboard"
                : "Join thousands of amazing creators"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-[2px] border-red-300 rounded-xl text-red-600 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            {!isSignIn && (
              <div>
                <label className="block text-sm font-bold text-dark-border mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    suppressHydrationWarning
                    className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-dark-border mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-dark-border">
                  Password
                </label>
                {isSignIn && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-bold text-accent-red hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-lg mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Please wait...
                </>
              ) : (
                <>
                  {isSignIn ? "Sign In" : "Sign Up"}{" "}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <div className="mb-8">
              <div className="p-6 bg-white border-[3px] border-dark-border rounded-2xl shadow-[4px_5px_0_#111827]">
                <h3 className="font-heading font-black text-xl text-dark-border mb-2">
                  Reset Your Password
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                {resetEmailSent ? (
                  <div className="p-4 bg-green-50 border-[2px] border-green-300 rounded-xl">
                    <p className="text-sm font-bold text-green-700 text-center">
                      ✅ Email sent! Check your inbox for reset instructions.
                    </p>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmailSent(false);
                      }}
                      className="mt-3 w-full py-2 bg-green-600 text-white font-bold rounded-lg border-2 border-dark-border hover:bg-green-700 transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-dark-border mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowForgotPassword(false)}
                        className="flex-1"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <><Loader2 size={16} className="animate-spin" /> Sending...</>
                        ) : (
                          <><span>Send Reset Link</span></>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 font-bold text-gray-500 bg-[#FaFaF9]">
                Simple sign in with email
              </span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-bold text-gray-600">
              {isSignIn
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setError("");
                }}
                className="ml-2 text-accent-red hover:underline"
                disabled={loading}
              >
                {isSignIn ? "Sign up for free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
