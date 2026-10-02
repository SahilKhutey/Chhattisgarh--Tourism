import { ReactNode } from "react";
import { EmptyState as CanonicalEmptyState } from "@/components/feedback/EmptyState";

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
    <CanonicalEmptyState
      title={title}
      description={description}
      action={action}
      icon={icon}
      className="my-8"
    />
  );
}
