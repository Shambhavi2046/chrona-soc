"use client";

import { useState } from "react";
import { Shield, Mail, Lock, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerAccount } from "@/services/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      await registerAccount({
        name,
        org_name: orgName,
        email,
        password
      });
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-gradient-to-br from-soc-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-soc-accent/20 mb-4">
            <Shield className="w-7 h-7 text-soc-text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-soc-text-primary">Create an Account</h1>
          <p className="text-sm text-soc-text-secondary mt-2 text-center">Provision your secure workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg flex items-center text-soc-danger text-sm">
            <span className="mr-2">⚠</span>
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 px-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-4 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-10 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soc-text-muted hover:text-soc-text-primary transition-colors text-xs font-medium"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-text-muted" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-soc-bg/50 border border-soc-border rounded-lg py-2.5 pl-10 pr-10 text-soc-text-primary focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soc-text-muted hover:text-soc-text-primary transition-colors text-xs font-medium"
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-soc-accent hover:bg-soc-accent/90 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-soc-border text-center">
          <p className="text-sm text-soc-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-soc-accent hover:text-soc-accent/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
