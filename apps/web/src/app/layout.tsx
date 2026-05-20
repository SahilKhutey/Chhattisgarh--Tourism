import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/ToastProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CG Tourism OS — Explore the Real Chhattisgarh",
  description:
    "Digitizing Chhattisgarh's rich tribal narratives, natural bio-reserves, and heritage corridors. Built with authenticity for responsible digital discovery.",
  keywords: [
    "Chhattisgarh tourism",
    "Bastar travel",
    "tribal heritage",
    "Chitrakote",
    "Chhattisgarh forest",
    "CG Tourism",
  ],
  openGraph: {
    title: "CG Tourism OS",
    description: "Explore the Real Chhattisgarh — Tribal, Natural, Authentic.",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${space.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-beige text-charcoal-stone selection:bg-tribal-terracotta selection:text-white">
        <ToastProvider />

        {/* Global Cinematic Navigation */}
        <Navbar />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 flex flex-col">{children}</main>

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
                  Digitizing Chhattisgarh&apos;s rich tribal narratives, natural
                  bio-reserves, and heritage corridors. Built with authenticity
                  for responsible digital discovery.
                </p>
              </div>

              {/* Exploration Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-tribal-terracotta uppercase mb-4">
                  Exploration Hub
                </h4>
                <ul className="space-y-2.5 text-xs text-sand-beige/70">
                  <li>
                    <a href="/explore" className="hover:text-white transition-colors">
                      Interactive Travel Map
                    </a>
                  </li>
                  <li>
                    <a href="/explore?cat=waterfalls" className="hover:text-white transition-colors">
                      Scenic Waterfalls
                    </a>
                  </li>
                  <li>
                    <a href="/explore?cat=forests" className="hover:text-white transition-colors">
                      Eco-Forest Reserves
                    </a>
                  </li>
                  <li>
                    <a href="/explore?cat=temples" className="hover:text-white transition-colors">
                      Spiritual Temples
                    </a>
                  </li>
                </ul>
              </div>

              {/* Digital Services Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-tribal-terracotta uppercase mb-4">
                  Sovereign Services
                </h4>
                <ul className="space-y-2.5 text-xs text-sand-beige/70">
                  <li>
                    <a href="/planner" className="hover:text-white transition-colors">
                      Heuristic AI Itinerary Builder
                    </a>
                  </li>
                  <li>
                    <a href="/stories" className="hover:text-white transition-colors">
                      Tribal Folklore Ingestion
                    </a>
                  </li>
                  <li>
                    <a href="/sos" className="hover:text-white transition-colors">
                      Offline Disaster Protocols
                    </a>
                  </li>
                  <li>
                    <a href="/admin" className="hover:text-white transition-colors">
                      Smart Governance Analytics
                    </a>
                  </li>
                </ul>
              </div>

              {/* Emergency Col */}
              <div>
                <h4 className="text-sm font-bold tracking-widest text-red-500 uppercase mb-4">
                  State Emergency Support
                </h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-sand-beige/50">
                    24/7 HELPLINE ASSISTANCE
                  </span>
                  <a
                    href="tel:112"
                    className="text-lg font-mono font-bold text-white hover:text-tribal-terracotta"
                  >
                    Call Emergency: 112
                  </a>
                  <a
                    href="/sos"
                    className="text-xs text-tribal-terracotta hover:underline font-semibold"
                  >
                    Open Offline Emergency Deck →
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-beige/40 font-mono">
              <span>
                © 2026 Chhattisgarh Smart Tourism Board. All Rights Reserved.
              </span>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <span className="text-green-500">
                  ✔ Low-Carbon Offline-Ready Engine
                </span>
                <span>Version 1.0.0 (MVP)</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
