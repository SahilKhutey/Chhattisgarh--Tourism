import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-charcoal-stone/10",
        "bg-white shadow-sm",
        "overflow-hidden",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
