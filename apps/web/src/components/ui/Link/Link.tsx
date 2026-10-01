import type { ComponentPropsWithoutRef, ReactNode } from "react";
import NextLink from "next/link";
import { cn } from "@/lib/ui/cn";

export type LinkVariant = "default" | "subtle" | "primary" | "nav" | "unstyled";

export interface LinkProps extends ComponentPropsWithoutRef<typeof NextLink> {
  children: ReactNode;
  variant?: LinkVariant;
  external?: boolean;
  active?: boolean;
  className?: string;
}

const variantStyles: Record<LinkVariant, string> = {
  default:
    "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
  subtle:
    "text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-primary",
  primary:
    "text-foreground font-medium hover:text-primary transition-colors focus-visible:ring-primary",
  nav: "text-foreground/80 hover:text-foreground font-medium transition-colors focus-visible:ring-primary",
  unstyled: "",
};

export function Link({
  children,
  href,
  variant = "default",
  external,
  active,
  className = "",
  ...props
}: LinkProps) {
  const isExternal =
    external ??
    (typeof href === "string" && (href.startsWith("http://") || href.startsWith("https://")));

  const commonClasses = cn(
    variant !== "unstyled" &&
      "inline-flex items-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    variantStyles[variant],
    active && "text-primary font-semibold",
    className
  );

  if (isExternal) {
    return (
      <a
        href={typeof href === "string" ? href : href.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={commonClasses}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </NextLink>
  );
}
