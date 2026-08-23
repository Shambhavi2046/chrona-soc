"use client";

import { useState } from "react";
import { Shield, Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);
      setSuccess(result.message);
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
          <h1 className="text-2xl font-bold text-soc-text-primary">Reset Password</h1>
          <p className="text-sm text-soc-text-secondary mt-2 text-center">Enter your email to receive a password reset link.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg flex items-center text-soc-danger text-sm">
            <span className="mr-2">⚠</span>
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {success}
            </div>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-soc-accent hover:text-soc-accent/80 transition-colors flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                  placeholder="name@company.com"
                />
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
                  Send Reset Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm text-soc-text-muted hover:text-soc-text-primary transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
