import { NavigationItem } from "./NavigationItem";
import { consumerNavigation } from "@/core/ui/shell/navigation";
import { cn } from "@/lib/ui/cn";

export interface PrimaryNavigationProps {
  className?: string;
}

export function PrimaryNavigation({ className }: PrimaryNavigationProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn("flex items-center gap-1", className)}
    >
      {consumerNavigation.map((group) => (
        <NavigationItem
          key={group.id}
          item={{
            id: group.id,
            label: group.label,
            href: group.items[0]?.href ?? "#",
            priority: "primary",
            audience: "consumer",
          }}
        />
      ))}
    </nav>
  );
}
