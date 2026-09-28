import { useEffect, type ReactNode } from "react";

export type DrawerPosition = "left" | "right" | "bottom";

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: DrawerPosition;
  children: ReactNode;
  className?: string;
};

const positionStyles: Record<DrawerPosition, string> = {
  left: "left-0 top-0 bottom-0 w-80 max-w-[85vw] border-r border-border h-full",
  right: "right-0 top-0 bottom-0 w-80 max-w-[85vw] border-l border-border h-full",
  bottom: "left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-border w-full",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  position = "right",
  children,
  className = "",
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Panel"}
        className={[
          "fixed bg-card p-6 text-card-foreground shadow-2xl transition-transform overflow-y-auto",
          positionStyles[position],
          className,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
          {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
