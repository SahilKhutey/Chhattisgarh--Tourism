import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export interface SearchEntryProps {
  className?: string;
}

export function SearchEntry({ className }: SearchEntryProps) {
  return (
    <Link
      href="/search"
      aria-label="Search CG Tourism"
      className={cn(
        "cg-interactive inline-flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors",
        className,
      )}
    >
      <svg
        className="h-4 w-4 shrink-0 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <span className="hidden sm:inline">Search destinations, experiences…</span>
      <span className="sm:hidden">Search</span>
    </Link>
  );
}
