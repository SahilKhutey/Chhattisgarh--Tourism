import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/40",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground/80 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
