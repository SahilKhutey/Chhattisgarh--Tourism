import { Button } from "../Button";

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  retryText = "Try Again",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={[
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-card-foreground",
        className,
      ].join(" ")}
    >
      <div className="mb-3 text-red-600 text-3xl">⚠️</div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      {message && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
}
