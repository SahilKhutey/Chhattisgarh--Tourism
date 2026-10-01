"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchEntry } from "../SearchEntry/SearchEntry";
import { MobileNavigation } from "../Navigation/MobileNavigation";
import { cn } from "@/lib/ui/cn";

export interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "border-b bg-background/95 backdrop-blur-xs md:hidden sticky top-0 z-40",
          className,
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
            className="cg-interactive rounded-md p-2 text-foreground"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {open ? "×" : "☰"}
            </span>
          </button>

          <Link href="/" className="font-bold text-base text-primary tracking-tight">
            CG Tourism
          </Link>

          <SearchEntry />
        </div>
      </header>

      {open && (
        <MobileNavigation
          id="mobile-navigation"
          onNavigate={() => setOpen(false)}
        />
      )}
    </>
  );
}
