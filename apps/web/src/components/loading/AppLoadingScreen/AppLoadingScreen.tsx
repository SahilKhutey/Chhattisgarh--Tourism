import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/ui/cn";

export interface AppLoadingScreenProps {
  label?: string;
  className?: string;
}

export function AppLoadingScreen({
  label = "Loading CG Tourism",
  className,
}: AppLoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex min-h-screen items-center justify-center bg-background",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
