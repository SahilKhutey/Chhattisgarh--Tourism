import type { ReactNode } from "react";

export type GridCols = 1 | 2 | 3 | 4 | 6 | 12;

export type GridProps = {
  children: ReactNode;
  cols?: GridCols;
  smCols?: GridCols;
  mdCols?: GridCols;
  lgCols?: GridCols;
  xlCols?: GridCols;
  gap?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
};

const colClasses: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const smColClasses: Record<GridCols, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const mdColClasses: Record<GridCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const lgColClasses: Record<GridCols, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const xlColClasses: Record<GridCols, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
};

const gapStyles: Record<NonNullable<GridProps["gap"]>, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
};

export function Grid({
  children,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = 4,
  className = "",
  as: Component = "div",
}: GridProps) {
  const baseCol = colClasses[cols] || "grid-cols-1";
  const smClass = smCols ? smColClasses[smCols] : "";
  const mdClass = mdCols ? mdColClasses[mdCols] : "";
  const lgClass = lgCols ? lgColClasses[lgCols] : "";
  const xlClass = xlCols ? xlColClasses[xlCols] : "";
  const gapClass = gapStyles[gap] || "gap-4";

  return (
    <Component
      className={[
        "grid",
        baseCol,
        smClass,
        mdClass,
        lgClass,
        xlClass,
        gapClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
