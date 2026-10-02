import type { HTMLAttributes, ReactNode } from "react";
import { ErrorState } from "../ErrorState/ErrorState";

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  error?: Error | unknown;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  icon,
  className = "",
}: ErrorMessageProps) {
  return (
    <ErrorState
      title={title}
      description={message}
      onRetry={onRetry}
      retryLabel={retryLabel}
      icon={icon}
      className={className}
    />
  );
}
