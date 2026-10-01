import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface ScaleInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function ScaleIn({ children, className = "", ...props }: ScaleInProps) {
  return (
    <div className={cn("cg-motion-scale-in", className)} {...props}>
      {children}
    </div>
  );
}
