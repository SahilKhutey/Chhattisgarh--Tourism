"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { DesktopNavigation } from "./DesktopNavigation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileNavigation } from "./MobileNavigation";

export interface AppHeaderProps {
  className?: string;
  showSos?: boolean;
}

export function AppHeader({ className = "", showSos = true }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md transition-colors",
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg font-bold text-lg md:text-xl tracking-tight text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Chhattisgarh Tourism Home"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold shadow-sm">
                  CG
                </span>
                <span className="hidden sm:inline-block font-semibold">
                  Chhattisgarh <span className="text-primary font-bold">Tourism</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <DesktopNavigation />

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {showSos && (
                <Link
                  href="/safety"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  SOS / Safety
                </Link>
              )}

              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => {
                  window.location.href = "/planner";
                }}
              >
                Plan Trip
              </Button>

              {/* Mobile Menu Trigger */}
              <IconButton
                variant="ghost"
                size="sm"
                label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                className="md:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
