import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outline";
};

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "border border-border bg-card text-card-foreground shadow-sm",
    elevated: "border border-border/60 bg-card text-card-foreground shadow-md hover:shadow-lg",
    outline: "border-2 border-border bg-transparent text-card-foreground",
  };

  return (
    <div
      className={[
        "rounded-xl transition-shadow duration-200 overflow-hidden",
        variantStyles[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["flex flex-col space-y-1.5 p-6", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={[
        "font-semibold leading-none tracking-tight text-xl text-foreground",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={["text-sm text-muted-foreground leading-relaxed", className].join(" ")}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-6 pt-0", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["flex items-center p-6 pt-0 gap-3", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
