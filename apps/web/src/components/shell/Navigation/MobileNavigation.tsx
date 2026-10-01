"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { consumerNavigation } from "@/core/ui/shell/navigation";
import { cn } from "@/lib/ui/cn";

export interface MobileNavigationProps {
  id?: string;
  onNavigate?: () => void;
  className?: string;
}

export function MobileNavigation({
  id = "mobile-navigation",
  onNavigate,
  className,
}: MobileNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Escape key closes the menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onNavigate?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-50 flex flex-col md:hidden",
        className,
      )}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onNavigate}
        aria-hidden="true"
      />

      {/* Drawer surface */}
      <div className="relative z-10 flex h-full w-4/5 max-w-sm flex-col bg-card border-r shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-6 border-b">
          <Link
            href="/"
            onClick={onNavigate}
            className="font-bold text-lg text-foreground tracking-tight"
          >
            CG Tourism
          </Link>
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="cg-interactive rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        {/* Consumer Navigation Groups */}
        <div className="py-6 space-y-6 flex-1">
          {consumerNavigation.map((group) => (
            <div key={group.id} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="cg-interactive flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground/90 hover:bg-accent/15 hover:text-foreground transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.requiresAuth && (
                        <span className="text-[10px] uppercase font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                          Auth
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
          <Link
            href="/sos"
            onClick={onNavigate}
            className="cg-interactive flex items-center gap-2 text-destructive font-medium px-2 py-1.5"
          >
            <span>Emergency SOS & Safety</span>
          </Link>
          <div className="flex gap-4 px-2 pt-2 text-[11px]">
            <Link href="/about" onClick={onNavigate}>About</Link>
            <Link href="/accessibility" onClick={onNavigate}>Accessibility</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
