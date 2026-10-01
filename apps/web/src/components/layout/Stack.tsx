import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type StackProps = {
  children: ReactNode;
  className?: string;
  gap?: "2" | "4" | "6" | "8";
};

const gapClasses = {
  "2": "gap-2",
  "4": "gap-4",
  "6": "gap-6",
  "8": "gap-8",
};

export function Stack({
  children,
  className,
  gap = "4",
}: StackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gapClasses[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}
