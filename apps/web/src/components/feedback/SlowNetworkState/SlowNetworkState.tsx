import { cn } from "@/lib/ui/cn";

export interface SlowNetworkStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function SlowNetworkState({
  message = "This is taking a little longer than expected.",
  onRetry,
  className,
}: SlowNetworkStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center space-y-2",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80 focus:outline-hidden"
        >
          Check connection & retry
        </button>
      )}
    </div>
  );
}
