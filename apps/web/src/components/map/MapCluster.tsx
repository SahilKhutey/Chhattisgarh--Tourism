"use client";

import { ReactNode } from "react";

interface MapClusterProps {
  children: ReactNode;
}

/**
 * High-performance container for grouped map markers.
 */
export function MapCluster({ children }: MapClusterProps) {
  return <>{children}</>;
}
