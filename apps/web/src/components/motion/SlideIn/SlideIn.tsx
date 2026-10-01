import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { MotionDirection } from "@/core/ui/motion/types";

export interface SlideInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: MotionDirection;
  className?: string;
}

const directionClasses: Record<MotionDirection, string> = {
  up: "cg-motion-slide-up",
  down: "cg-motion-slide-down",
  left: "cg-motion-slide-left",
  right: "cg-motion-slide-right",
};

export function SlideIn({
  children,
  direction = "up",
  className = "",
  ...props
}: SlideInProps) {
  return (
    <div className={cn(directionClasses[direction], className)} {...props}>
      {children}
    </div>
  );
}
