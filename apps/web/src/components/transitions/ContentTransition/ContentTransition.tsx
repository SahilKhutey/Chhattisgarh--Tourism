import type { ReactNode } from "react";
import type { TransitionType } from "@/core/ui/transitions/types";
import { cn } from "@/lib/ui/cn";

export interface ContentTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  className?: string;
}

export function ContentTransition({
  children,
  type = "slide-up",
  className,
}: ContentTransitionProps) {
  const transitionClass =
    type === "fade"
      ? "cg-transition-fade"
      : type === "slide-up"
      ? "cg-transition-slide-up"
      : type === "slide-down"
      ? "cg-transition-slide-down"
      : type === "scale"
      ? "cg-transition-scale"
      : type === "crossfade"
      ? "cg-transition-crossfade"
      : "";

  return (
    <div
      className={cn(
        "cg-content-transition",
        transitionClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
