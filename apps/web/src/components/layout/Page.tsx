import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type PageProps = {
  children: ReactNode;
  className?: string;
};

export function Page({
  children,
  className,
}: PageProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-background text-foreground",
        className,
      )}
    >
      {children}
    </main>
  );
}
