import { useEffect, type ReactNode } from "react";

export type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
}: DialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        className={[
          "relative w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl",
          "focus:outline-none",
          className,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-1.5 pb-4">
          <h2 id="dialog-title" className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}
