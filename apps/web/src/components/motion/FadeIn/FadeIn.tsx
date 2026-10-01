import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function FadeIn({ children, className = "", ...props }: FadeInProps) {
  return (
    <div className={cn("cg-motion-fade-in", className)} {...props}>
      {children}
    </div>
  );
}
