import type { ReactNode } from "react";
import { Container } from "./Container";

export type SectionProps = {
  children: ReactNode;
  className?: string;
  container?: boolean;
};

export function Section({
  children,
  className = "",
  container = true,
}: SectionProps) {
  const content = (
    <section className={`py-10 sm:py-14 lg:py-20 ${className}`}>
      {children}
    </section>
  );

  return container ? <Container>{content}</Container> : content;
}
