import type { ReactNode } from "react";
import { Button } from "../Button";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50",
        className,
      ].join(" ")}
    >
      {icon && <div className="mb-4 text-muted-foreground text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="outline" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
