import type { HTMLAttributes } from "react";

export type SkeletonVariant = "text" | "circular" | "rectangular";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
  className?: string;
};

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded",
  circular: "rounded-full",
  rectangular: "rounded-md",
};

export function Skeleton({
  variant = "rectangular",
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse bg-muted/80",
        variantStyles[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
