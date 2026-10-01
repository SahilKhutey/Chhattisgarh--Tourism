import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type SectionProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
};

export function Section({
  children,
  className,
  as: Component = "section",
}: SectionProps) {
  return (
    <Component
      className={cn(
        "w-full py-10 sm:py-14 lg:py-20",
        className,
      )}
    >
      {children}
    </Component>
  );
}
