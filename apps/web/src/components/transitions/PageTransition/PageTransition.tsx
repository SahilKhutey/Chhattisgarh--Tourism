import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className,
}: PageTransitionProps) {
  return (
    <div
      className={cn(
        "cg-page-transition",
        className,
      )}
    >
      {children}
    </div>
  );
}
