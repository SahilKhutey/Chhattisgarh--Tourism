import { NavigationItem } from "./NavigationItem";
import type { ShellNavigationGroup } from "@/core/ui/shell/types";
import { cn } from "@/lib/ui/cn";

export interface SecondaryNavigationProps {
  group: ShellNavigationGroup;
  className?: string;
  onNavigate?: () => void;
}

export function SecondaryNavigation({
  group,
  className,
  onNavigate,
}: SecondaryNavigationProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {group.label}
      </h3>
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            onClick={onNavigate}
            className="w-full justify-start py-2"
          />
        ))}
      </div>
    </div>
  );
}
