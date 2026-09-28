import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90",
  outline:
    "border border-border bg-background hover:bg-muted",
  ghost:
    "bg-transparent hover:bg-muted",
  danger:
    "bg-destructive text-destructive-foreground hover:opacity-90",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex min-h-11 items-center justify-center",
        "rounded-md px-4 py-2 text-sm font-medium",
        "transition-opacity focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        disabled || loading ? "cursor-not-allowed opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
