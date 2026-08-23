"use client";

import { useState, Suspense } from "react";
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(token, password);
      setSuccess(result.message);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-6 p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg text-soc-danger text-sm">
          Missing reset token in URL.
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-soc-accent hover:text-soc-accent/80 transition-colors"
        >
          Return to login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
          {success}
          <br/>
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-soc-text-secondary mb-1">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-soc-text-secondary mb-1">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg flex items-center text-soc-danger text-sm">
          <span className="mr-2">⚠</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-soc-accent hover:bg-soc-accent/90 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Reset Password
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-soc-accent/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="glass max-w-md w-full p-8 rounded-2xl border border-soc-border relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-br from-soc-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-soc-accent/20 mb-4">
            <Shield className="w-8 h-8 text-soc-text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-soc-text-primary">Create New Password</h1>
          <p className="text-sm text-soc-text-secondary mt-2 text-center">Secure your Chrona account</p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-soc-accent" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
