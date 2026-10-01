"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { useReducedMotion } from "@/core/ui/motion/preferences";

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export function Reveal({
  children,
  className = "",
  threshold = 0.1,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, threshold]);

  return (
    <div
      ref={ref}
      className={cn(visible && "cg-motion-reveal", className)}
      {...props}
    >
      {children}
    </div>
  );
}
