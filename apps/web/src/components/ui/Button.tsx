import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-forest-emerald text-sand-beige hover:bg-forest-emerald/90 focus:ring-forest-emerald",
    secondary:
      "border border-charcoal-stone/15 bg-white text-charcoal-stone hover:bg-sand-beige/40 focus:ring-charcoal-stone/20",
    ghost:
      "bg-transparent text-charcoal-stone hover:bg-black/5 focus:ring-charcoal-stone/10",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
