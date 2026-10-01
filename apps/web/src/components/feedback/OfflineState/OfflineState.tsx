import { cn } from "@/lib/ui/cn";

export interface OfflineStateProps {
  message?: string;
  cachedDataAvailable?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({
  message = "You're offline. Showing saved tourism information.",
  cachedDataAvailable = true,
  onRetry,
  className,
}: OfflineStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-2 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">{message}</p>
      {cachedDataAvailable ? (
        <p className="text-xs text-muted-foreground">
          Cached data is available for offline browsing. Live updates will resume once connected.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Connect to the internet to load this content.
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80 focus:outline-hidden"
        >
          Retry connection
        </button>
      )}
    </div>
  );
}
