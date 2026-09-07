import { ReactNode } from "react";
import { Compass } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-charcoal-stone/15 p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest-emerald/5 text-forest-emerald">
        {icon || <Compass className="h-6 w-6" />}
      </div>

      <h3 className="text-lg font-semibold text-charcoal-stone">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-stone/60">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
