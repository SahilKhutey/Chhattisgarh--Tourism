import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Stagger({ children, className = "", ...props }: StaggerProps) {
  return (
    <div className={cn("cg-stagger", className)} {...props}>
      {children}
    </div>
  );
}
