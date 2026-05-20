"use client";

import Link from "next/link";
import { LogOut, Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/auth-store";

const NAV_LINKS = [
  { href: "/explore", label: "Map Discovery" },
  { href: "/planner", label: "AI Planner" },
  { href: "/creator", label: "Creator Studio" },
  { href: "/bookmarks", label: "Saved Journeys" },
  { href: "/stories", label: "Folklore Stories" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sos"
            className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Emergency SOS
          </Link>
        </nav>

        {/* Right Action Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-forest-emerald/20 bg-forest-emerald/5">
                <UserCircle className="w-4 h-4 text-forest-emerald" />
                <span className="text-xs font-semibold text-forest-emerald">
                  {user.fullName.split(" ")[0]}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase text-tribal-terracotta ml-1">
                  {user.role}
                </span>
              </div>
              {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg border border-forest-emerald/30 text-forest-emerald hover:bg-forest-emerald hover:text-sand-beige transition-all"
                >
                  Govt Portal
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="text-charcoal-stone/50 hover:text-red-500 transition-colors p-2"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-xs font-sans font-bold px-3 py-2 text-charcoal-stone/70 hover:text-forest-emerald transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center justify-center text-xs font-bold bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige px-4 py-2 rounded-xl shadow-md transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}

          <Link
            href="/planner"
            className="hidden lg:inline-flex items-center justify-center text-sm font-bold bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige px-4 py-2.5 rounded-xl shadow-md shadow-forest-emerald/10 transition-all duration-300 hover:scale-[1.02]"
          >
            Plan Trip
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 rounded-xl border border-charcoal-stone/10 flex items-center justify-center bg-white/60 hover:bg-white transition-all"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-forest-emerald" />
            ) : (
              <Menu className="w-5 h-5 text-forest-emerald" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-charcoal-stone/10 bg-white/95 backdrop-blur-lg">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {[...NAV_LINKS, { href: "/admin", label: "Govt Portal" }].map(
              ({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-charcoal-stone hover:bg-forest-emerald/5 hover:text-forest-emerald transition-all"
                >
                  {label}
                </Link>
              )
            )}
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
  );
}
