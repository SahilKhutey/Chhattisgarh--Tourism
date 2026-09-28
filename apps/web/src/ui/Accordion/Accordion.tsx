import { useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
};

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  className = "",
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggle = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((item) => item !== id));
    } else {
      setExpandedIds(allowMultiple ? [...expandedIds, id] : [id]);
    }
  };

  return (
    <div className={["divide-y divide-border border-y border-border", className].join(" ")}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        const triggerId = `accordion-trigger-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="py-2">
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between py-3 text-left font-medium text-foreground transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                <span>{item.title}</span>
                <span
                  className={[
                    "ml-4 transform transition-transform duration-200 text-muted-foreground",
                    isExpanded ? "rotate-180" : "",
                  ].join(" ")}
                >
                  ▼
                </span>
              </button>
            </h3>
            {isExpanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="pb-4 pt-1 text-sm text-muted-foreground leading-relaxed"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
