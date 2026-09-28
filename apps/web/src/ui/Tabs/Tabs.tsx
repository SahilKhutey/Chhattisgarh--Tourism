import { useState, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
};

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  className = "",
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id || "");
  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleSelect = (tabId: string) => {
    if (controlledTab === undefined) {
      setInternalTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === currentTab)?.content;

  return (
    <div className={["w-full flex flex-col space-y-4", className].join(" ")}>
      <div
        role="tablist"
        className="inline-flex h-11 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-fit max-w-full overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === currentTab;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              disabled={tab.disabled}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelect(tab.id)}
              className={[
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isSelected
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:text-foreground hover:bg-background/50",
                tab.disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const isSelected = tab.id === currentTab;
        if (!isSelected) return null;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
