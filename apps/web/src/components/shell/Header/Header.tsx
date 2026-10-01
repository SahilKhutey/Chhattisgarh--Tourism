import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export interface HeaderProps {
  className?: string;
  authenticated?: boolean;
  activeTripCount?: number;
}

export function Header({
  className,
  authenticated = false,
  activeTripCount,
}: HeaderProps) {
  return (
    <>
      <DesktopHeader
        className={className}
        authenticated={authenticated}
        activeTripCount={activeTripCount}
      />
      <MobileHeader className={className} />
    </>
  );
}
