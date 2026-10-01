import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type GridProps = {
  children: ReactNode;
  className?: string;
};

export function Grid({
  children,
  className,
}: GridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
