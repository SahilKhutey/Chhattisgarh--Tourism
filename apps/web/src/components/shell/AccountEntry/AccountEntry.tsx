import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export interface AccountEntryProps {
  authenticated?: boolean;
  className?: string;
}

export function AccountEntry({
  authenticated = false,
  className,
}: AccountEntryProps) {
  if (!authenticated) {
    return (
      <Link
        href="/login"
        className={cn(
          "cg-interactive rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors",
          className,
        )}
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="Account profile"
      className={cn(
        "cg-interactive inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors",
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
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
      <span>Account</span>
    </Link>
  );
}
