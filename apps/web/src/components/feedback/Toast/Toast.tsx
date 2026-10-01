import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { IconButton } from "@/components/ui/IconButton";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  title?: string;
  type?: ToastType;
  icon?: ReactNode;
  onDismiss?: () => void;
  isExiting?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const typeStyles: Record<ToastType, string> = {
  info: "border-border bg-card text-card-foreground shadow-lg",
  success: "border-emerald-700/30 bg-emerald-950/20 text-foreground shadow-lg",
  warning: "border-amber-600/30 bg-amber-950/20 text-foreground shadow-lg",
  error: "border-destructive/30 bg-destructive/10 text-foreground shadow-lg",
};

const iconTypeColors: Record<ToastType, string> = {
  info: "text-primary",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-destructive",
};

export function Toast({
  message,
  title,
  type = "info",
  icon,
  onDismiss,
  isExiting = false,
  action,
  className = "",
  ...props
}: ToastProps) {
  const isAlert = type === "error" || type === "warning";

  return (
    <div
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border max-w-sm w-full select-none",
        isExiting ? "cg-toast-exit" : "cg-toast-enter",
        typeStyles[type],
        className
      )}
      {...props}
    >
      {/* Icon */}
      <div className={cn("shrink-0 mt-0.5", iconTypeColors[type])}>
        {icon || (
          type === "success" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : type === "error" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : type === "warning" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          )
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="font-semibold text-sm leading-tight text-foreground">
            {title}
          </h5>
        )}
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <IconButton
          variant="ghost"
          size="sm"
          label="Dismiss notification"
          onClick={onDismiss}
          className="h-7 w-7 -mr-1 -mt-1 text-muted-foreground hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      )}
    </div>
  );
}
