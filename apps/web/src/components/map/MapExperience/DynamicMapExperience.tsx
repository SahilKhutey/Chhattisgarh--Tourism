"use client";

import dynamic from "next/dynamic";
import { MapLoading } from "@/components/loading/MapLoading/MapLoading";
import type { MapExperienceProps } from "./MapExperience";

export const DynamicMapExperience = dynamic<MapExperienceProps>(
  () => import("./MapExperience").then((mod) => mod.MapExperience),
  {
    ssr: false,
    loading: () => <MapLoading className="h-[75vh] min-h-[500px]" />,
  },
);
