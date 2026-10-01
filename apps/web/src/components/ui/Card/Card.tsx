import type { HTMLAttributes, ReactNode, ElementType } from "react";
import { cn } from "@/lib/ui/cn";

export type CardVariant = "default" | "elevated" | "outline" | "interactive";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "border border-border bg-card text-card-foreground shadow-sm",
  elevated:
    "border border-border/60 bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200",
  outline:
    "border-2 border-border bg-transparent text-card-foreground",
  interactive:
    "cg-card-interactive border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 cursor-pointer",
};

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function CardHeader({
  children,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
}

export function CardTitle({
  children,
  as: Component = "h3",
  className = "",
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "font-semibold leading-tight tracking-tight text-xl text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = "",
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function CardContent({
  children,
  className = "",
  ...props
}: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0 gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
