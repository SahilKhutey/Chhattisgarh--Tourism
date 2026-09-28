import type { ReactNode } from "react";
import { Container } from "./Container";

export type PageProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export function Page({
  children,
  className = "",
  fullWidth = false,
}: PageProps) {
  const content = (
    <main
      id="main-content"
      className={[
        "min-h-[calc(100vh-4rem)] w-full py-6 sm:py-8 lg:py-12",
        className,
      ].join(" ")}
    >
      {children}
    </main>
  );

  return fullWidth ? content : <Container>{content}</Container>;
}
