"use client";

import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Compass, Map, UserCircle, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/auth-store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Note: metadata is defined in a separate server-only file (metadata.ts)
// Client component layout cannot export metadata directly.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${space.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-sand-beige text-charcoal-stone selection:bg-tribal-terracotta selection:text-white">
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#1A1D24',
              color: '#F4F1EB',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '12px'
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#F4F1EB' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F4F1EB' },
            }
          }} 
        />
        
        {/* Global Cinematic Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-xl bg-forest-emerald flex items-center justify-center text-sand-beige font-mono text-xl font-bold shadow-md shadow-forest-emerald/20 transition-all duration-300 group-hover:bg-tribal-terracotta">
                CG
              </span>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-bold tracking-tight text-forest-emerald group-hover:text-tribal-terracotta transition-colors">
                  CG TOURISM OS
                </span>
                <span className="text-[10px] font-mono tracking-widest text-tribal-terracotta uppercase">
                  Explore the Real
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/explore" className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors">
                Map Discovery
              </Link>
              <Link href="/planner" className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors">
                AI Planner
              </Link>
              <Link href="/creator" className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors">
                Creator Studio
              </Link>
              <Link href="/bookmarks" className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors">
                Saved Journeys
              </Link>
              <Link href="/stories" className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors">
                Folklore Stories
              </Link>
              <Link href="/sos" className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Emergency SOS
              </Link>
            </nav>

            {/* Right Action Menu */}
            <div className="flex items-center gap-3">
              {mounted && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-forest-emerald/20 bg-forest-emerald/5">
                    <UserCircle className="w-4 h-4 text-forest-emerald" />
                    <span className="text-xs font-semibold text-forest-emerald">{user.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono font-bold uppercase text-tribal-terracotta ml-1">{user.role}</span>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <Link href="/admin" className="hidden sm:inline-flex text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg border border-forest-emerald/30 text-forest-emerald hover:bg-forest-emerald hover:text-sand-beige transition-all">
                      Govt Portal
                    </Link>
                  )}
                  <button onClick={() => logout()} className="text-charcoal-stone/50 hover:text-red-500 transition-colors p-2" title="Log out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : mounted ? (
                <>
                  <Link href="/login" className="hidden sm:inline-flex text-xs font-sans font-bold px-3 py-2 text-charcoal-stone/70 hover:text-forest-emerald transition-all">
                    Log In
                  </Link>
                  <Link href="/register" className="hidden sm:inline-flex items-center justify-center text-xs font-bold bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige px-4 py-2 rounded-xl shadow-md transition-all duration-300">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="w-24 h-8 animate-pulse bg-charcoal-stone/10 rounded-lg"></div>
              )}
              
              <Link href="/planner" className="hidden lg:inline-flex items-center justify-center text-sm font-bold bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige px-4 py-2.5 rounded-xl shadow-md shadow-forest-emerald/10 transition-all duration-300 hover:scale-[1.02]">
                Plan Trip
              </Link>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl border border-charcoal-stone/10 flex items-center justify-center bg-white/60 hover:bg-white transition-all"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="w-5 h-5 text-forest-emerald" /> : <Menu className="w-5 h-5 text-forest-emerald" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-charcoal-stone/10 bg-white/95 backdrop-blur-lg">
              <nav className="flex flex-col px-4 py-4 gap-1">
                {[
                  { href: "/explore", label: "Map Discovery" },
                  { href: "/planner", label: "AI Planner" },
                  { href: "/creator", label: "Creator Studio" },
                  { href: "/bookmarks", label: "Saved Journeys" },
                  { href: "/stories", label: "Folklore Stories" },
                  { href: "/admin", label: "Govt Portal" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-charcoal-stone hover:bg-forest-emerald/5 hover:text-forest-emerald transition-all"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/sos"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Emergency SOS
                </Link>
                <Link
                  href="/planner"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 py-3 rounded-xl text-sm font-bold bg-forest-emerald text-sand-beige text-center"
                >
                  Plan Trip →
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="w-full bg-charcoal-stone text-sand-beige/90 py-16 border-t-4 border-tribal-terracotta">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand Col */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-tribal-terracotta flex items-center justify-center text-sand-beige font-mono text-xl font-bold">
                    CG
                  </span>
                  <span className="font-sans text-lg font-bold tracking-tight text-white">
                    CG Tourism OS
                  </span>
                </div>
                <p className="text-xs text-sand-beige/60 leading-relaxed max-w-xs">
                  Digitizing Chhattisgarh&apos;s rich tribal narratives, natural bio-reserves, and heritage corridors. Built with authenticity for responsible digital discovery.
                </p>
              </div>

              {/* Exploration Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-tribal-terracotta uppercase mb-4">
                  Exploration Hub
                </h4>
                <ul className="space-y-2.5 text-xs text-sand-beige/70">
                  <li><Link href="/explore" className="hover:text-white transition-colors">Interactive Travel Map</Link></li>
                  <li><Link href="/explore?cat=waterfalls" className="hover:text-white transition-colors">Scenic Waterfalls</Link></li>
                  <li><Link href="/explore?cat=forests" className="hover:text-white transition-colors">Eco-Forest Reserves</Link></li>
                  <li><Link href="/explore?cat=temples" className="hover:text-white transition-colors">Spiritual Temples</Link></li>
                </ul>
              </div>

              {/* Digital Services Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-tribal-terracotta uppercase mb-4">
                  Sovereign Services
                </h4>
                <ul className="space-y-2.5 text-xs text-sand-beige/70">
                  <li><Link href="/planner" className="hover:text-white transition-colors">Heuristic AI Itinerary Builder</Link></li>
                  <li><Link href="/stories" className="hover:text-white transition-colors">Tribal Folklore Ingestion</Link></li>
                  <li><Link href="/sos" className="hover:text-white transition-colors">Offline Disaster Protocols</Link></li>
                  <li><Link href="/admin" className="hover:text-white transition-colors">Smart Governance Analytics</Link></li>
                </ul>
              </div>

              {/* Emergency / Eco Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-red-500 uppercase mb-4">
                  State Emergency Support
                </h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-sand-beige/50">24/7 HELPLINE ASSISTANCE</span>
                  <a href="tel:112" className="text-lg font-mono font-bold text-white hover:text-tribal-terracotta">
                    Call Emergency: 112
                  </a>
                  <Link href="/sos" className="text-xs text-tribal-terracotta hover:underline font-semibold">
                    Open Offline Emergency Deck →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-beige/40 font-mono">
              <span>© 2026 Chhattisgarh Smart Tourism Board. All Rights Reserved.</span>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <span className="text-green-500">✔ Low-Carbon Offline-Ready Engine</span>
                <span>Version 1.0.0 (MVP)</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
