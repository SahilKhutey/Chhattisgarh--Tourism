"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { consumerNavigation } from "@/core/ui/navigation/navigation";
import { NavigationGroup } from "@/core/ui/navigation/types";
import { NavigationLink } from "./NavigationLink";
import { IconButton } from "@/components/ui/IconButton";
import { Separator } from "@/components/ui/Separator";
import { cn } from "@/lib/ui/cn";

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  groups?: NavigationGroup[];
}

export function MobileNavigation({
  isOpen,
  onClose,
  groups = consumerNavigation,
}: MobileNavigationProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 md:hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "relative z-10 w-full max-w-xs h-full bg-background border-l border-border shadow-2xl",
          "flex flex-col overflow-y-auto p-6 cg-mobile-menu"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CG
            </span>
            <span className="font-semibold text-foreground text-sm">
              Chhattisgarh Tourism
            </span>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            label="Close menu"
            onClick={onClose}
          >
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
          </IconButton>
        </div>

        {/* Navigation Groups */}
        <nav aria-label="Mobile Navigation Links" className="flex-1 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                {group.label}
              </h4>
              <ul className="space-y-1 list-none p-0 m-0">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <NavigationLink
                      href={item.href}
                      exact={item.exact}
                      onClick={onClose}
                      className="w-full justify-start text-sm py-2.5 px-3 rounded-lg"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground font-normal line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </NavigationLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-border mt-auto space-y-2">
          <Link
            href="/safety"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Emergency SOS / Safety
          </Link>
        </div>
      </div>
    </div>
  );
}
