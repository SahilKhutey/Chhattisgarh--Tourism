import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface RouteTransitionProps {
  children: ReactNode;
  className?: string;
  isNavigating?: boolean;
}

export function RouteTransition({
  children,
  className,
  isNavigating = false,
}: RouteTransitionProps) {
  return (
    <div
      aria-busy={isNavigating}
      className={cn(
        "cg-route-transition",
        isNavigating && "cg-route-navigating",
        className,
      )}
    >
      {children}
    </div>
  );
}
