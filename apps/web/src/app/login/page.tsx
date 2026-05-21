"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      if (data.success) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/explore");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-emerald/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tribal-terracotta/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl relative z-10 bg-white/60">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-forest-emerald flex items-center justify-center text-sand-beige font-mono text-3xl font-bold shadow-lg shadow-forest-emerald/30">
            <Compass className="w-8 h-8 text-tribal-terracotta" />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-bold text-forest-emerald tracking-tight">Sovereign Login</h1>
            <p className="text-xs text-charcoal-stone/60 mt-1 font-mono">ACCESS CG TOURISM OS</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-charcoal-stone/70 uppercase pl-1">Authorized Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/50 border border-charcoal-stone/20 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
                placeholder="citizen@gov.in"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-charcoal-stone/70 uppercase pl-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 border border-charcoal-stone/20 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-forest-emerald hover:bg-emerald-800 text-sand-beige font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "Authenticating..." : (
              <>
                <LogIn className="w-5 h-5" />
                Initialize Session
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-charcoal-stone/10 text-center flex flex-col gap-2">
          <span className="text-xs text-charcoal-stone/60">
            Unregistered civilian?
          </span>
          <Link href="/register" className="inline-flex items-center justify-center gap-1 text-sm font-bold text-tribal-terracotta hover:text-red-700 transition-colors">
            Request Registry Clearance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
