import type { ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
