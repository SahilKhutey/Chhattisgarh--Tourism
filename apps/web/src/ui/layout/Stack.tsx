import type { ReactNode } from "react";

export type StackProps = {
  children: ReactNode;
  direction?: "row" | "col";
  gap?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  className?: string;
  as?: "div" | "ul" | "ol" | "nav";
};

const gapStyles: Record<NonNullable<StackProps["gap"]>, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
};

const alignStyles: Record<NonNullable<StackProps["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyStyles: Record<NonNullable<StackProps["justify"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export function Stack({
  children,
  direction = "col",
  gap = 4,
  align,
  justify,
  className = "",
  as: Component = "div",
}: StackProps) {
  const dirClass = direction === "row" ? "flex flex-row" : "flex flex-col";
  const gapClass = gapStyles[gap] || "gap-4";
  const alignClass = align ? alignStyles[align] : "";
  const justifyClass = justify ? justifyStyles[justify] : "";

  return (
    <Component
      className={[dirClass, gapClass, alignClass, justifyClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
