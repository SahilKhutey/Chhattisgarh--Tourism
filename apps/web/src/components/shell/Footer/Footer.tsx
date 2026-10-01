import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("mt-auto border-t bg-muted/20 text-muted-foreground", className)}>
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-bold text-foreground text-base tracking-tight">
            CG Tourism OS
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Digitizing Chhattisgarh's sacred narratives, natural bio-reserves, and heritage corridors.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-foreground text-sm">
            Discover
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/discover" className="hover:text-foreground transition-colors">
              Destinations
            </Link>
            <Link href="/experiences" className="hover:text-foreground transition-colors">
              Experiences
            </Link>
            <Link href="/explore" className="hover:text-foreground transition-colors">
              Corridors
            </Link>
            <Link href="/map" className="hover:text-foreground transition-colors">
              Interactive Map
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-foreground text-sm">
            Plan & Travel
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/planner" className="hover:text-foreground transition-colors">
              Plan a Trip
            </Link>
            <Link href="/bookmarks" className="hover:text-foreground transition-colors">
              Saved Places
            </Link>
            <Link href="/stories" className="hover:text-foreground transition-colors">
              Stories & Folklore
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-foreground text-sm">
            Safety & Information
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/sos" className="hover:text-destructive font-medium transition-colors">
              Emergency SOS
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About Chhattisgarh
            </Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs">
        <p>© {new Date().getFullYear()} Chhattisgarh Tourism Board. All rights reserved.</p>
      </div>
    </footer>
  );
}
