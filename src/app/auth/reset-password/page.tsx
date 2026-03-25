"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageTransition, setPageTransition] = useState(true);
  const [token, setToken] = useState("");

  // Page load animation
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid or missing reset token");
    } else {
      setToken(tokenParam);
    }
    
    const timer = setTimeout(() => {
      setPageTransition(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Show loading screen during page transition
  if (pageTransition) {
    return <LoadingScreen message="Loading..." />;
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-bg-cream px-4">
        <div className="w-full max-w-md z-10 relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[32px] border-[3px] border-dark-border shadow-[8px_10px_0px_#111827]"></div>
          
          <div className="relative p-10 bg-white/60 backdrop-blur-md rounded-[29px] text-center">
            <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
            <h1 className="font-heading font-black text-3xl text-dark-border mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 font-medium mb-6">
              Your password has been updated. Redirecting to sign in...
            </p>
            <div className="w-12 h-12 border-4 border-dashed border-accent-red rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg-cream px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-red/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-card-blue/30 rounded-full blur-[100px] pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-accent-red text-white w-10 h-10 rounded-xl flex items-center justify-center border-[2.5px] border-dark-border shadow-[2px_2px_0_#111827]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="font-heading font-black text-2xl tracking-tight text-dark-border">
          Axionix
        </span>
      </Link>

      <div className="w-full max-w-md z-10 relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[32px] border-[3px] border-dark-border shadow-[8px_10px_0px_#111827]"></div>

        <div className="relative p-8 md:p-10 bg-white/60 backdrop-blur-md rounded-[29px]">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-black text-4xl text-dark-border mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 font-medium">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-[2px] border-red-300 rounded-xl text-red-600 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-dark-border mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-border mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Resetting...
                </>
              ) : (
                <>Reset Password</>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth" className="text-sm font-bold text-gray-600 hover:text-accent-red transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
