"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlayCircle, Map, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: "Discover", href: "/" },
    { icon: <Compass className="w-5 h-5" />, label: "Explore", href: "/explore" },
    { icon: <PlayCircle className="w-6 h-6" />, label: "Creators", href: "/creators", primary: true },
    { icon: <Map className="w-5 h-5" />, label: "Map", href: "/map" },
    { icon: <User className="w-5 h-5" />, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-2 pointer-events-none">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl flex justify-between items-center px-6 py-3 pointer-events-auto shadow-[#0A2A3B]/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all ${
                item.primary ? "-mt-6" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all ${
                  item.primary
                    ? "w-14 h-14 rounded-full bg-forest-emerald text-white shadow-lg shadow-forest-emerald/30 border-4 border-sand-beige"
                    : isActive
                    ? "text-forest-emerald"
                    : "text-charcoal-stone/60 dark:text-sand-beige/60"
                }`}
              >
                {item.icon}
              </div>
              {!item.primary && (
                <span
                  className={`text-[10px] mt-1 font-medium transition-all ${
                    isActive ? "text-forest-emerald font-bold" : "text-charcoal-stone/60 dark:text-sand-beige/60"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
