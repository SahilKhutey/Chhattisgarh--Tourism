"use client";

import Link from "next/link";
import { LogOut, Menu, X, UserCircle, Globe } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { useLanguage } from "../context/LanguageContext";

const NAV_LINKS = [
  { href: "/explore", key: "nav.map" },
  { href: "/creators", key: "nav.creators" },
  { href: "/planner", key: "nav.planner" },
  { href: "/creator", key: "nav.creator" },
  { href: "/bookmarks", key: "nav.saved" },
  { href: "/stories", key: "nav.stories" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { lang, changeLanguage, t, accessibilityMode, toggleAccessibilityMode } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Top Utility Bar (Desktop Only) */}
      <div className="hidden lg:flex w-full bg-[#0A2A3B] text-white/90 px-4 sm:px-6 lg:px-8 py-1.5 justify-end items-center gap-6 border-b border-[#0A2A3B]/10">
        
        {/* Language Switcher */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-white/60" />
          <button
            onClick={() => changeLanguage("en")}
            className={`px-2 py-0.5 rounded text-xs font-semibold font-mono transition-colors ${
              lang === "en" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            EN
          </button>
          <span className="text-white/20 text-xs">|</span>
          <button
            onClick={() => changeLanguage("hi")}
            className={`px-2 py-0.5 rounded text-xs font-semibold font-mukta transition-colors ${
              lang === "hi" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            हिन्दी
          </button>
          <span className="text-white/20 text-xs">|</span>
          <button
            onClick={() => changeLanguage("cg")}
            className={`px-2 py-0.5 rounded text-xs font-semibold font-mukta transition-colors ${
              lang === "cg" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            छत्तीसगढ़ी
          </button>
        </div>

        {/* Accessibility Toggle */}
        <button
          onClick={toggleAccessibilityMode}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold transition-colors border ${
            accessibilityMode
              ? "bg-tribal-terracotta border-tribal-terracotta text-white"
              : "bg-transparent border-white/20 text-white/90 hover:bg-white/10"
          }`}
          title={accessibilityMode ? "Disable Accessibility Mode" : "Enable Accessibility Mode"}
        >
          <span>👁️</span>
          <span>
            {accessibilityMode
              ? (lang === "en" ? "Standard UI" : "सामान्य मोड")
              : (lang === "en" ? "Easy Read" : "सुगम मोड")}
          </span>
        </button>

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <div className="flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 text-white/80" />
              <span className="text-xs font-semibold text-white/90">
                {user.fullName.split(" ")[0]}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase text-tribal-terracotta ml-1 border border-tribal-terracotta/40 px-1 rounded">
                {user.role}
              </span>
            </div>
            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <Link
                href="/admin"
                className="text-[10px] font-mono font-bold uppercase text-white/80 hover:text-white transition-colors"
              >
                {t("nav.govt_portal")}
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="text-white/50 hover:text-red-400 transition-colors"
              title={t("nav.logout")}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <Link
              href="/login"
              className="text-xs font-sans font-bold text-white/80 hover:text-white transition-all"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold bg-white text-[#0A2A3B] px-3 py-1 rounded transition-all hover:bg-gray-200"
            >
              {t("nav.signup")}
            </Link>
          </div>
        )}
      </div>

      {/* Main Navbar */}
      <div className="w-full glass-panel border-b border-white/40 shadow-sm bg-sand-beige/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col justify-center">
              <div className="flex flex-col leading-[0.9]">
                <span className="font-mukta text-[17px] font-bold text-[#0A2A3B] group-hover:text-tribal-terracotta transition-colors tracking-wide">
                  हमार
                </span>
                <span className="font-serif text-[22px] font-bold text-[#0A2A3B] group-hover:text-tribal-terracotta transition-colors">
                  Chhattisgarh
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-tribal-terracotta uppercase mt-1">
                {t("home.heading_real")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-charcoal-stone/85 hover:text-forest-emerald transition-colors"
              >
                {t(key)}
              </Link>
            ))}
            <Link
              href="/sos"
              className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-red-600" />
              {t("nav.sos")}
            </Link>
          </nav>

          {/* Right Action Menu (Mobile/Desktop CTA) */}
          <div className="flex items-center gap-4">
            <Link
              href="/planner"
              className="hidden lg:inline-flex items-center justify-center text-sm font-bold bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02]"
            >
              {t("nav.plan_trip")}
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
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-charcoal-stone/10 bg-white/95 backdrop-blur-lg">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-stone/5 mb-2">
              <span className="text-xs font-semibold text-charcoal-stone/50 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Language / भाषा
              </span>
              <div className="flex items-center gap-1 bg-forest-emerald/10 p-0.5 rounded-lg">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-1 rounded text-xs font-semibold font-mono ${
                    lang === "en" ? "bg-forest-emerald text-sand-beige" : "text-forest-emerald"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("hi")}
                  className={`px-2 py-1 rounded text-xs font-semibold font-mukta ${
                    lang === "hi" ? "bg-forest-emerald text-sand-beige" : "text-forest-emerald"
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage("cg")}
                  className={`px-2 py-1 rounded text-xs font-semibold font-mukta ${
                    lang === "cg" ? "bg-forest-emerald text-sand-beige" : "text-forest-emerald"
                  }`}
                >
                  छत्तीसगढ़ी
                </button>
              </div>
            </div>

            {/* Mobile Accessibility Switcher */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-stone/5 mb-2">
              <span className="text-xs font-semibold text-charcoal-stone/50 flex items-center gap-1.5">
                👁️ Easy Read / सुगम मोड
              </span>
              <button
                onClick={toggleAccessibilityMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  accessibilityMode
                    ? "bg-tribal-terracotta border-tribal-terracotta text-white"
                    : "bg-forest-emerald/10 border-forest-emerald/15 text-forest-emerald"
                }`}
              >
                {accessibilityMode
                  ? (lang === "en" ? "Disable" : "बंद करें")
                  : (lang === "en" ? "Enable" : "चालू करें")}
              </button>
            </div>

            {[...NAV_LINKS, { href: "/admin", key: "nav.govt_portal" }].map(
              ({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-charcoal-stone hover:bg-forest-emerald/5 hover:text-forest-emerald transition-all"
                >
                  {t(key)}
                </Link>
              )
            )}
            <Link
              href="/sos"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {t("nav.sos")}
            </Link>
            <Link
              href="/planner"
              onClick={() => setMobileOpen(false)}
              className="mt-2 py-3 rounded-xl text-sm font-bold bg-forest-emerald text-sand-beige text-center"
            >
              {t("nav.plan_trip")} →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
