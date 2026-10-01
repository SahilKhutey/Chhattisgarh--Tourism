import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/ui/cn";

export interface SearchLoadingProps {
  isFetching?: boolean;
  label?: string;
  className?: string;
}

export function SearchLoading({
  isFetching = true,
  label = "Searching destinations and experiences…",
  className,
}: SearchLoadingProps) {
  if (!isFetching) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex items-center gap-2 py-2 text-xs text-muted-foreground", className)}
    >
      <Spinner size="sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
