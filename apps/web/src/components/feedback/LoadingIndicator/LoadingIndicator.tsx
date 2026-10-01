import type { HTMLAttributes } from "react";
import { Spinner, SpinnerSize } from "@/components/ui/Spinner";
import { cn } from "@/lib/ui/cn";

export interface LoadingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: SpinnerSize;
  className?: string;
  fullscreen?: boolean;
}

export function LoadingIndicator({
  message = "Loading…",
  size = "md",
  className = "",
  fullscreen = false,
  ...props
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-8 gap-3 text-center",
        fullscreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-xs",
        className
      )}
      {...props}
    >
      <Spinner size={size} label={message} />
      {message && (
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
