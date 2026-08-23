"use client";

import { useState } from "react";
import { Shield, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/services/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid email or password");
      }

      const data = await res.json();
      if (data.access_token) {
        // Set client-side cookie so Next.js middleware and API wrappers can read it
        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; samesite=strict`;
        router.push("/");
        router.refresh(); // Force refresh to apply auth state across server components
      } else {
        throw new Error("No access token received");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-soc-text-primary">Welcome to Chrona</h1>
          <p className="text-sm text-soc-text-secondary mt-2">Sign in to the Security Operations Center</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg flex items-center text-soc-danger text-sm">
            <span className="mr-2">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-soc-text-secondary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-soc-text-secondary">Password</label>
              <a href="/forgot-password" className="text-xs text-soc-accent hover:text-soc-accent/80 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-10 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-soc-text-muted hover:text-soc-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-soc-accent hover:bg-soc-accent/90 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-soc-border text-center">
          <p className="text-sm text-soc-text-secondary">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-soc-accent hover:text-soc-accent/80 transition-colors font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
