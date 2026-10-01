import type { ReactNode } from "react";
import { SkipToContent } from "./SkipToContent";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { BottomNavigation } from "../BottomNavigation/BottomNavigation";
import { cn } from "@/lib/ui/cn";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  hideBottomNav?: boolean;
  authenticated?: boolean;
  activeTripCount?: number;
}

export function AppShell({
  children,
  className,
  hideBottomNav = false,
  authenticated = false,
  activeTripCount,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <SkipToContent />

      <Header authenticated={authenticated} activeTripCount={activeTripCount} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-h-[60vh] pb-16 md:pb-0 focus:outline-hidden"
      >
        {children}
      </main>

      <Footer />

      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
}
