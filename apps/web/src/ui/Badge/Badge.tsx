import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-foreground bg-transparent",
  success: "bg-emerald-700 text-white",
  warning: "bg-amber-600 text-white",
  danger: "bg-red-700 text-white",
  info: "bg-sky-700 text-white",
};

export function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        badgeVariants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
