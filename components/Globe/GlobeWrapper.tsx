"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { GlobeViewHandle } from "./GlobeView";
import type { GlobePoint, GlobeArc, AircraftPosition } from "@/lib/types";
import { forwardRef } from "react";

interface GlobeWrapperProps {
  points?: GlobePoint[];
  arcs?: GlobeArc[];
  aircraft?: AircraftPosition[];
  lowPowerMode?: boolean;
  onPointClick?: (point: GlobePoint) => void;
  className?: string;
}

const GlobeViewDynamic = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#08090c]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          <p className="text-xs text-[#475569] font-body">Loading globe...</p>
        </div>
      </div>
    ),
  }
);

export { GlobeViewDynamic as GlobeWrapper };
