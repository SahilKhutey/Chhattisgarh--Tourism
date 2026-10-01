import Link from "next/link";
import { PrimaryNavigation } from "../Navigation/PrimaryNavigation";
import { SearchEntry } from "../SearchEntry/SearchEntry";
import { AccountEntry } from "../AccountEntry/AccountEntry";
import { TripEntry } from "../TripEntry/TripEntry";
import { cn } from "@/lib/ui/cn";

export interface DesktopHeaderProps {
  className?: string;
  authenticated?: boolean;
  activeTripCount?: number;
}

export function DesktopHeader({
  className,
  authenticated = false,
  activeTripCount,
}: DesktopHeaderProps) {
  return (
    <header className={cn("hidden border-b bg-background/95 backdrop-blur-xs md:block sticky top-0 z-40", className)}>
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        <Link
          href="/"
          aria-label="CG Tourism home"
          className="shrink-0 font-bold text-lg text-primary tracking-tight"
        >
          CG Tourism
        </Link>

        <PrimaryNavigation />

        <div className="ml-auto flex items-center gap-3">
          <SearchEntry />
          <TripEntry activeTripCount={activeTripCount} />
          <AccountEntry authenticated={authenticated} />
        </div>
      </div>
    </header>
  );
}
